export type Node = {
  id: number;
  name: string;
};

export type StateNode = {
  id: number;
  physicalId: number;
  name?: string;
};

export type Link = {
  source: number;
  target: number;
  weight: number;
};

export type StateNetwork = {
  nodes: Node[];
  states: StateNode[];
  links: Link[];
};

type Context = "nodes" | "states" | "links";

export default function parseStates(lines: string | string[]): StateNetwork {
  lines = Array.isArray(lines) ? lines : lines.split("\n").filter(Boolean);

  const nodes = [];
  const states = [];
  const links = [];

  let context: Context | null = null;

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
      const [id, ...name] = line.split(" ");
      nodes.push({
        id: +id,
        name: parseName(name.join(" ")) ?? id,
      });
    } else if (context === "states") {
      const [id, physicalId, ...name] = line.split(" ");
      const state: StateNode = {
        id: +id,
        physicalId: +physicalId,
      };
      const parsedName = parseName(name.join(" "));
      if (parsedName) {
        state.name = parsedName;
      }
      states.push(state);
    } else if (context === "links") {
      const [source, target, weight] = line.split(" ").map(Number);
      links.push({
        source,
        target,
        weight,
      });
    }
  }

  if (nodes.length === 0) {
    const ids = new Set(states.map((s) => s.physicalId));
    ids.forEach((id) => {
      nodes.push({
        id,
        name: id.toString(),
      });
    });
  }

  return { nodes, states, links };
}

function parseName(name: string): string | undefined {
  name = unquote(name);
  return name.length === 0 ? undefined : name;
}

function unquote(name: string): string {
  return name.replace(/"/g, "");
}
