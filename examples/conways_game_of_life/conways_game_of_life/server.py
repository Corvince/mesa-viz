from mesa_viz.VegaVisualization import VegaServer
from mesa_viz.VegaSpec import GridChart
from mesa_viz.UserParam import UserSettableParameter

from .model import ConwaysGameOfLife

grid_spec = GridChart(color="isAlive")


server = VegaServer(
    ConwaysGameOfLife,
    [grid_spec],
    "Game of Life",
    {
        "size": UserSettableParameter(
            "slider", "Size", value=25, min_value=10, max_value=100, step=5
        )
    },
    n_simulations=2,
)
