import * as d3 from "d3";
import * as c3 from "@mapequation/c3";
import { Renderer, useRenderer } from "./Renderer";
import { useSimulation } from "../../simulation";
import aggregatePhysicalLinks from "../../lib/aggregate-links";
import networkToDatum from "../../lib/network-to-datum";
import makeStateRadius from "../../lib/make-state-radius";
import type { FlowStateNetwork } from "../../lib/merge-states-clu";

export interface SharedProps {
  nodeRadius: number;
  showNames: boolean;
  fontSize: number;
  interModuleLinks: boolean;
}

export interface NetworkProps extends SharedProps {
  renderer?: Renderer;
  network: FlowStateNetwork;
  linkDistance?: number;
  linkWidthRange?: number[];
  nodeCharge?: number;
  scheme?: c3.SchemeName;
}

export default function Network({
  renderer = "canvas",
  network,
  nodeRadius = 40,
  linkDistance = 100,
  linkWidthRange = [0.2, 5],
  nodeCharge = -500,
  scheme = "Sinebow",
  ...rendererProps
}: NetworkProps) {
  const { nodes, states, links } = networkToDatum(network);
  const physicalLinks = aggregatePhysicalLinks(links);

  // Sort links by weight to improve rendering performance.
  links.sort((a, b) => b.weight - a.weight);

  const forceCenter = renderer === "svg" ? [2000, 2000] : undefined;

  const fillColor = c3.colors(512, { scheme });

  const linkWidth = (() => {
    const maxWeight = d3.max(links, (d) => d.weight) as number;
    return d3.scaleLinear().domain([0, maxWeight]).range(linkWidthRange);
  })();

  const stateRadius = makeStateRadius(nodes, states, nodeRadius);

  for (const state of states) {
    state.fill = fillColor[state.moduleId];
    state.stroke = d3.rgb(state.fill).darker().toString();
    state.radius = stateRadius(state.flow);
  }

  for (const link of links) {
    const isInter = link.source.moduleId !== link.target.moduleId;
    link.isInter = isInter;
    link.stroke = !isInter ? link.source.stroke : "#333";
    link.width = linkWidth(link.weight);
  }

  const simulation = useSimulation({
    nodes,
    states,
    links: physicalLinks,
    nodeRadius,
    nodeCharge,
    stateRadius,
    linkDistance,
    forceCenter,
  });

  const Renderer = useRenderer(renderer);

  return (
    <Renderer
      simulation={simulation}
      nodes={nodes}
      states={states}
      links={links}
      nodeRadius={nodeRadius}
      {...rendererProps}
    />
  );
}
