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
import asyncio
import copy
import json
import os
import pickle
import webbrowser
from typing import TYPE_CHECKING, Any, Awaitable, Dict, List, Optional, Union

import tornado.autoreload
import tornado.escape
import tornado.gen
import tornado.ioloop
import tornado.web
import tornado.websocket

from .UserParam import UserSettableParameter
from .VegaSpec import VegaChart

if TYPE_CHECKING:
    from mesa.model import Model

asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


def get_properties(obj):
    return {
        key: getattr(obj, key)
        for key, value in obj.__class__.__dict__.items()
        if type(value) == property
    }


def as_json(model: "Model"):

    model_has_dict = getattr(model, "as_dict", None)
    if model_has_dict:
        model_data = model.as_dict()
    else:
        model_data = {**model.__dict__, **get_properties(model)}

    agent_has_dict = getattr(model.schedule.agents[0], "as_dict", None)
    if agent_has_dict:
        agent_data = [agent.as_dict() for agent in model.schedule.agents]
    else:
        agent_data = [
            {**agent.__dict__, **get_properties(agent)}
            for agent in model.schedule.agents
        ]

    model_data.update({"agents": agent_data})
    return json.dumps(model_data, default=lambda a: str(a))


class PageHandler(tornado.web.RequestHandler):
    """ Handler for the HTML template which holds the visualization. """

    application: "VegaServer"

    def get(self, *args: Any) -> None:
        self.render(
            "index_template.html",
            port=self.application.port,
            model_name=self.application.model_name,
            description=self.application.description,
        )


class ModelRunner:
    current_step = 0
    models: List["Model"] = []

    def __init__(self, application: "VegaServer", socket_handler: "SocketHandler"):
        self.application = application
        self.socket_handler = socket_handler
        self.reset_models()

    def current_state(self, step: int) -> str:
        return tornado.escape.json_encode(
            {
                "type": "model_state",
                "data": [as_json(model) for model in self.models],
                "step": step,
            }
        )

    def get_state(self, step: int) -> None:
        self.socket_handler.write_message(self.states[step])

    def submit_params(self, model: int, param: str, value: Any) -> None:
        """Submit model parameters."""

        # Is the param editable?
        self.application.model_kwargs[model][param].value = value

    async def reset(self) -> None:
        self.reset_models()
        self.states = []
        self.socket_handler.write_message(
            {"type": "model_params", "params": self.user_params}
        )
        self.current_step = 0
        await self.step(0)

    async def step(self, step: int) -> None:
        if step < self.current_step:
            self.restore_state(max(step - 1, 0))

        elif step > self.current_step:
            self.step_ahead()

        state = self.current_state(step)
        self.states.append(state)
        self.socket_handler.write_message(state)

        if not any([model.running for model in self.models]):
            self.socket_handler.write_message({"type": "end"})
        else:
            self.step_ahead()
            self.current_step = step + 1

    async def call_method(self, model_id: int, data: Dict[str, Any]) -> None:
        self.current_step -= 1
        self.restore_state(self.current_step)
        self.states = self.states[: self.current_step]

        model = self.models[model_id]
        try:
            model.on_click(**data)
        except (AttributeError, TypeError):
            pass

        await self.step(self.current_step)

    async def key_press(self, model_id: int, data: Dict[str, Any]) -> None:
        self.current_step -= 1
        self.restore_state(self.current_step)
        self.states = self.states[: self.current_step]

        model = self.models[model_id]
        try:
            model.on_key(**data)
        except (AttributeError, TypeError):
            pass

        await self.step(self.current_step)

    @property
    def user_params(self) -> List[Dict[str, Any]]:
        result = []
        for param, val in self.application.model_params.items():
            if isinstance(val, UserSettableParameter):
                val.parameter = param
                val.model_values = [
                    kwargs[param].value for kwargs in self.application.model_kwargs
                ]
                result.append(val.json)
        return result

    def step_ahead(self) -> None:
        """Advance all models by one step."""
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
        for i in range(self.application.n_simulations):
            model_params = {}
            for key, val in self.application.model_kwargs[i].items():
                if isinstance(val, UserSettableParameter):
                    if (
                        val.param_type == "static_text"
                    ):  # static_text is never used for setting params
                        continue
                    model_params[key] = val.value
                else:
                    model_params[key] = val
            self.models.append(self.application.model_cls(**model_params))
            self.current_step = 0


class SocketHandler(tornado.websocket.WebSocketHandler):
    application: "VegaServer"

    def open(self, *args: str, **kwargs: str) -> Optional[Awaitable[None]]:
        self.set_nodelay(True)
        # self.states: List[str] = []
        if self.application.verbose:
            print("Socket opened!")
        self.model_runner = ModelRunner(self.application, self)

        self.write_message(
            {
                "type": "vega_specs",
                "data": self.application.vega_specifications,
                "n_sims": self.application.n_simulations,
            }
        )
        return None

    async def on_message(self, message: Union[str, bytes]) -> Optional[Awaitable[None]]:
        """Receiving a message from the websocket, parse, and act accordingly."""
        msg = tornado.escape.json_decode(message)
        if self.application.verbose:
            print(msg)

        response_function = getattr(self.model_runner, msg["type"], None)

        if response_function:
            loop = asyncio.get_event_loop()
            loop.create_task(response_function(**msg["data"]))
        elif self.application.verbose:
            print("Unexpected message!")


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
        {"path": os.path.dirname(os.path.dirname(os.path.dirname(__file__)))},
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
        vega_specifications: List[Union[str, VegaChart]],
        name: str = "Mesa Model",
        model_params: Optional[Dict[str, Any]] = None,
        n_simulations: int = 1,
    ):
        """ Create a new visualization server with the given elements. """

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

        # Prep visualization elements:
        self.vega_specifications = vega_specifications
        for spec in vega_specifications:
            if isinstance(spec, VegaChart):
                self.vega_specifications.append(
                    spec.create_spec(model_cls(**model_params))
                )
            else:
                self.vega_specifications.append(spec)

        # Initializing the application itself:
        super().__init__(self.handlers, "", [], **self.settings)

    def launch(self, port: Optional[int] = None) -> None:
        """ Run the app. """
        self.port = int(os.getenv("PORT", 3000))
        url = "http://127.0.0.1:{PORT}".format(PORT=self.port)
        print("Interface starting at {url}".format(url=url))
        self.listen(self.port)
        webbrowser.open(url)
        tornado.autoreload.start()
        tornado.ioloop.IOLoop.current().start()
