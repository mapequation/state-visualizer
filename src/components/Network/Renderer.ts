import { useMemo } from "react";
import SVGRenderer from "./SvgRenderer";
import CanvasRenderer from "./CanvasRenderer";
import type { SharedProps } from "./Network";
import type { Simulation } from "../../simulation";
import type { LinkDatum, NodeDatum, StateNodeDatum } from "../../types/datum";

export type Renderer = "svg" | "canvas";

export function isValidRenderer(
  renderer: string | undefined
): renderer is Renderer {
  return (
    renderer !== undefined && ["svg", "canvas"].includes(renderer)
  );
}

export function useRenderer(renderer: Renderer) {
  return useMemo(() => {
    switch (renderer) {
      case "svg":
        return SVGRenderer;
      case "canvas":
        return CanvasRenderer;
    }
  }, [renderer]);
}

export interface RendererProps extends SharedProps {
  simulation: Simulation;
  nodes: NodeDatum[];
  states: StateNodeDatum[];
  links: LinkDatum[];
}
