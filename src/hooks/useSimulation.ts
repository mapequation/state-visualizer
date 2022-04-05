import { useMemo } from "react";
import * as d3 from "d3";
import { forceRadial } from "../lib/d3-force";
import { LinkDatum, NodeDatum, StateNodeDatum } from "../types/datum";

interface UseSimulationOptions {
  nodes: NodeDatum[];
  states: StateNodeDatum[];
  links: LinkDatum<NodeDatum>[];
  nodeRadius: number;
  nodeCharge: number;
  stateRadius: (d: number) => number;
  linkDistance: number;
  initialIterations?: number;
  forceCenter?: number[];
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
  stateRadius,
  linkDistance,
  initialIterations = 100,
  forceCenter = [0, 0],
}: UseSimulationOptions): Simulation {
  return useMemo(() => {
    console.time("simulation");
    const forceLink = (() => {
      const domain = d3.extent(links, (d) => d.weight) as number[];

      const distance = d3
        .scaleLinear()
        .domain(domain)
        .range([linkDistance, 10]);

      const strength = d3.scaleLinear().domain(domain).range([0.5, 1]);

      const force = d3.forceLink(links);
      const defaultStrength = force.strength();

      force
        .strength((d, i, n) => defaultStrength(d, i, n) * strength(d.weight))
        .distance((d) => distance(d.weight));

      return force;
    })();

    const simulation = d3
      .forceSimulation(nodes)
      .force("center", d3.forceCenter(forceCenter[0], forceCenter[1]))
      .force("collide", d3.forceCollide(2 * nodeRadius))
      .force("charge", d3.forceManyBody().strength(nodeCharge))
      .force("link", forceLink);

    const stateSimulation = d3
      .forceSimulation(states)
      .force(
        "collide",
        d3
          .forceCollide<StateNodeDatum>(10)
          .radius((d) => stateRadius(d.flow) + 1)
      )
      .force(
        "radial",
        forceRadial(
          0,
          (d: StateNodeDatum) => d.physicalNode.x,
          (d: StateNodeDatum) => d.physicalNode.y
        ).strength(1)
      );

    const initialDecay = simulation.alphaDecay();

    if (initialIterations) {
      const decay = 1e-3;
      simulation.alphaDecay(decay);
      stateSimulation.alphaDecay(decay);
      simulation.tick(initialIterations);
      stateSimulation.tick(initialIterations);
    }

    simulation.alphaDecay(initialDecay);
    stateSimulation.alphaDecay(initialDecay);

    if (nodes.length > 1000) {
      simulation.stop();
      stateSimulation.tick(initialIterations);
      stateSimulation.stop();
    }

    console.timeEnd("simulation");
    return { simulation, stateSimulation };
  }, [
    nodes,
    links,
    states,
    nodeRadius,
    nodeCharge,
    stateRadius,
    linkDistance,
    initialIterations,
    forceCenter,
  ]);
}
