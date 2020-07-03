from __future__ import annotations

from mesa import Model, Agent
from mesa.space import SingleGrid
from mesa.time import BaseScheduler
import json
from typing import Tuple


key_to_direction = {
    "ArrowUp": (0, 1),
    "ArrowDown": (0, -1),
    "ArrowLeft": (-1, 0),
    "ArrowRight": (1, 0),
}


class Turtle(Agent):
    model: TurtleDraw
    grid: SingleGrid
    pos: Tuple[int, int]

    def move(self, direction):
        x, y = self.pos
        dx, dy = direction
        try:
            self.grid.move_agent(self, (x + dx, y + dy))
        except:
            return
        self.spawn(x, y)

    def spawn(self, x, y):
        trail = Trail(self.model.next_id(), self.model)
        self.model.schedule.add(trail)
        self.grid.position_agent(trail, x, y)

    def as_json(self):
        return json.dumps({"x": self.pos[0], "y": self.pos[1], "active": True})


class Trail(Agent):
    def as_json(self):
        return json.dumps({"x": self.pos[0], "y": self.pos[1], "active": False})


class TurtleDraw(Model):
    def __init__(self, width: int = 10, height: int = 10):
        super().__init__()
        self.grid = SingleGrid(width, height, True)
        self.active_agent = Turtle(-99, self)
        self.active_agent.grid = self.active_agent.model.grid
        self.grid.position_agent(self.active_agent, width // 2, height // 2)
        self.schedule = BaseScheduler(self)
        self.schedule.add(self.active_agent)

    def on_key(self, key):
        print(key)
        direction = key_to_direction.get(key, "")
        if direction:
            self.active_agent.move(direction)
