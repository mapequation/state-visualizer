import * as d3 from "d3";
import { Result } from "@mapequation/infomap-parser";
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
  clusters: Result<CluStateNode>,
  directed = false
): FlowStateNetwork {
  const clusterByStateId = new Map<number, CluStateNode>();

  clusters.nodes.forEach((state) => {
    // We should only use state ids.
    // For first-order networks with state output, the state id is the same as the node id.
    clusterByStateId.set(state.stateId ?? state.id, state);
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

  let links = network.links;

  if (!directed) {
    links = [];

    type SourceId = number;
    type TargetId = number;
    type Weight = number;
    const linkMap = new Map<SourceId, Map<TargetId, Weight>>();

    network.links.forEach(({ source, target, weight }) => {
      // Make links undirected, source is the smaller id of the two.
      [source, target] = d3.extent([source, target]) as [SourceId, TargetId];
      if (!linkMap.has(source)) {
        linkMap.set(source, new Map());
      }
      const targets = linkMap.get(source)!;
      targets.set(target, (targets.get(target) ?? 0) + weight);
    });

    for (const [source, targets] of linkMap.entries()) {
      for (const [target, weight] of targets.entries()) {
        links.push({ source, target, weight });
      }
    }
  }

  return {
    nodes: Array.from(nodes.values()),
    states,
    links,
  };
}
