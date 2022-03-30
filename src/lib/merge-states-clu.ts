import { Result } from "@mapequation/infomap/parser";
import { CluStateNode } from "@mapequation/infomap/filetypes";
import type {
  Link,
  Node as RawNode,
  StateNetwork,
  StateNode as RawStateNode,
} from "./parse-states";

export type { Link } from "./parse-states";

export type FlowNode = RawNode & {
  flow: number;
};

export type FlowStateNode = RawStateNode & {
  flow: number;
  moduleId: number;
};

export type FlowStateNetwork = {
  nodes: FlowNode[];
  states: FlowStateNode[];
  links: Link[];
};

export default function mergeStatesClu(
  network: StateNetwork,
  clusters: Result<CluStateNode>
): FlowStateNetwork {
  const clusterByStateId = new Map<number, CluStateNode>();

  clusters.nodes.forEach((state) => {
    clusterByStateId.set(state.stateId, state);
  });

  const states: FlowStateNode[] = [];
  const nodes = new Map<number, FlowNode>();

  network.nodes.forEach((node) => {
    nodes.set(node.id, {
      ...node,
      flow: 0,
    });
  });

  network.states.forEach((state) => {
    const cluster = clusterByStateId.get(state.id);
    if (!cluster) return;
    states.push({
      ...state,
      flow: cluster.flow ?? 0,
      moduleId: cluster.moduleId,
    });
    const physicalNode = nodes.get(state.physicalId);
    if (physicalNode) {
      physicalNode.flow += cluster.flow ?? 0;
    }
  });

  return {
    nodes: Array.from(nodes.values()),
    states,
    links: network.links,
  };
}
