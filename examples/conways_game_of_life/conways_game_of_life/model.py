from mesa import Model
from mesa.space import Grid
from mesa.time import SimultaneousActivation

from .cell import Cell


class ConwaysGameOfLife(Model):
    """
    Represents the 2-dimensional array of cells in Conway's
    Game of Life.
    """

    def __init__(self, size, **kwargs):
        """
        Create a new playing area of (height, width) cells.
        """

        # Set up the grid and schedule.

        # Use SimultaneousActivation which simulates all the cells
        # computing their next state simultaneously.  This needs to
        # be done because each cell's next state depends on the current
        # state of all its neighbors -- before they've changed.
        self.schedule = SimultaneousActivation(self)

        # Use a simple grid, where edges wrap around.
        self.grid = Grid(size, size, torus=True)

        # Place a cell at each location, with some initialized to
        # ALIVE and some to DEAD.
        for (_contents, x, y) in self.grid.coord_iter():
            cell = Cell((x, y), self)
            if self.random.random() < 0.1:
                cell.state = cell.ALIVE
            self.grid.place_agent(cell, (x, y))
            self.schedule.add(cell)

        self.running = True

    def step(self):
        """
        Have the scheduler advance each cell by one step
        """
        self.schedule.step()

    def on_click(self, x, y, **kwargs):
        print(x, y)
        cell = self.grid[x][y]
        cell.state = cell.ALIVE
