import * as d3 from "d3";
import type { CanvasRendererProps } from "./CanvasRenderer";

type MakeDrawerOptions = {
  ctx: CanvasRenderingContext2D;
} & Omit<CanvasRendererProps, "simulation" | "interModuleLinks">;

type DrawerOptions = {
  timeBudgetMs?: number;
  interModuleLinks?: boolean;
};

export default function makeDrawer({
  ctx,
  nodes,
  states,
  links,
  showNames,
  linkThreshold,
  showPhysicalNodes,
  stateOpacity,
}: MakeDrawerOptions) {
  const minFps = 60;
  const minVisibleLinkWidth = 0.005;
  const minVisibleFontSize = 12;

  return (
    transform: d3.ZoomTransform,
    {
      timeBudgetMs = 1000 / minFps,
      interModuleLinks = true,
    }: DrawerOptions = {}
  ) => {
    const start = performance.now();
    ctx.resetTransform();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    // Render physical nodes
    if (showPhysicalNodes) {
      ctx.lineWidth = 2;
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius!, 0, 2 * Math.PI);
        ctx.fillStyle = "#fafafa";
        ctx.strokeStyle = "#333";
        ctx.fill();
        ctx.stroke();
      }
    }

    // Render links
    const minWidth = minVisibleLinkWidth / transform.k;
    for (const link of links) {
      // Assume links are sorted by weight.
      if (link.width! < minWidth || link.weight < linkThreshold || performance.now() - start > timeBudgetMs) {
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

    // Render state nodes
    ctx.lineWidth = 2;
    ctx.globalAlpha = stateOpacity;
    for (const state of states) {
      ctx.beginPath();
      ctx.arc(state.x, state.y, state.radius!, 0, 2 * Math.PI);
      ctx.fillStyle = state.fill!;
      ctx.strokeStyle = state.stroke!;
      ctx.fill();
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (showNames && performance.now() - start < timeBudgetMs) {
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "#333";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
      ctx.lineJoin = "round";
      ctx.lineCap = "butt";
      const minFontSize = minVisibleFontSize / transform.k;

      for (const node of nodes) {
        if (node.fontSize! < minFontSize) {
          break;
        }

        ctx.font = `${node.fontSize!}px sans-serif`;
        const x = node.x + node.radius!;
        const y = node.y - node.radius! / 3;
        ctx.strokeText(node.name, x, y);
        ctx.fillText(node.name, x, y);
      }
    }
  };
}
