import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { MapControls, Text } from "@react-three/drei";
import UnitVector from "./WebGL/UnitVector";
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
          width={linkWidth(link.weight)}
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

const nodeGeometry = new THREE.CylinderBufferGeometry(1, 1, 10, 20, 1);
nodeGeometry.rotateX(Math.PI / 2);

function Node({
  node,
  z = 0,
  r,
  fontSize,
  showName = true,
}: {
  node: NodeDatum | StateNodeDatum;
  z?: number;
  r: number;
  fontSize: number;
  showName?: boolean;
}) {
  const ref = useRef<THREE.Mesh>();

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.x = node.x;
    ref.current.position.y = -node.y;
  });

  return (
    <object3D ref={ref} position={[node.x, -node.y, z]}>
      <mesh geometry={nodeGeometry} material={nodeMaterial} scale={[r, r, 1]} />
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
    <mesh
      ref={ref}
      geometry={nodeGeometry}
      material={material}
      position={[node.x, -node.y, z + Math.random()]}
      scale={[r, r, 1]}
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
  const ref = useRef<THREE.Object3D>(null);
  const { posX, posY, scaleY, rotateZ } = getLinkTransform(link);

  useFrame(() => {
    if (!ref.current) return;

    const { posX, posY, scaleY, rotateZ } = getLinkTransform(link);

    ref.current.position.x = posX;
    ref.current.position.y = -posY;
    ref.current.scale.y = scaleY;
    ref.current.rotation.z = rotateZ;
  });

  return (
    <object3D
      ref={ref}
      position={[posX, -posY, z]}
      scale={[1, scaleY, 1]}
      rotation={[0, 0, rotateZ]}
    >
      <UnitVector lineWidth={width / 3} color={color} />
    </object3D>
  );
}

function getLinkTransform(link: LinkDatum) {
  const x1 = link.source.x;
  const y1 = link.source.y;
  const x2 = link.target.x;
  const y2 = link.target.y;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l = Math.sqrt(dx * dx + dy * dy);
  const theta = Math.atan2(dy, dx);
  const rotateZ = (3 * Math.PI) / 2 - theta;

  return {
    posX: x1,
    posY: y1,
    scaleY: l,
    rotateZ,
  };
}
