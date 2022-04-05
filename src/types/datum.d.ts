import type { SimulationLinkDatum, SimulationNodeDatum } from "d3";
import type { FlowNode, FlowStateNode, Link } from "../lib/merge-states-clu";

export type NodeDatum = FlowNode &
  SimulationNodeDatum & {
    states: StateNodeDatum[];
    x: number;
    y: number;
    fontSize?: number;
  };

export type StateNodeDatum = FlowStateNode &
  SimulationNodeDatum & {
    physicalNode: NodeDatum;
    x: number;
    y: number;
    fill?: string;
    stroke?: string;
    radius?: number;
  };

export type LinkDatum<NodeDatum extends SimulationNodeDatum = StateNodeDatum> =
  SimulationLinkDatum<NodeDatum> &
    Omit<Link, "source" | "target"> & {
      source: NodeDatum;
      target: NodeDatum;
      width?: number;
      stroke?: string;
      isInter?: boolean;
    };

export type NetworkDatum = {
  nodes: NodeDatum[];
  states: StateNodeDatum[];
  links: LinkDatum[];
};
