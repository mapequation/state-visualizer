import { useEffect, useRef } from "react";
import * as d3 from "d3";
import makeDrawer from "./canvas-drawer";
import type { RendererProps } from "./Renderer";

export interface CanvasRendererProps extends RendererProps {}

export default function CanvasRenderer({
  simulation: { simulation, stateSimulation },
  interModuleLinks,
  ...opts
}: CanvasRendererProps) {
  const render = (ctx: CanvasRenderingContext2D) => {
    const draw = makeDrawer({ ctx, ...opts });

    const dynamicInterModuleLinks = interModuleLinks && opts.nodes.length < 500;

    let currentTransform = d3.zoomIdentity
      .translate(ctx.canvas.width / 2, ctx.canvas.height / 2)
      .scale(0.4);

    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.05, 1000])
      .on("zoom", (e) => {
        currentTransform = e.transform;
        draw(currentTransform, { interModuleLinks: dynamicInterModuleLinks });
      })
      .on("end", () =>
        draw(currentTransform, { interModuleLinks, timeBudgetMs: Infinity })
      );

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
      .call(
        opts.nodes.length < 2000 ? drag : () => console.log("drag disabled")
      )
      .call(zoom)
      .call(zoom.transform, currentTransform);

    simulation
      .on("tick", () =>
        draw(currentTransform, { interModuleLinks: dynamicInterModuleLinks })
      )
      .on("end", () => {
        console.log("simulation ended");
        draw(currentTransform, { interModuleLinks, timeBudgetMs: Infinity });
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

    return () => window.removeEventListener("resize", resize);
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
