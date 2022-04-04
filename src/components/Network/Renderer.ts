import { useMemo } from "react";
import SVGRenderer from "./SvgRenderer";
import CanvasRenderer from "./CanvasRenderer";
import WebGLRenderer from "./WebGlRenderer";
import type { SharedProps } from "./Network";
import type { Simulation } from "../../hooks/useSimulation";
import type { LinkDatum, NodeDatum, StateNodeDatum } from "../../types/datum";

export type Renderer = "svg" | "canvas" | "webgl";

export function isValidRenderer(
  renderer: string | undefined
): renderer is Renderer {
  return (
    renderer !== undefined && ["svg", "canvas", "webgl"].includes(renderer)
  );
}

export function useRenderer(renderer: Renderer) {
  return useMemo(() => {
    switch (renderer) {
      case "svg":
        return SVGRenderer;
      case "canvas":
        return CanvasRenderer;
      case "webgl":
        return WebGLRenderer;
    }
  }, [renderer]);
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
