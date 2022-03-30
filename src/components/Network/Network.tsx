import { PropsWithChildren } from "react";
import {
  FlowNode,
  FlowStateNetwork,
  FlowStateNode,
} from "../../lib/merge-states-clu";
import { Link } from "../../lib/parse-states";

type StateNodeDatum = FlowStateNode & {
  x: number;
  y: number;
  r: number;
};

type LinkDatum<NodeType> = Link & {
  source: NodeType;
  target: NodeType;
};

type NodeDatum = FlowNode & {
  x: number;
  y: number;
  r: number;
};

export interface NetworkProps {
  network: FlowStateNetwork;
}

export default function Network({
  network,
  ...props
}: PropsWithChildren<NetworkProps>) {
  const width = 800;
  const height = 800;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`-${width / 2} -${height / 2} ${width} ${height}`}
    >
      {network.nodes.map((node) => (
        <circle key={node.id} cx={1} cy={2} r={10} fill="red" />
      ))}
    </svg>
  );
}
