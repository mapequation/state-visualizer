import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { RendererProps } from "./Network";
import type { LinkDatum, NodeDatum, StateNodeDatum } from "../../types/datum";

interface SVGRendererProps extends RendererProps {}

export default function SVGRenderer({
  simulation: { simulation, stateSimulation },
  nodes,
  physicalLinks,
  states,
  links,
  nodeFill,
  nodeStroke,
  nodeRadius,
  linkWidth,
  stateRadius,
  showNames,
  fontSize,
}: SVGRendererProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const currentRef = ref.current;

    if (!currentRef) return;

    const svg = d3.select(currentRef);

    const zoomable = svg.select("#zoomable");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 1000])
      .on("zoom", function (event) {
        zoomable.attr("transform", event.transform);
      });

    svg.call(zoom).on("dblclick.zoom", null);

    const dragHelper = {
      start: (d: NodeDatum | StateNodeDatum) => {
        d.fx = d.x;
        d.fy = d.y;
      },
      drag: (
        d: NodeDatum | StateNodeDatum,
        event: { dx: number; dy: number }
      ) => {
        if (d.fx === undefined || d.fy === undefined) {
          d.fx = d.x;
          d.fy = d.y;
        }
        d.fx += event.dx;
        d.fy += event.dy;
      },
      stop: (d: NodeDatum | StateNodeDatum) => {
        d.fx = undefined;
        d.fy = undefined;
      },
      setAlphaTarget: (
        event: { active: boolean },
        alphaTarget = 0,
        stateAlphaTarget = 0
      ) => {
        if (!event.active) {
          simulation.alphaTarget(alphaTarget).restart();
          stateSimulation.alphaTarget(stateAlphaTarget).restart();
        }
      },
    };

    const node = svg
      .selectAll(".node")
      .data(nodes)
      .call(
        // @ts-ignore
        d3
          .drag<SVGCircleElement, NodeDatum>()
          .on("start", function (event, d) {
            dragHelper.setAlphaTarget(event, 0.3, 0.8);
            dragHelper.start(d);
          })
          .on("drag", function (event, d) {
            dragHelper.drag(d, event);
          })
          .on("end", function (event, d) {
            dragHelper.setAlphaTarget(event);
            dragHelper.stop(d);
          })
      );

    const state = svg
      .selectAll(".state")
      .data(states)
      .call(
        // @ts-ignore
        d3
          .drag<SVGCircleElement, StateNodeDatum>()
          .on("start", function (event, d) {
            dragHelper.setAlphaTarget(event, 0.01, 0.5);
            dragHelper.start(d);
          })
          .on("drag", function (event, d) {
            dragHelper.drag(d, event);
          })
          .on("end", function (event, d) {
            dragHelper.setAlphaTarget(event);
            dragHelper.stop(d);
          })
      );

    const link = svg.selectAll(".link").data(links);
    const name = svg.selectAll(".name").data(nodes);

    const drawLink = function (d: LinkDatum) {
      const x1 = d.source.x || 0;
      const y1 = d.source.y || 0;
      const x2 = d.target.x || 0;
      const y2 = d.target.y || 0;
      const dx = x2 - x1 || 1e-6;
      const dy = y2 - y1 || 1e-6;
      const l = Math.sqrt(dx * dx + dy * dy);
      const dir = { x: dx / l, y: dy / l };

      const r1 = stateRadius(d.source.flow);
      const r2 = stateRadius(d.target.flow);

      // @ts-ignore
      d3.select(this)
        .attr("x1", x1 + r1 * dir.x)
        .attr("y1", y1 + r1 * dir.y)
        .attr("x2", x2 - r2 * dir.x)
        .attr("y2", y2 - r2 * dir.y);
    };

    simulation.on("tick", () => {
      link.each(drawLink);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      state.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      name.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });
  }, [
    ref,
    nodes,
    physicalLinks,
    states,
    links,
    stateRadius,
    simulation,
    stateSimulation,
  ]);

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox={`-2000 -2000 4000 4000`}
    >
      <defs>
        <marker
          id="arrow"
          markerHeight={5}
          markerWidth={5}
          orient="auto"
          refX={3}
          viewBox="-5 -5 10 10"
        >
          <path d="M 0,0 m -5,-5 L 5,0 L -5,5 Z" fill="#333" />
        </marker>
      </defs>
      <g id="zoomable">
        <g className="nodes">
          {nodes.map((node) => (
            <circle
              className="node"
              key={node.id}
              cx={0}
              cy={0}
              r={nodeRadius}
              fill="#fafafa"
              stroke="#333"
              strokeWidth={2}
            />
          ))}
        </g>
        <g className="links">
          {links.map((link) => (
            <line
              className="link"
              key={`${link.source.id}-${link.target.id}`}
              x1={0}
              y1={0}
              x2={0}
              y2={0}
              strokeWidth={linkWidth(link.weight)}
              stroke="#333"
              opacity={0.8}
              markerEnd="url(#arrow)"
            />
          ))}
        </g>
        <g className="states">
          {states.map((state) => (
            <circle
              className="state"
              key={state.id}
              cx={0}
              cy={0}
              r={stateRadius(state.flow)}
              fill={nodeFill[state.moduleId]}
              stroke={nodeStroke[state.moduleId]}
              strokeWidth={2}
            />
          ))}
        </g>
        {showNames && (
          <g className="names">
            {nodes.map((node) => (
              <text
                className="name"
                key={node.id}
                x={0}
                y={0}
                textAnchor="start"
                dominantBaseline="central"
                fontFamily="Helvetica"
                fontSize={fontSize}
                dx={nodeRadius}
                dy={-fontSize}
                fill="#333"
                stroke="#fff"
                strokeWidth={4}
                paintOrder="stroke"
              >
                {node.name}
              </text>
            ))}
          </g>
        )}
      </g>
    </svg>
  );
}
