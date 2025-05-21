import { extend } from "@react-three/fiber";
import { AdditiveBlending, ShaderMaterial } from "three";

import dofMaterialFrag from "../shaders/dofPoints.frag";
import dofMaterialVert from "../shaders/dofPoints.vert";

export class DofPointsMaterial extends ShaderMaterial {
  constructor() {
    super({
      vertexShader: dofMaterialVert,
      fragmentShader: dofMaterialFrag,
      uniforms: {
        positions: { value: null },
        uMousePosTexture: { value: null },
        uTime: { value: 0 },
        uFocus: { value: 5.1 },
        uFov: { value: 50 },
        uBlur: { value: 30 },
        uDNAAmount: { value: 0 },
        uCellsAmount: { value: 0 },
        uStemCellsAmount: { value: 0 },
        uInsulinAmount: { value: 0 },
        uProteostasisAmount: { value: 0 },
        uHistonesAmount: { value: 0 },
        uMacroAmount: { value: 0 },
        uDysbiosisAmount: { value: 0 },
        uInflammationAmount: { value: 0 },
        vatColDNA: { value: "" },
        vatColCells: { value: "" },
        vatColStemCells: { value: "" },
        vatColInsulin: { value: "" },
        vatColProteostasis: { value: "" },
        vatColHistones: { value: "" },
        vatColMacro: { value: "" },
        vatColDysbiosis: { value: "" },
        vatColInflammation: { value: "" },
        currentFrame: { value: 0 },
        totalFrames: { value: 0 }
      },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false
    });
  }
}

extend({ DofPointsMaterial });
