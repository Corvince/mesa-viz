from mesa_viz.VegaVisualization import VegaServer
from mesa_viz.VegaSpec import GridChart
from mesa_viz.UserParam import UserSettableParameter
import json
from model import Schelling

grid_spec = GridChart(color="agent_type")

line_spec = json.loads(
    """
{
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": 250,
    "height": 250,
    "data": {"name": "model"},
    "mark": "line",
    "encoding": {
      "y": {"type": "nominal", "field": "happy"},
      "x": {"type": "nominal", "field": "Step"}
    }
}
"""
)


model_params = {
    "height": 20,
    "width": 20,
    "density": UserSettableParameter("slider", "Agent density", 0.8, 0.1, 1.0, 0.1),
    "schedule": UserSettableParameter(
        "choice",
        "Activation",
        value="RandomActivation",
        choices=["RandomActivation", "BaseScheduler"],
    ),
}

server = VegaServer(Schelling, [grid_spec, line_spec], "Schelling", model_params, 3)
server.launch()
