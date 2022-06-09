import type { FlowStateNetwork } from "./merge-states-clu";
import type { NetworkDatum, NodeDatum } from "../types/datum";

export default function networkToDatum(
  network: FlowStateNetwork
): NetworkDatum {
  const nodeFlowExtent = [Infinity, -Infinity];
  const stateFlowExtent = [Infinity, -Infinity];

  type PhysicalId = number;
  const nodesById = new Map<PhysicalId, NodeDatum>(
    network.nodes.map((node) => {
      nodeFlowExtent[0] = Math.min(nodeFlowExtent[0], node.flow);
      nodeFlowExtent[1] = Math.max(nodeFlowExtent[1], node.flow);
      return [node.id, { ...node, states: [], x: 0, y: 0 }];
    })
  );

  const statesById = new Map(
    network.states.map((state) => {
      stateFlowExtent[0] = Math.min(stateFlowExtent[0], state.flow);
      stateFlowExtent[1] = Math.max(stateFlowExtent[1], state.flow);
      const physicalNode = nodesById.get(state.physicalId)!;
      const stateNode = {
        ...state,
        physicalNode,
        x: 0,
        y: 0,
      };
      physicalNode.states.push(stateNode);
      return [state.id, stateNode];
    })
  );

  let maxLinkWeight = -Infinity;

  const links = network.links.map((link) => {
    const source = statesById.get(link.source)!;
    const target = statesById.get(link.target)!;
    maxLinkWeight = Math.max(maxLinkWeight, link.weight);
    return { source, target, weight: link.weight };
  });

  const nodes = Array.from(nodesById.values());
  const states = Array.from(statesById.values());

  // Sort nodes and links by flow/weight to improve rendering performance.
  nodes.sort((a, b) => b.flow - a.flow);
  links.sort((a, b) => b.weight - a.weight);

  return {
    nodes,
    states,
    links,
    maxLinkWeight,
    nodeFlowExtent,
    stateFlowExtent,
  };
}
