import * as d3 from "d3";
import { clamp } from "./utils";
import type { NodeDatum, StateNodeDatum } from "../types/datum";

export default function makeStateRadius(
  nodes: NodeDatum[],
  states: StateNodeDatum[],
  nodeRadius: number
) {
  const maxStateFlow = d3.max(states, (d) => d.flow) as number;
  const maxNumStates = d3.max(nodes, (d) => d.states.length) as number;
  const dist = nodeRadius / 2;
  const minRadius = 15;
  const maxRadius = clamp(
    (dist * Math.PI) / maxNumStates,
    minRadius,
    nodeRadius
  );
  return d3.scaleSqrt().domain([0, maxStateFlow]).range([2, maxRadius]);
}
