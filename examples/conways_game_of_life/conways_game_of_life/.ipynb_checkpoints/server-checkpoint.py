from mesa.visualization.modules import VegaModule
from mesa.visualization.VegaVisualization import VegaServer

from .model import ConwaysGameOfLife

spec = """
{
    "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
    "width": 500,
    "height": 500,
    "data": {"name": "agents"},
    "mark": "bar",
    "encoding": {
      "x": {"type": "nominal", "field": "x"},
      "y": {"type": "nominal", "field": "y"},
      "color": {"type": "nominal", "field": "isAlive"}
    }
}
"""


server = VegaServer(
    ConwaysGameOfLife, [spec], "Game of Life", {"height": 50, "width": 50}
)
