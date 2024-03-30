import * as vega from "vega";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { use as SandDanceUse } from "@msrvida/sanddance-react";
import * as deck from "@deck.gl/core";
import * as layers from "@deck.gl/layers";
import * as luma from "@luma.gl/core";

SandDanceUse(React, ReactDOM, vega, deck, layers, luma);

const data = [
  { a: 1, b: "c1" },
  { a: 1, b: "c2" },
  { a: 2, b: "c3" },
  { a: 3, b: "c4" },
];

const insight = {
  columns: {
    x: "a",
    color: "b",
  },
  scheme: "set1",
  chart: "barchartV",
  view: "2d",
  size: {
    height: 800,
    width: 800,
  },
};

export default function Sanddance() {
  // return <SandDanceReact.Viewer data={data} insight={insight} />;
}
