import { FlowNode, FlowStateNode, Link } from "../lib/merge-states-clu";

export type NodeDatum = FlowNode & {
  states: StateNodeDatum[];
  x: number;
  y: number;
  fx?: number;
  fy?: number;
};

export type StateNodeDatum = FlowStateNode & {
  physicalNode: NodeDatum;
  x: number;
  y: number;
  fx?: number;
  fy?: number;
  fill?: string;
  stroke?: string;
  radius?: number;
};

export type LinkDatum<NodeType = StateNodeDatum> = Omit<
  Link,
  "source" | "target"
> & {
  source: NodeType;
  target: NodeType;
  width?: number;
  stroke?: string;
};

export type NetworkDatum = {
  nodes: NodeDatum[];
  states: StateNodeDatum[];
  links: LinkDatum[];
};
