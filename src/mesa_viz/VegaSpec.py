import altair as alt
from typing import TYPE_CHECKING
from dataclasses import dataclass

from mesa.model import Model


class VegaChart:
    pass


@dataclass
class GridChart(VegaChart):
    width: int = None
    height: int = None
    color: str = None

    def create_spec(self, model: Model):
        if not self.width:
            self.width = model.grid.width
        if not self.height:
            self.height = model.grid.height
        if not self.color:
            self.color = self.color = "unique_id"

        chart = (
            alt.Chart({"name": "agents"})
            .mark_rect()
            .encode(
                x=alt.X("x:N", scale=alt.Scale(domain=list(range(self.width)))),
                y=alt.Y(
                    "y:N", scale=alt.Scale(domain=list(range(self.height - 1, -1, -1)))
                ),
                color=f"{self.color}:N",
            )
        )

        chart = chart.configure_axis(tickBand="extent", grid=True).properties(
            width=200, height=200
        )

        spec = chart.to_json()

        return spec