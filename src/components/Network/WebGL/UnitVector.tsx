import { forwardRef, useLayoutEffect, useState } from "react";
import { Vector2 } from "three";
import { Object3DNode } from "@react-three/fiber";
import {
  Line2,
  LineGeometry,
  LineMaterial,
  LineMaterialParameters,
} from "three-stdlib";

export type LineProps = LineMaterialParameters &
  Omit<Object3DNode<Line2, typeof Line2>, "args"> &
  Omit<
    Object3DNode<LineMaterial, [LineMaterialParameters]>,
    "color" | "vertexColors" | "resolution" | "args"
  >;

const lineGeom = new LineGeometry();
lineGeom.setPositions(
  [
    [0, 0, 0],
    [0, 1, 0],
  ].flat()
);
const resolution = new Vector2(512, 512);

export default forwardRef<Line2, LineProps>(function Line(
  { color = "black", lineWidth, ...rest },
  ref
) {
  const [line2] = useState(() => new Line2());
  const [lineMaterial] = useState(() => new LineMaterial());

  useLayoutEffect(() => {
    line2.computeLineDistances();
  }, [line2]);

  return (
    <primitive object={line2} ref={ref} {...rest}>
      <primitive object={lineGeom} attach="geometry" />
      <primitive
        object={lineMaterial}
        attach="material"
        color={color}
        vertexColors={false}
        resolution={resolution}
        linewidth={lineWidth}
        alphaWrite={false}
        {...rest}
      />
    </primitive>
  );
});
