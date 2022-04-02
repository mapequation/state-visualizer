import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Line2 } from "three-stdlib";
import { Canvas, useFrame } from "@react-three/fiber";
import { Cylinder, Line, MapControls, Text } from "@react-three/drei";
import type { RendererProps } from "./Renderer";
import type { LinkDatum, NodeDatum, StateNodeDatum } from "../../types/datum";

interface WebGLRendererProps extends RendererProps {}

export default function WrappedWebGLRenderer(props: WebGLRendererProps) {
  return (
    <Canvas
      camera={{
        near: 0.1,
        far: 1000,
        fov: 85,
        position: [0, 0, 30],
        up: [0, 0, 1],
      }}
    >
      <ambientLight />
      <pointLight position={[10, 10, 100]} />
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
    <object3D scale={0.02}>
      {nodes.map((node, i) => (
        <Node
          key={i}
          node={node}
          r={nodeRadius}
          fontSize={fontSize}
          showName={showNames}
        />
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
        <StateNode
          key={i}
          node={state}
          z={10}
          r={stateRadius(state.flow)}
          material={stateMaterials.get(state.moduleId)}
        />
      ))}
    </object3D>
  );
}

const nodeMaterial = new THREE.MeshStandardMaterial({
  color: 0xfafafa,
});

function Node({
  node,
  z = 0,
  r,
  fontSize,
  showName = true,
  material = nodeMaterial,
}: {
  node: NodeDatum | StateNodeDatum;
  z?: number;
  r: number;
  fontSize: number;
  showName?: boolean;
  material?: THREE.Material;
}) {
  const ref = useRef<THREE.Mesh>();

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.x = node.x;
    ref.current.position.y = -node.y;
  });

  return (
    <object3D ref={ref} position={[node.x, -node.y, z]}>
      <Cylinder
        rotation={[Math.PI / 2, 0, 0]}
        args={[r, r, 10, 32, 1]}
        material={material}
      />
      <Text
        color="#555"
        position={[0, 0, 20]}
        strokeColor="#fff"
        strokeWidth={0.2}
        fontSize={fontSize * 0.7}
        anchorX={-r * 0.7}
        anchorY={-fontSize * 1.5}
        visible={showName}
      >
        {node.name}
      </Text>
    </object3D>
  );
}

function StateNode({
  node,
  z = 0,
  r,
  material = nodeMaterial,
}: {
  node: StateNodeDatum;
  z?: number;
  r: number;
  material?: THREE.Material;
}) {
  const ref = useRef<THREE.Mesh>();

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.x = node.x;
    ref.current.position.y = -node.y;
  });

  return (
    <Cylinder
      ref={ref}
      position={[node.x, -node.y, z + Math.random()]}
      rotation={[Math.PI / 2, 0, 0]}
      args={[r, r, 10, 32, 1]}
      material={material}
    />
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
      -link.source.y,
      z,
      link.target.x,
      -link.target.y,
      z,
    ]);
  });

  return (
    <Line
      ref={ref}
      points={[
        [link.source.x, -link.source.y, z],
        [link.target.x, -link.target.y, z],
      ]}
      lineWidth={width}
      color={color}
      alphaWrite={false}
    />
  );
}
