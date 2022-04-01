import * as d3 from "d3";
import * as c3 from "@mapequation/c3";
import aggregatePhysicalLinks from "../../lib/aggregate-links";
import networkToDatum from "../../lib/network-to-datum";
import useSimulation, { Simulation } from "../../hooks/useSimulation";
import SVGRenderer from "./SvgRenderer";
import CanvasRenderer from "./CanvasRenderer";
import type { FlowStateNetwork } from "../../lib/merge-states-clu";
import { LinkDatum, NodeDatum, StateNodeDatum } from "../../types/datum";
import WebGLRenderer from "./WebGlRenderer";

export interface SharedProps {
  showNames: boolean;
  fontSize: number;
  nodeRadius: number;
}

export interface NetworkProps extends SharedProps {
  network: FlowStateNetwork;
  linkDistance?: number;
  linkWidthRange?: number[];
  nodeCharge?: number;
  scheme?: c3.SchemeName;
  renderer?: "svg" | "canvas" | "webgl";
}

export interface RendererProps extends SharedProps {
  simulation: Simulation;
  nodeFill: string[];
  nodeStroke: string[];
  linkWidth: (d: number) => number;
  stateRadius: (d: number) => number;
  nodes: NodeDatum[];
  states: StateNodeDatum[];
  links: LinkDatum[];
}

export default function Network({
  network,
  nodeRadius = 40,
  linkDistance = 100,
  linkWidthRange = [0.2, 5],
  nodeCharge = -500,
  scheme = "Sinebow",
  renderer = "canvas",
  ...rendererProps
}: NetworkProps) {
  const { nodes, states, links } = networkToDatum(network);
  const physicalLinks = aggregatePhysicalLinks(links);

  const forceCenter = renderer === "svg" ? [2000, 2000] : undefined;

  const simulation = useSimulation({
    nodes,
    states,
    links: physicalLinks,
    nodeRadius,
    nodeCharge,
    linkDistance,
    forceCenter,
  });

  const fillColor = c3.colors(512, { scheme });

  const strokeColor = c3.colors(512, {
    scheme,
    lightness: 0.3,
    saturation: 0.8,
  });

  const linkWidth = (() => {
    const maxLinkWeight = Math.max(...links.map((link) => link.weight));
    return d3.scaleLinear().domain([0, maxLinkWeight]).range(linkWidthRange);
  })();

  const stateRadius = (() => {
    const maxStateFlow = Math.max(...states.map((state) => state.flow));
    const maxNumStates = Math.max(...nodes.map((node) => node.states.length));
    const dist = nodeRadius / 2;
    const maxRadius = Math.min(
      nodeRadius,
      Math.max((dist * Math.PI) / maxNumStates, 15)
    );
    return d3.scaleSqrt().domain([0, maxStateFlow]).range([2, maxRadius]);
  })();

  const Renderer =
    renderer === "svg"
      ? SVGRenderer
      : renderer === "webgl"
      ? WebGLRenderer
      : CanvasRenderer;

  return (
    <Renderer
      simulation={simulation}
      nodes={nodes}
      states={states}
      links={links}
      nodeFill={fillColor}
      nodeStroke={strokeColor}
      nodeRadius={nodeRadius}
      linkWidth={linkWidth}
      stateRadius={stateRadius}
      {...rendererProps}
    />
  );
}
