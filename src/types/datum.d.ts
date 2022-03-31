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
};

export type LinkDatum<NodeType = StateNodeDatum> = Omit<
  Link,
  "source" | "target"
> & {
  source: NodeType;
  target: NodeType;
};

export type NetworkDatum = {
  nodes: NodeDatum[];
  states: StateNodeDatum[];
  links: LinkDatum[];
};
