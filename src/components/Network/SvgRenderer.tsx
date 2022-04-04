import { useEffect, useRef } from "react";
import * as d3 from "d3";
import linkRenderer from "../../lib/link-renderer";
import type { RendererProps } from "./Renderer";
import type { LinkDatum, NodeDatum } from "../../types/datum";

interface SVGRendererProps extends RendererProps {}

export default function SVGRenderer({
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

    const drag = d3
      .drag<SVGCircleElement, NodeDatum>()
      .on("start", function (event, d) {
        simulation.alphaTarget(0.3).restart();
        stateSimulation.alphaTarget(0.8).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", function (event, d) {
        d.fx += event.dx;
        d.fy += event.dy;
      })
      .on("end", function (event, d) {
        simulation.alphaTarget(0);
        stateSimulation.alphaTarget(0);
        d.fx = undefined;
        d.fy = undefined;
      });

    const node = svg
      .selectAll<SVGCircleElement, unknown>(".node")
      .data(nodes)
      .call(drag);

    const state = svg.selectAll(".state").data(states);

    const link = svg.selectAll(".link").data(links);
    const name = svg.selectAll(".name").data(nodes);

    const drawLink = linkRenderer(stateRadius);

    simulation.on("tick", () => {
      link.each(function (d: LinkDatum) {
        const { x1, y1, x2, y2 } = drawLink(d);
        d3.select(this)
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2);
      });

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      state.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      name.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });
  }, [ref, nodes, states, links, stateRadius, simulation, stateSimulation]);

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 4000 4000"
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
