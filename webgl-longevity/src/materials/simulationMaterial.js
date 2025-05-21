import { extend } from "@react-three/fiber";
import {
  DataTexture,
  FloatType,
  RGBAFormat,
  ShaderMaterial,
  Vector3
} from "three";

import { config } from "../config";
import simulationMaterialFrag from "../shaders/simulation.frag";
import simulationMaterialVert from "../shaders/simulation.vert";

export class SimulationMaterial extends ShaderMaterial {
  constructor() {
    const width = config.simulation.textureWidth;
    const height = config.simulation.textureHeight;

    const scale = 0.5;
    const arr = new Float32Array(width * height * 4);

    for (let i = 0; i < arr.length / 4; i++) {
      const randomNormalVector = new Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();
      const dist = Math.random() * scale;
      randomNormalVector.multiplyScalar(dist);

      arr[i * 4 + 0] = randomNormalVector.x;
      arr[i * 4 + 1] = randomNormalVector.y;
      arr[i * 4 + 2] = randomNormalVector.z;
      arr[i * 4 + 3] = Math.random();
    }

    const positionsTexture = new DataTexture(
      arr,
      width,
      height,
      RGBAFormat,
      FloatType
    );

    positionsTexture.needsUpdate = true;

    super({
      vertexShader: simulationMaterialVert,
      fragmentShader: simulationMaterialFrag,
      uniforms: {
        positions: { value: positionsTexture },
        vatPosIntro: { value: "" },
        vatPosTelomere: { value: "" },
        vatPosDNA: { value: "" },
        vatPosMit: { value: "" },
        vatPosCells: { value: "" },
        vatPosStemCells: { value: "" },
        vatPosExosomes: { value: "" },
        vatPosInsulin: { value: "" },
        vatPosProteostasis: { value: "" },
        vatPosHistones: { value: "" },
        vatPosMacro: { value: "" },
        vatPosDysbiosis: { value: "" },
        vatPosInflammation: { value: "" },

        currentFrame: { value: 0 },
        totalFrames: { value: 0 },
        uTime: { value: 0 },
        uCurlFreq: { value: 0.25 },

        uIntroAmount: { value: 0.0 },
        uTelomereAmount: { value: 0.0 },
        uDNAAmount: { value: 0.0 },
        uMitAmount: { value: 0.0 },
        uCellsAmount: { value: 0.0 },
        uStemCellsAmount: { value: 0.0 },
        uExosomesAmount: { value: 0.0 },
        uInsulinAmount: { value: 0.0 },
        uProteostasisAmount: { value: 0.0 },
        uHistonesAmount: { value: 0.0 },
        uMacroAmount: { value: 0.0 },
        uDysbiosisAmount: { value: 0.0 },
        uInflammationAmount: { value: 0.0 },

        uMousePosTexture: { value: "" }
      }
    });
  }
}

extend({ SimulationMaterial });
