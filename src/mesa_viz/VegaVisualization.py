# -*- coding: utf-8 -*-
"""
VegaServer
=============

A visualization server which renders a model according to a vega(-lite) specification.

This is a modified copy of the standard ModularVisualization server.
See it's documentation for a basic understanding of how it works.
Instead of providing VisualizationElements directly this server only works with
vega(-lite) specifications.

It's API allows for an additional "n_simulations" paremeter that lets you run
multiple simulations side-by-side. All simulations are interactive and you can implement
a "on_click" method in your model class to respond to clicks. Every click passes the
underlying visualization data to your "on-click" function.
"""
import copy
import os
import pickle
import webbrowser

from typing import Dict, Optional, List, Awaitable, Any, Union, TYPE_CHECKING

import tornado.autoreload
import tornado.escape
import tornado.gen
import tornado.ioloop
import tornado.web
import tornado.websocket

from .UserParam import UserSettableParameter


if TYPE_CHECKING:
    from mesa.model import Model


class PageHandler(tornado.web.RequestHandler):
    """ Handler for the HTML template which holds the visualization. """

    application: "VegaServer"

    def get(self) -> None:
        self.render(
            "index_template.html",
            port=self.application.port,
            model_name=self.application.model_name,
            description=self.application.description,
        )


class SocketHandler(tornado.websocket.WebSocketHandler):
    application: "VegaServer"
    current_step = 0

    def open(self, *args: str, **kwargs: str) -> Optional[Awaitable[None]]:
        self.set_nodelay(True)
        # self.states: List[str] = []
        if self.application.verbose:
            print("Socket opened!")

        self.write_message(
            {
                "type": "vega_specs",
                "data": self.application.vega_specifications,
                "n_sims": self.application.n_simulations,
            }
        )
        return None

    def on_message(self, message: Union[str, bytes]) -> Optional[Awaitable[None]]:
        """ Receiving a message from the websocket, parse, and act accordingly.

        """
        msg = tornado.escape.json_decode(message)
        if self.application.verbose:
            print(msg)

        response_function = getattr(self, msg["type"], None)

        if response_function:
            response_function(**msg["data"])
        elif self.application.verbose:
            print("Unexpected message!")

    def current_state(self, step: int) -> str:
        return tornado.escape.json_encode(
            {
                "type": "model_state",
                "data": [model.as_json() for model in self.application.models],
                "step": step,
            }
        )

    def get_state(self, step: int) -> None:
        self.write_message(self.states[step])

    def submit_params(self, model: int, param: str, value: Any) -> None:
        """Submit model parameters."""

        # Is the param editable?
        self.application.model_kwargs[model][param].value = value

    def reset(self) -> None:
        self.application.reset_models()
        self.states = []
        self.write_message(
            {"type": "model_params", "params": self.application.user_params}
        )
        self.current_step = 0
        self.step(0)

    def step(self, step: int) -> None:
        if step < self.current_step:
            self.application.restore_state(max(step - 1, 0))

        elif step > self.current_step:
            self.application.step()

        state = self.current_state(step)
        self.states.append(state)
        self.write_message(state)

        if not any([model.running for model in self.application.models]):
            self.write_message({"type": "end"})
        self.application.step()
        self.current_step = step + 1

    def call_method(self, model_id: int, data: Dict[str, Any]) -> None:
        self.current_step -= 1
        self.application.restore_state(self.current_step)
        self.states = self.states[: self.current_step]

        model = self.application.models[model_id]
        try:
            method = getattr(model, "on_click")
            method(**data)
        except (AttributeError, TypeError):
            pass

        self.step(self.current_step)

    def key_press(self, model_id: int, data: Dict[str, Any]) -> None:
        self.current_step -= 1
        self.application.restore_state(self.current_step)
        self.states = self.states[: self.current_step]

        model = self.application.models[model_id]
        try:
            method = getattr(model, "on_key")
            method(**data)
        except (AttributeError, TypeError):
            pass

        self.step(self.current_step)


class VegaServer(tornado.web.Application):
    """ Main visualization application. """

    verbose = True

    port = 3000  # Default port to listen on
    max_steps = 100000

    # Handlers and other globals:
    page_handler = (r"/", PageHandler)
    socket_handler = (r"/ws", SocketHandler)
    static_handler = (
        r"/(.*)",
        tornado.web.StaticFileHandler,
        {"path": "../../"},
    )

    handlers = [page_handler, socket_handler, static_handler]

    settings = {
        "debug": False,
        "template_path": os.path.dirname(__file__),
    }

    EXCLUDE_LIST = ("width", "height")

    def __init__(
        self,
        model_cls: Any,
        vega_specifications: List[str],
        name: str = "Mesa Model",
        model_params: Optional[Dict[str, Any]] = None,
        n_simulations: int = 1,
    ):
        """ Create a new visualization server with the given elements. """
        # Prep visualization elements:
        self.vega_specifications = vega_specifications

        # Initializing the model
        self.model_name = name
        self.model_cls = model_cls
        self.description = "No description available"
        if hasattr(model_cls, "description"):
            self.description = model_cls.description
        elif model_cls.__doc__ is not None:
            self.description = model_cls.__doc__

        self.n_simulations = n_simulations

        if model_params is None:
            model_params = {}

        self.model_params = model_params

        self.model_kwargs = [
            copy.deepcopy(self.model_params) for _ in range(n_simulations)
        ]
        self.reset_models()

        # Initializing the application itself:
        super().__init__(self.handlers, "", [], **self.settings)

    @property
    def user_params(self) -> List[Dict[str, Any]]:
        result = []
        for param, val in self.model_params.items():
            if isinstance(val, UserSettableParameter):
                setattr(val, "parameter", param)
                setattr(
                    val,
                    "model_values",
                    [kwargs[param].value for kwargs in self.model_kwargs],
                )
                result.append(val.json)
        return result

    def step(self) -> None:
        """Advance all models by one step.
        """
        self.pickles[self.current_step] = pickle.dumps(self.models)
        for model in self.models:
            model.step()
        self.current_step += 1

    def restore_state(self, step: int) -> None:
        self.models = pickle.loads(self.pickles[step])
        self.current_step = step

    def reset_models(self) -> None:
        """ Reinstantiate the model object, using the current parameters. """

        self.models = []
        self.pickles = {}
        for i in range(self.n_simulations):
            model_params = {}
            for key, val in self.model_kwargs[i].items():
                if isinstance(val, UserSettableParameter):
                    if (
                        val.param_type == "static_text"
                    ):  # static_text is never used for setting params
                        continue
                    model_params[key] = val.value
                else:
                    model_params[key] = val
            self.models.append(self.model_cls(**model_params))
            self.current_step = 0

    def launch(self, port: Optional[int] = None) -> None:
        """ Run the app. """
        if port is not None:
            self.port = port
        url = "http://127.0.0.1:{PORT}".format(PORT=self.port)
        print("Interface starting at {url}".format(url=url))
        self.listen(self.port)
        webbrowser.open(url)
        tornado.autoreload.start()
        tornado.ioloop.IOLoop.current().start()
