import { Fragment, useMemo, useRef } from "react";
import * as THREE from "three";
import { Line2 } from "three-stdlib";
import { Canvas, useFrame } from "@react-three/fiber";
import { Cylinder, Line, MapControls, Text } from "@react-three/drei";
import type { RendererProps } from "./Network";
import type { LinkDatum, NodeDatum, StateNodeDatum } from "../../types/datum";

interface WebGLRendererProps extends RendererProps {}

export default function WrappedWebGLRenderer(props: WebGLRendererProps) {
  return (
    <Canvas
      camera={{
        near: 10,
        far: 50000,
        position: [0, 0, 3000],
        up: [0, 0, 1],
      }}
    >
      <ambientLight />
      <pointLight />
      <WebGLRenderer {...props} />
      <MapControls />
    </Canvas>
  );
}

function WebGLRenderer({
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
}: WebGLRendererProps) {
  const stateMaterials = useMemo(() => {
    const moduleIds = new Set(states.map((state) => state.moduleId));
    return new Map(
      Array.from(moduleIds).map((moduleId) => [
        moduleId,
        new THREE.MeshStandardMaterial({ color: nodeFill[moduleId] }),
      ])
    );
  }, [states, nodeFill]);

  return (
    <>
      {nodes.map((node, i) => (
        <Fragment key={i}>
          {showNames && (
            <Name node={node} r={nodeRadius} fontSize={fontSize} z={20} />
          )}
          <Node node={node} r={nodeRadius} />
        </Fragment>
      ))}
      {links.map((link, i) => (
        <Link
          key={i}
          link={link}
          z={10}
          width={linkWidth(link.weight) / 3}
          color={
            link.source.moduleId === link.target.moduleId
              ? nodeStroke[link.source.moduleId]
              : "#333"
          }
        />
      ))}
      {states.map((state, i) => (
        <Node
          key={i}
          node={state}
          z={10}
          r={stateRadius(state.flow)}
          material={stateMaterials.get(state.moduleId)}
        />
      ))}
    </>
  );
}

const nodeMaterial = new THREE.MeshStandardMaterial({
  color: 0xfafafa,
});

function Node({
  node,
  z = 0,
  r,
  material = nodeMaterial,
}: {
  node: NodeDatum | StateNodeDatum;
  z?: number;
  r: number;
  material?: THREE.Material;
}) {
  const ref = useRef<THREE.Mesh>();

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.x = node.x;
    ref.current.position.y = node.y;
  });

  return (
    <Cylinder
      ref={ref}
      position={[node.x, node.y, z]}
      rotation={[Math.PI / 2, 0, 0]}
      args={[r, r, 10, 32, 1]}
      material={material}
    />
  );
}

function Name({
  node,
  z = 0,
  r,
  fontSize,
}: {
  node: NodeDatum | StateNodeDatum;
  z?: number;
  r: number;
  fontSize: number;
}) {
  const ref = useRef<THREE.Mesh>();

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.x = node.x;
    ref.current.position.y = node.y;
  });

  return (
    <Text
      ref={ref}
      position={[node.x, node.y, z]}
      color="#555"
      strokeColor="#fff"
      strokeWidth={0.2}
      fontSize={fontSize * 0.7}
      anchorX={-r * 0.7}
      anchorY={-fontSize * 1.5}
    >
      {node.name}
    </Text>
  );
}

function Link({
  link,
  z = 0,
  color,
  width,
}: {
  link: LinkDatum;
  z?: number;
  color: string;
  width: number;
}) {
  const ref = useRef<Line2>(null);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.geometry.dispose();
    ref.current.geometry.setPositions([
      link.source.x,
      link.source.y,
      z,
      link.target.x,
      link.target.y,
      z,
    ]);
  });

  return (
    <Line
      ref={ref}
      points={[
        [link.source.x, link.source.y, z],
        [link.target.x, link.target.y, z],
      ]}
      lineWidth={width}
      color={color}
      alphaWrite={false}
    />
  );
}
