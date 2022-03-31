import { useEffect, useRef } from "react";
import type { RendererProps } from "./Network";
import linkRenderer from "../../lib/link-renderer";

interface CanvasRendererProps extends RendererProps {}

export default function CanvasRenderer({
  simulation: { simulation, stateSimulation },
  nodes,
  states,
  links,
  nodeFill,
  nodeStroke,
  nodeRadius,
  linkWidth,
  stateRadius,
  showNames,
  fontSize,
}: CanvasRendererProps) {
  const drawLink = linkRenderer(stateRadius);

  const render = (ctx: CanvasRenderingContext2D) =>
    simulation.on("tick", () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.fillStyle = "#fafafa";
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      for (const node of nodes) {
        ctx.beginPath();
        ctx.moveTo(node.x + nodeRadius, node.y);
        ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }

      for (const link of links) {
        const { x1, y1, x2, y2 } = drawLink(link);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = linkWidth(link.weight);
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

      if (!showNames) return;

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
    });

  return <Canvas render={render} />;
}

interface CanvasProps {
  render: (ctx: CanvasRenderingContext2D) => void;
}

function Canvas({ render }: CanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = ref?.current?.getContext("2d");
    if (!context) return;
    render(context);
  }, [ref, render]);

  return (
    <canvas width="4000" height="4000" style={{ width: "100%" }} ref={ref} />
  );
}
