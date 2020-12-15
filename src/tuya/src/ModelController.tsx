import { createStyles, makeStyles, Theme } from "@material-ui/core";
import {
  Pause,
  PlayArrow,
  Replay,
  SkipNext,
  SkipPrevious,
} from "@material-ui/icons";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import React, { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    speedDial: {
      position: "absolute",
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  })
);

const actions = [
  { icon: <SkipNext />, name: "Next step" },
  { icon: <SkipPrevious />, name: "Previous step" },
  { icon: <Replay />, name: "Reset" },
];

export default function ModelController() {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [running, toggleRunning] = useState(false);

  const handleClick = () => {
    toggleRunning(!running);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <SpeedDial
        ariaLabel="SpeedDial example"
        // @ts-ignore
        className={classes.speedDial}
        icon={
          running ? (
            <Pause onClick={handleClick} />
          ) : (
            <PlayArrow onClick={handleClick} />
          )
        }
        open={open}
        onClose={handleClose}
        onOpen={handleOpen}
        // @ts-ignore
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            // @ts-ignore
            onClick={handleClose}
          />
        ))}
      </SpeedDial>
    </div>
  );
}
