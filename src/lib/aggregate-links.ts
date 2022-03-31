import type { LinkDatum, NodeDatum } from "../types/datum";

export default function aggregatePhysicalLinks(
  links: LinkDatum[]
): LinkDatum<NodeDatum>[] {
  const physicalLinks = links.map(({ source, target, weight }) => ({
    source: source.physicalNode,
    target: target.physicalNode,
    weight,
  }));

  const linkSources = new Map();

  physicalLinks.forEach((link) => {
    if (!linkSources.has(link.source)) {
      linkSources.set(link.source, new Map());
    }
    const targets = linkSources.get(link.source)!;
    targets.set(link.target, (targets.get(link.target) ?? 0) + link.weight);
  });

  const aggregatedPhysLinks = [];

  for (let [source, targets] of linkSources) {
    for (let [target, weight] of targets) {
      aggregatedPhysLinks.push({ source, target, weight });
    }
  }

  return aggregatedPhysLinks;
}
