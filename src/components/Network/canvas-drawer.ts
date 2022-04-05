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
  fontSize,
  showNames,
  interModuleLinks,
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

    const minWidth = minVisibleLinkWidth / transform.k;
    for (const link of links) {
      // Assume links are sorted by weight.
      if (link.width! < minWidth || performance.now() - start > timeBudgetMs) {
        break;
      }

      if (!interModuleLinks && link.isInter) {
        continue;
      }

      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
      ctx.lineWidth = link.width!;
      ctx.strokeStyle = link.stroke!;
      ctx.stroke();
    }

    ctx.lineWidth = 2;
    for (const state of states) {
      ctx.beginPath();
      ctx.arc(state.x, state.y, state.radius!, 0, 2 * Math.PI);
      ctx.fillStyle = state.fill!;
      ctx.strokeStyle = state.stroke!;
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
