import type { FlowStateNetwork } from "./merge-states-clu";
import type { NetworkDatum, NodeDatum } from "../types/datum";

export default function networkToDatum(
  network: FlowStateNetwork
): NetworkDatum {
  type PhysicalId = number;
  const nodesById = new Map<PhysicalId, NodeDatum>(
    network.nodes.map((node) => [node.id, { ...node, states: [], x: 0, y: 0 }])
  );

  const statesById = new Map(
    network.states.map((state) => {
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

  const links = network.links.map((link) => {
    const source = statesById.get(link.source)!;
    const target = statesById.get(link.target)!;
    return { source, target, weight: link.weight };
  });

  return {
    nodes: Array.from(nodesById.values()),
    states: Array.from(statesById.values()),
    links,
  };
}
