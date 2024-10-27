import React from "react";
import { Rnd } from "react-rnd";
import TimeLapse from "../time-lapse/time-lapse";

const style = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "solid 1px #ddd",
  background: "white"
};

export default function Grid() {
    return (
        <Rnd
            style={style}
            default={{
            x: 0,
            y: 0,
            width: "80%",
            height: 700
            }}
        >
            <TimeLapse/>
        </Rnd>
    )
};
