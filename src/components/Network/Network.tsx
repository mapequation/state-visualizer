import * as d3 from "d3";
import * as c3 from "@mapequation/c3";
import { Renderer, useRenderer } from "./Renderer";
import { useSimulation } from "../../simulation";
import aggregatePhysicalLinks from "../../lib/aggregate-links";
import type { NetworkDatum } from "../../types/datum";

export interface SharedProps {
  nodeRadius: number;
  showNames: boolean;
  interModuleLinks: boolean;
  linkThreshold: number;
}

export interface NetworkProps extends SharedProps {
  renderer?: Renderer;
  network: NetworkDatum;
  linkDistance?: number;
  linkWidthRange?: number[];
  nodeCharge?: number;
  fontSize: number;
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
  const { nodes, states, links, maxLinkWeight, nodeFlowExtent, stateFlowExtent } = network;
  const physicalLinks = aggregatePhysicalLinks(links);

  const forceCenter = renderer === "svg" ? [2000, 2000] : undefined;

  const fillColor = c3.colors(512, { scheme });

  const linkWidth = d3.scaleLinear().domain([0, maxLinkWeight]).range(linkWidthRange);

  const stateRadius = d3.scaleSqrt().domain(stateFlowExtent).range([2, nodeRadius]);

  const fontSize = d3
    .scaleSqrt()
    .domain(nodeFlowExtent)
    .range([15, rendererProps.fontSize]);

  const radius = d3.scaleSqrt().domain(nodeFlowExtent).range([2, nodeRadius]);

  for (const node of nodes) {
    node.fontSize = fontSize(node.flow);
    node.radius = radius(node.flow);
  }

  for (const state of states) {
    state.fill = fillColor[state.moduleId - 1];
    state.stroke = d3.rgb(state.fill).darker().toString();
    state.radius = stateRadius(state.flow);
  }

  for (const link of links) {
    const isInter = link.source.moduleId !== link.target.moduleId;
    link.isInter = isInter;
    link.stroke = !isInter ? link.source.stroke : "#aaa";
    link.width = linkWidth(link.weight);
  }

  const simulation = useSimulation({
    nodes,
    states,
    links: physicalLinks,
    nodeRadius,
    nodeCharge,
    linkDistance,
    forceCenter
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
