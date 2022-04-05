import * as d3 from "d3";
import type { CanvasRendererProps } from "./CanvasRenderer";

type DrawerOptions = {
  ctx: CanvasRenderingContext2D;
  minFps?: number;
  minVisibleLinkWidth?: number;
} & Omit<CanvasRendererProps, "simulation">;

export default function makeDrawer({
  ctx,
  nodes,
  states,
  links,
  nodeRadius,
  linkWidth,
  stateRadius,
  nodeFill,
  nodeStroke,
  fontSize,
  showNames,
  minFps = 60,
  minVisibleLinkWidth = 0.01,
}: DrawerOptions) {
  return (transform: d3.ZoomTransform, timeBudgetMs = 1000 / minFps) => {
    const start = performance.now();
    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    ctx.fillStyle = "#fafafa";
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (const node of nodes) {
      ctx.moveTo(node.x + nodeRadius, node.y);
      ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
    }
    ctx.fill();
    ctx.stroke();

    for (const link of links) {
      const lineWidth = linkWidth(link.weight);
      // Assume links are sorted by weight.
      if (
        transform.k * lineWidth < minVisibleLinkWidth ||
        performance.now() - start > timeBudgetMs
      ) {
        break;
      }

      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle =
        link.source.moduleId === link.target.moduleId
          ? nodeStroke[link.source.moduleId]
          : "#333";
      ctx.stroke();
    }

    ctx.lineWidth = 2;
    for (const state of states) {
      const r = stateRadius(state.flow);
      ctx.beginPath();
      ctx.arc(state.x, state.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = nodeFill[state.moduleId];
      ctx.strokeStyle = nodeStroke[state.moduleId];
      ctx.fill();
      ctx.stroke();
    }

    if (showNames) {
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "#333";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
      for (const node of nodes) {
        const x = node.x + nodeRadius;
        const y = node.y - fontSize / 2;
        ctx.strokeText(node.name, x, y);
        ctx.fillText(node.name, x, y);
      }
    }

    ctx.restore();
  };
}
