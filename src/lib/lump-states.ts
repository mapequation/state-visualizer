import type { FlowStateNetwork, FlowStateNode } from "./merge-states-clu";

export function lumpStateNodes({
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

  type ModuleId = number;
  for (const states of statesByPhysicalNode.values()) {
    const statesByModuleId = new Map<ModuleId, FlowStateNode[]>();

    for (const state of states) {
      if (!statesByModuleId.has(state.moduleId)) {
        statesByModuleId.set(state.moduleId, []);
      }
      statesByModuleId.get(state.moduleId)!.push(state);
    }

    for (const states of statesByModuleId.values()) {
      aggregatedStates.push({
        ...states[0],
        flow: nodes.reduce((flow, node) => flow + node.flow, 0),
      });
      const aggregatedStateId = states[0].id;
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
    let source = stateIdtoAggregatedStateId.get(link.source)!;
    let target = stateIdtoAggregatedStateId.get(link.target)!;
    if (!aggregatedStateLinks.has(source)) {
      aggregatedStateLinks.set(source, new Map());
    }
    const targets = aggregatedStateLinks.get(source)!;
    targets.set(target, (targets.get(target) || 0) + link.weight);
  }

  const aggregatedLinks = [];

  for (let [source, targets] of aggregatedStateLinks.entries()) {
    for (let [target, weight] of targets.entries()) {
      aggregatedLinks.push({ source, target, weight });
    }
  }

  return { nodes, states: aggregatedStates, links: aggregatedLinks };
}
