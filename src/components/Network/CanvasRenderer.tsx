import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { RendererProps } from "./Renderer";

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
  const render = (ctx: CanvasRenderingContext2D) => {
    const minFps = 60;

    function draw(transform: d3.ZoomTransform, timeBudgetMs = 1000 / minFps) {
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
        if (currentTransform.k * lineWidth < 0.01) break;

        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle =
          link.source.moduleId === link.target.moduleId
            ? nodeStroke[link.source.moduleId]
            : "#333";
        ctx.stroke();

        if (performance.now() - start > timeBudgetMs) break;
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
    }

    let currentTransform = d3.zoomIdentity
      .translate(ctx.canvas.width / 2, ctx.canvas.height / 2)
      .scale(0.4);

    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.05, 1000])
      .on("zoom", (e) => {
        currentTransform = e.transform;
        draw(currentTransform);
      })
      .on("end", () => {
        console.log("zoom end");
        draw(currentTransform, Infinity);
      });

    const drag = d3
      .drag<HTMLCanvasElement, unknown>()
      .subject((event) => {
        const point = currentTransform.invert([event.x, event.y]);
        return simulation.find(point[0], point[1], 50);
      })
      .on("start", (event) => {
        if (!event.subject) return;
        simulation.alphaTarget(0.3).restart();
        stateSimulation.alphaTarget(0.8).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      })
      .on("drag", (event) => {
        if (!event.subject) return;
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      })
      .on("end", (event) => {
        if (!event.subject) return;
        simulation.alphaTarget(0);
        stateSimulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      });

    d3.select(ctx.canvas)
      .call(drag)
      .call(zoom)
      .call(zoom.transform, currentTransform);

    simulation
      .on("tick", () => draw(currentTransform))
      .on("end", () => {
        console.log("simulation ended");
        draw(currentTransform, Infinity);
      });
  };

  return <Canvas render={render} />;
}

interface CanvasProps {
  render: (ctx: CanvasRenderingContext2D) => void;
}

function Canvas({ render }: CanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const resize = () => {
      currentRef.width = currentRef.clientWidth;
      currentRef.height = currentRef.clientHeight;
    };

    resize();

    window.addEventListener("resize", resize);

    const context = currentRef.getContext("2d");
    if (!context) return;

    render(context);
  }, [ref, render]);

  return (
    <canvas
      width="1000"
      height="1000"
      style={{ width: "100%", height: "100%" }}
      ref={ref}
    />
  );
}
