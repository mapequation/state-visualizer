import type { FlowStateNetwork, FlowStateNode } from "./merge-states-clu";

export default function lumpStateNodes({
  nodes,
  links,
  states,
}: FlowStateNetwork): FlowStateNetwork {
  type PhysicalId = number;
  const statesByPhysicalNode = new Map<PhysicalId, FlowStateNode[]>();

  states.forEach((state) => {
    if (!statesByPhysicalNode.has(state.physicalId)) {
      statesByPhysicalNode.set(state.physicalId, []);
    }
    statesByPhysicalNode.get(state.physicalId)!.push(state);
  });

  const aggregatedStates = [];

  type StateId = number;
  type AggregatedStateId = number;
  const stateIdtoAggregatedStateId = new Map<StateId, AggregatedStateId>();

  let aggregatedStateIds = 0;

  for (const states of statesByPhysicalNode.values()) {
    type ModuleId = number;
    const statesByModuleId = new Map<ModuleId, FlowStateNode[]>();

    for (const state of states) {
      if (!statesByModuleId.has(state.moduleId)) {
        statesByModuleId.set(state.moduleId, []);
      }
      statesByModuleId.get(state.moduleId)!.push(state);
    }

    for (const states of statesByModuleId.values()) {
      const aggregatedStateId = aggregatedStateIds++;
      aggregatedStates.push({
        ...states[0],
        id: aggregatedStateId,
        flow: states.reduce((flow, state) => flow + state.flow, 0),
      });
      for (const state of states) {
        stateIdtoAggregatedStateId.set(state.id, aggregatedStateId);
      }
    }
  }

  type Weight = number;
  const aggregatedStateLinks = new Map<
    AggregatedStateId,
    Map<AggregatedStateId, Weight>
  >();

  for (const link of links) {
    const source = stateIdtoAggregatedStateId.get(link.source)!;
    const target = stateIdtoAggregatedStateId.get(link.target)!;
    if (!aggregatedStateLinks.has(source)) {
      aggregatedStateLinks.set(source, new Map());
    }
    const targets = aggregatedStateLinks.get(source)!;
    targets.set(target, (targets.get(target) || 0) + link.weight);
  }

  const aggregatedLinks = [];

  for (const [source, targets] of aggregatedStateLinks.entries()) {
    for (const [target, weight] of targets.entries()) {
      aggregatedLinks.push({ source, target, weight });
    }
  }

  return { nodes, states: aggregatedStates, links: aggregatedLinks };
}
