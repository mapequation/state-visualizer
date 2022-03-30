export default function parseStates(lines: string[]): any {
  const nodes = [];
  const states = [];
  const links = [];

  let context = null;

  for (let line of lines) {
    if (line.startsWith("#")) {
      continue;
    }

    if (line.startsWith("*Vertices")) {
      context = "nodes";
      continue;
    }

    if (line.startsWith("*States")) {
      context = "states";
      continue;
    }

    if (line.startsWith("*Links")) {
      context = "links";
      continue;
    }

    if (context === "nodes") {
      let [id, ...name] = line.split(" ");
      nodes.push({ id: +id, name: name.join(" ").replace(/"/g, "") });
    } else if (context === "states") {
      let [stateId, physicalId, ...name] = line.split(" ");
      states.push({
        id: +stateId,
        physicalId: +physicalId,
        name: name.join(" ").replace('"', ""),
      });
    } else if (context === "links") {
      let [source, target, weight] = line.split(" ");
      links.push({ source: +source, target: +target, weight: +weight });
    }
  }

  if (nodes.length === 0) {
    const ids = new Set(states.map((s) => s.physicalId));
    for (let id of ids) {
      nodes.push({ id: id, name: id.toString() });
    }
  }

  return { nodes, states, links };
}
