from mesa import Agent


class Turtle(Agent):
    """A moveable turtle."""

    def move(self, direction):
        x, y = self.pos
        dx, dy = direction
        try:
            self.model.grid.move_agent(self, (x + dx, y + dy))
        except:
            return
        self.spawn(x, y)

    @property
    def x(self):
        return self.pos[0]

    @property
    def y(self):
        return self.pos[1]

    def spawn(self, x, y):
        trail = Turtle(self.model.next_id(), self.model)
        trail.active = False
        self.model.schedule.add(trail)
        self.model.grid.position_agent(trail, x, y)


from mesa import Model
from mesa.space import SingleGrid
from mesa.time import BaseScheduler


class TurtleModel(Model):
    def __init__(self, width: int = 5, height: int = 5):
        super().__init__()
        self.active_agent = Turtle(self.next_id(), self)
        self.active_agent.active = True

        self.grid = SingleGrid(width, height, True)
        self.grid.position_agent(self.active_agent, width // 2, height // 2)

        self.schedule = BaseScheduler(self)
        self.schedule.add(self.active_agent)

    def step(self):
        direction = self.random.choice([(1, 0), (-1, 0), (0, 1), (0, -1)])
        self.active_agent.move(direction)

    def on_key(self, key):
        key_to_direction = {
            "ArrowUp": (0, 1),
            "ArrowDown": (0, -1),
            "ArrowLeft": (-1, 0),
            "ArrowRight": (1, 0),
        }

        direction = key_to_direction.get(key, "")
        if direction:
            self.active_agent.move(direction)

    def on_click(self, **kwargs):
        self.active_agent.active = False
        unique_id = kwargs.get("unique_id")
        for agent in self.schedule.agents:
            if agent.unique_id == unique_id:
                self.active_agent = agent
                self.active_agent.active = True


from mesa_viz.VegaSpec import GridChart

grid = GridChart(color="active")

from mesa_viz.VegaVisualization import VegaServer

server = VegaServer(TurtleModel, [grid], "Turtles", {}, n_simulations=3)
# server.launch()
