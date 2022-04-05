import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MapControls, Text } from "@react-three/drei";
import UnitVector from "./WebGL/UnitVector";
import type { MapControls as MapControlsImpl } from "three-stdlib";
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
    </Canvas>
  );
}

const raycaster = new THREE.Raycaster();

function WebGLRenderer({
  simulation: { simulation, stateSimulation },
  nodes,
  states,
  links,
  nodeRadius,
  showNames,
  interModuleLinks,
}: WebGLRendererProps) {
  const three = useThree();
  const controlsRef = useRef<MapControlsImpl>(null);

  useEffect(() => {
    const currentRef = controlsRef.current;
    if (!currentRef) return;
    three.set({ controls: currentRef });
  }, [controlsRef, three]);

  const drag = d3
    .drag<HTMLCanvasElement, unknown>()
    .subject(() => {
      raycaster.setFromCamera(three.mouse, three.camera);
      const intersection = raycaster
        .intersectObjects(three.scene.children)
        .find((i) => i.object.userData?.type === "node");
      const position = intersection?.object?.parent?.position;
      if (!position) return;
      return simulation.find(position.x, -position.y, 50);
    })
    .on("start", (event) => {
      if (!event.subject) return;
      const controls = three.controls as MapControlsImpl;
      controls.enabled = false;
      simulation.alphaTarget(0.3).restart();
      stateSimulation.alphaTarget(0.8).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    })
    .on("drag", (event) => {
      if (!event.subject) return;
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    })
    .on("end", (event) => {
      if (!event.subject) return;
      const controls = three.controls as MapControlsImpl;
      controls.enabled = true;
      simulation.alphaTarget(0);
      stateSimulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    });

  d3.select(three.gl.domElement).call(drag);

  const stateMaterials = useMemo(() => {
    const colors = new Set(states.map((state) => state.fill));
    return new Map(
      Array.from(colors).map((color) => [
        color,
        new THREE.MeshStandardMaterial({ color }),
      ])
    );
  }, [states]);

  return (
    <>
      <MapControls ref={controlsRef} />

      <object3D scale={0.02}>
        {nodes.map((node, i) => (
          <Node key={i} node={node} r={nodeRadius} showName={showNames} />
        ))}
        {links.map((link, i) => (
          <Link
            key={i}
            link={link}
            z={15}
            width={link.width!}
            color={link.stroke!}
            visible={interModuleLinks || !link.isInter}
          />
        ))}
        {states.map((state, i) => (
          <StateNode
            key={i}
            node={state}
            z={15}
            r={state.radius!}
            material={stateMaterials.get(state.fill!)}
          />
        ))}
      </object3D>
    </>
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
  showName = true,
}: {
  node: NodeDatum | StateNodeDatum;
  z?: number;
  r: number;
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
      <mesh
        geometry={nodeGeometry}
        material={nodeMaterial}
        scale={[r, r, 1]}
        userData={{ type: "node" }}
      />
      <Text
        color="#555"
        position={[0, 0, 22]}
        strokeColor="#fff"
        strokeWidth={0.2}
        fontSize={30}
        anchorX={-r * 0.7}
        anchorY={-35}
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
      position={[node.x, -node.y, z]}
      scale={[r, r, 1]}
    />
  );
}

function Link({
  link,
  z = 0,
  color,
  width,
  visible,
}: {
  link: LinkDatum;
  z?: number;
  color: string;
  width: number;
  visible: boolean;
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
      visible={visible}
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
