import { useFrame } from "@react-three/fiber";
import React, { ReactNode, useMemo, useRef } from "react";
import { isMobile } from "react-device-detect";
import { Euler, Group, MathUtils, Quaternion } from "three";

import { useInput } from "../hooks/useInput";

// input events responsible for global rotation of the object
export function ParentGroup({ children }: { children: ReactNode }) {
  const input = useInput();

  const [rEuler, rQuaternion] = useMemo(
    () => [new Euler(), new Quaternion()],
    []
  );
  const parentGroup = useRef<Group>(null);

  let sceneRotationSpeed = isMobile ? 0.01 : 0.1;
  const sceneRotationAmountX = isMobile ? 0.1 : 0.25;
  const sceneRotationAmountY = isMobile ? 0.1 : 0.25;

  useFrame(() => {
    // rotate mesh on mouse move
    if (parentGroup.current) {
      rEuler.set(
        MathUtils.clamp(
          -input.pos.y * Math.PI * sceneRotationAmountY,
          -0.5,
          0.5
        ),
        input.pos.x * Math.PI * sceneRotationAmountX,
        0
      );
      parentGroup.current.quaternion.slerp(
        rQuaternion.setFromEuler(rEuler),
        sceneRotationSpeed
      );
    }
  });

  return <group ref={parentGroup}>{children}</group>;
}
