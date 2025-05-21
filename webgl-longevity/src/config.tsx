import { isMobile } from "react-device-detect";
import { FloatType } from "three";

const config = {
  floatType: FloatType,
  camera: {
    fov: 20,
    initPos: { x: 0, y: 0, z: isMobile ? 12 : 7 },
    near: 0.1,
    far: 20
  },
  simulation: {
    textureWidth: 2500,
    textureHeight: 4,
    numOfFrames: 139
  },
  controls: {
    autoRotate: true,
    minDistance: 4,
    enabled: true,
    enablePan: false
  }
};

export { config };
