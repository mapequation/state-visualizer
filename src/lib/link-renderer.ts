import { LinkDatum } from "../types/datum";

export default function linkRenderer(getRadius: (flow: number) => number) {
  return function drawLink(d: LinkDatum) {
    const x1 = d.source.x || 0;
    const y1 = d.source.y || 0;
    const x2 = d.target.x || 0;
    const y2 = d.target.y || 0;
    const dx = x2 - x1 || 1e-6;
    const dy = y2 - y1 || 1e-6;
    const l = Math.sqrt(dx * dx + dy * dy);
    const dir = { x: dx / l, y: dy / l };

    const r1 = getRadius(d.source.flow);
    const r2 = getRadius(d.target.flow);

    return {
      x1: x1 + r1 * dir.x,
      y1: y1 + r1 * dir.y,
      x2: x2 - r2 * dir.x,
      y2: y2 - r2 * dir.y,
      r1,
      r2,
    };
  };
}
