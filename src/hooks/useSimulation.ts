import * as d3 from "d3";
import { forceRadial } from "../lib/d3-force";
import { LinkDatum, NodeDatum, StateNodeDatum } from "../types/datum";

interface UseSimulationOptions {
  nodes: NodeDatum[];
  states: StateNodeDatum[];
  links: LinkDatum<NodeDatum>[];
  nodeRadius: number;
  nodeCharge: number;
  linkDistance: number;
  initialIterations?: number;
}

export type Simulation = {
  simulation: d3.Simulation<NodeDatum, LinkDatum<NodeDatum>>;
  stateSimulation: d3.Simulation<StateNodeDatum, LinkDatum<StateNodeDatum>>;
};

export default function useSimulation({
  nodes,
  states,
  links,
  nodeRadius,
  nodeCharge,
  linkDistance,
  initialIterations = 100,
}: UseSimulationOptions): Simulation {
  const decay = 1 - Math.pow(0.001, 1 / 500);

  const simulation = d3
    .forceSimulation(nodes)
    .force("center", d3.forceCenter())
    .force("collide", d3.forceCollide(2 * nodeRadius))
    .force("charge", d3.forceManyBody().strength(nodeCharge))
    .force("link", d3.forceLink(links).distance(linkDistance));

  simulation.alphaDecay(decay);

  const stateSimulation = d3
    .forceSimulation(states)
    .force("collide", d3.forceCollide(10))
    .force(
      "radial",
      forceRadial(
        nodeRadius / 2,
        (d: StateNodeDatum) => d.physicalNode.x,
        (d: StateNodeDatum) => d.physicalNode.y
      ).strength(1)
    );

  stateSimulation.alphaDecay(decay);

  if (initialIterations) {
    simulation.tick(initialIterations);
    stateSimulation.tick(initialIterations);
  }

  return { simulation, stateSimulation };
}
