from mesa_viz.VegaVisualization import VegaServer
from mesa_viz.UserParam import UserSettableParameter

from model import TurtleDraw
import json

grid_spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": 250,
    "height": 250,
    "data": {"name": "agents"},
    "mark": "rect",
    "encoding": {
        "x": {
            "type": "nominal",
            "field": "x",
            "scale": {"domain": list(range(20))},
            "axis": {"bandPosition": 0.0},
        },
        "y": {
            "type": "nominal",
            "field": "y",
            "scale": {"domain": list(range(19, -1, -1))},
        },
        "color": {"type": "ordinal", "field": "active"},
    },
    "config": {"axis": {"grid": True, "tickBand": "extent"}},
}

grid_spec = json.dumps(grid_spec)


model_params = {
    "height": 20,
    "width": 20,
}

server = VegaServer(TurtleDraw, [grid_spec], "TurtleDraw", model_params, 1)
server.launch()
