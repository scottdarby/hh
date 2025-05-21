import {
  OrthographicCamera,
  ScreenQuad,
  shaderMaterial,
  useFBO
} from "@react-three/drei";
import {
  createPortal,
  extend,
  MaterialNode,
  useFrame,
  useThree
} from "@react-three/fiber";
import { useControls } from "leva";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BufferAttribute,
  Color,
  LinearFilter,
  Mesh,
  OrthographicCamera as OCamera,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3
} from "three";

import { config } from "../config";
import { useInput } from "../hooks/useInput";
import advectFrag from "../shaders/advectFrag";
import divergenceFrag from "../shaders/divergenceFrag";
import emptyVert from "../shaders/emptyVert";
import gradientSubtractFrag from "../shaders/gradientSubtractFrag";
import pointerFrag from "../shaders/pointerFrag";
import pointerVelocityFrag from "../shaders/pointerVelocityFrag";
import pressureFrag from "../shaders/pressureFrag";
import { globalFlowMapStore } from "../state/flowMap";

const palette = [
  new Color(0x1a3dad).multiplyScalar(1.0),
  new Color(0x980000).multiplyScalar(1.0),
  new Color(0x009800).multiplyScalar(1.0)
];

declare module "@react-three/fiber" {
  interface ThreeElements {
    pointerVelocityMaterial: MaterialNode<
      ShaderMaterial,
      typeof ShaderMaterial
    >;
    pointerMaterial: MaterialNode<ShaderMaterial, typeof ShaderMaterial>;
    advectMaterial: MaterialNode<ShaderMaterial, typeof ShaderMaterial>;
    divergenceMaterial: MaterialNode<ShaderMaterial, typeof ShaderMaterial>;
    pressureMaterial: MaterialNode<ShaderMaterial, typeof ShaderMaterial>;
    gradientSubtractMaterial: MaterialNode<
      ShaderMaterial,
      typeof ShaderMaterial
    >;
  }
}

const FlowMap = () => {
  const { size } = useThree();

  // refs
  // const quadCamera = useRef();
  const quadCamera = useRef<OCamera | null>(null);
  const quadRef = useRef<Mesh | null>(null);
  const prevMouse = useRef(new Vector2());

  const downScale = useRef(0.5 * window.devicePixelRatio);
  const inkColor = useRef(palette[0]);
  const mouseDelta = useRef(new Vector3());
  const uRdx = useRef(new Vector2());
  const pressureIterations = useRef(1); // increase for higher quality fluid sim
  const input = useInput();
  const scene = useMemo(() => new Scene(), []);

  // context
  const setFlowMap = globalFlowMapStore((state) => state.setFlowMap);
  const setFlowMapDensity = globalFlowMapStore(
    (state) => state.setFlowMapDensity
  );

  // constructor
  useEffect(() => {
    if (quadRef.current) {
      // add uvs to ScreenQuad
      const geometry = quadRef.current.geometry;
      const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);
      geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
    }
  }, []);

  // state
  const [pixelSize, setPixelSize] = useState([
    Math.floor(size.width),
    Math.floor(size.height)
  ]);
  const [aspectRatio, setAspectRatio] = useState(0.0);

  // controls
  const {
    mouseRadius,
    velocityMultiplier,
    velocityDiffusion,
    densityDiffusion,
    gradientAmount,
    uFadeAmount
  } = useControls("Flowmap Params", {
    mouseRadius: {
      value: 0.001,
      min: 0.0001,
      max: 0.003,
      step: 0.0001
    },
    velocityMultiplier: {
      value: 1,
      min: 5,
      max: 40,
      step: 1
    },
    velocityDiffusion: {
      value: 1.0,
      min: 0.9,
      max: 1.0,
      step: 0.001
    },
    densityDiffusion: {
      value: 0.999,
      min: 0.99,
      max: 0.9999,
      step: 0.0001
    },
    gradientAmount: {
      value: 1.0,
      min: 0,
      max: 2.0,
      step: 0.05
    },
    uFadeAmount: {
      value: 0.995,
      min: 0.9,
      max: 1.0
    }
  });

  useEffect(() => {
    const width = Math.floor(size.width * downScale.current);
    const height = Math.floor(size.height * downScale.current);
    setPixelSize([width, height]);

    uRdx.current.set(1.0 / width, 1.0 / height);
  }, [size]);

  useEffect(() => {
    setAspectRatio(pixelSize[0] / pixelSize[1]);
  }, [pixelSize]);

  /*
    =========================================================
    Create Materials
    =========================================================
    */
  const PointerVelocityMaterial = shaderMaterial(
    {
      uResolution: new Vector2(pixelSize[0], pixelSize[1]),
      uTexture: null,
      uAspect: aspectRatio,
      uMousePos: new Vector2(),
      uMouseRadius: mouseRadius,
      uFadeAmount,
      uColor: new Vector3(),
      uScrollYDelta: 0.0,
      uScrollDeltaSinRandom: 0.0
    },
    emptyVert,
    pointerVelocityFrag
  );
  extend({ PointerVelocityMaterial });
  const pointerVelMatRef = useRef<ShaderMaterial | null>(null);

  const PointerMaterial = shaderMaterial(
    {
      uResolution: new Vector2(pixelSize[0], pixelSize[1]),
      uTexture: null,
      uAspect: aspectRatio,
      uMousePos: new Vector2(),
      uMouseRadius: mouseRadius,
      uFadeAmount,
      uColor: new Vector3(),
      uMouseDelta: new Vector3()
    },
    emptyVert,
    pointerFrag
  );
  extend({ PointerMaterial });
  const pointerMatRef = useRef<ShaderMaterial | null>(null);

  // Advection
  const AdvectMaterial = shaderMaterial(
    {
      uResolution: new Vector2(pixelSize[0], pixelSize[1]),
      uTexture: null,
      uVelocityTex: null,
      uRdx: new Vector2(),
      uTimestep: 0.0,
      uDiffusion: 0.0
    },
    emptyVert,
    advectFrag
  );
  extend({ AdvectMaterial });
  const advectMatRef = useRef<ShaderMaterial | null>(null);

  // Divergence
  const DivergenceMaterial = shaderMaterial(
    {
      uResolution: new Vector2(pixelSize[0], pixelSize[1]),
      uTexture: null,
      uRdx: new Vector2()
    },
    emptyVert,
    divergenceFrag
  );
  extend({ DivergenceMaterial });
  const divergenceMatRef = useRef<ShaderMaterial | null>(null);

  // Pressure
  const PressureMaterial = shaderMaterial(
    {
      uResolution: new Vector2(pixelSize[0], pixelSize[1]),
      uTexture: null, // pressure
      uDivergenceTex: null,
      uRdx: new Vector2()
    },
    emptyVert,
    pressureFrag
  );
  extend({ PressureMaterial });
  const pressureMatRef = useRef<ShaderMaterial | null>(null);

  // Gradient Subtract
  const GradientSubtractMaterial = shaderMaterial(
    {
      uResolution: new Vector2(pixelSize[0], pixelSize[1]),
      uPressureTex: null, // pressure
      uTexture: null,
      uRdx: new Vector2(),
      uGradientAmount: 1.0
    },
    emptyVert,
    gradientSubtractFrag
  );
  extend({ GradientSubtractMaterial });
  const gradientMatRef = useRef<ShaderMaterial | null>(null);

  /*
    =========================================================
    Create Render Targets
    =========================================================
    */
  const rtOptions = {
    multisample: false,
    // samples: 8,
    stencilBuffer: false,
    depthWrite: false,
    depthBuffer: false,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat,
    type: config.floatType
  };

  // velocity
  let velocityRtA = useFBO(pixelSize[0], pixelSize[1], rtOptions);
  let velocityRtB = useFBO(pixelSize[0], pixelSize[1], rtOptions);
  const swapVelocity = () => {
    const temp = velocityRtA;
    velocityRtA = velocityRtB;
    velocityRtB = temp;
  };

  // Density
  let densityRtA = useFBO(pixelSize[0], pixelSize[1], rtOptions);
  let densityRtB = useFBO(pixelSize[0], pixelSize[1], rtOptions);
  const swapDensity = () => {
    const temp = densityRtA;
    densityRtA = densityRtB;
    densityRtB = temp;
  };

  // Divergence
  const divergenceRt = useFBO(pixelSize[0], pixelSize[1], rtOptions);

  // Pressure
  let pressureRtA = useFBO(pixelSize[0], pixelSize[1], rtOptions);
  let pressureRtB = useFBO(pixelSize[0], pixelSize[1], rtOptions);
  const swapPressure = () => {
    const temp = pressureRtA;
    pressureRtA = pressureRtB;
    pressureRtB = temp;
  };

  useFrame((state, dt) => {
    if (
      !pointerVelMatRef.current ||
      !quadRef.current ||
      !quadCamera.current ||
      !pointerMatRef.current ||
      !advectMatRef.current ||
      !divergenceMatRef.current ||
      !pressureMatRef.current ||
      !gradientMatRef.current
    ) {
      return;
    }

    quadRef.current.material = pointerVelMatRef.current;

    const deltaX = (input.pos.x - prevMouse.current.x) * velocityMultiplier;
    const deltaY = (input.pos.y - prevMouse.current.y) * velocityMultiplier;

    prevMouse.current.x = input.pos.x;
    prevMouse.current.y = input.pos.y;

    pointerVelMatRef.current.uniforms.uResolution.value = [
      pixelSize[0],
      pixelSize[1]
    ];
    pointerVelMatRef.current.uniforms.uAspect.value = aspectRatio;
    pointerVelMatRef.current.uniforms.uMouseRadius.value = mouseRadius;
    pointerVelMatRef.current.uniforms.uFadeAmount.value = uFadeAmount;

    pointerVelMatRef.current.uniforms.uMousePos.value = input.pos;
    mouseDelta.current.set(deltaX, deltaY, 0);
    pointerVelMatRef.current.uniforms.uColor.value = mouseDelta.current;
    pointerVelMatRef.current.uniforms.uTexture.value = velocityRtA.texture;

    // setFlowMap(velocityRtA.texture)

    state.gl.setRenderTarget(velocityRtB);
    state.gl.render(scene, quadCamera.current);
    swapVelocity();

    // pointer density
    quadRef.current.material = pointerMatRef.current;

    pointerMatRef.current.uniforms.uResolution.value = [
      pixelSize[0],
      pixelSize[1]
    ];
    pointerMatRef.current.uniforms.uAspect.value = aspectRatio;
    pointerMatRef.current.uniforms.uMouseRadius.value = mouseRadius;
    pointerMatRef.current.uniforms.uFadeAmount.value = uFadeAmount;

    pointerMatRef.current.uniforms.uMousePos.value = input.pos;
    pointerMatRef.current.uniforms.uTexture.value = densityRtA.texture;
    pointerMatRef.current.uniforms.uColor.value = inkColor.current;
    pointerMatRef.current.uniforms.uMouseDelta.value = mouseDelta.current;
    state.gl.setRenderTarget(densityRtB);
    state.gl.render(scene, quadCamera.current);
    swapDensity();

    // advection
    quadRef.current.material = advectMatRef.current;

    // velocity advection
    advectMatRef.current.uniforms.uResolution.value = [
      pixelSize[0],
      pixelSize[1]
    ];
    advectMatRef.current.uniforms.uRdx.value = uRdx.current;
    advectMatRef.current.uniforms.uTimestep.value = dt * 1000;
    advectMatRef.current.uniforms.uDiffusion.value = velocityDiffusion;
    advectMatRef.current.uniforms.uTexture.value = velocityRtA.texture;
    advectMatRef.current.uniforms.uVelocityTex.value = velocityRtA.texture;
    state.gl.setRenderTarget(velocityRtB);
    state.gl.render(scene, quadCamera.current);
    swapVelocity();

    // density advection
    advectMatRef.current.uniforms.uTexture.value = densityRtA.texture;
    advectMatRef.current.uniforms.uVelocityTex.value = velocityRtA.texture;
    advectMatRef.current.uniforms.uDiffusion.value = densityDiffusion;
    state.gl.setRenderTarget(densityRtB);
    state.gl.render(scene, quadCamera.current);
    swapDensity();

    // divergence
    quadRef.current.material = divergenceMatRef.current;

    divergenceMatRef.current.uniforms.uResolution.value = [
      pixelSize[0],
      pixelSize[1]
    ];
    divergenceMatRef.current.uniforms.uTexture.value = velocityRtA.texture;
    divergenceMatRef.current.uniforms.uRdx.value = uRdx.current;
    state.gl.setRenderTarget(divergenceRt);
    state.gl.render(scene, quadCamera.current);

    // pressure
    quadRef.current.material = pressureMatRef.current;

    pressureMatRef.current.uniforms.uResolution.value = [
      pixelSize[0],
      pixelSize[1]
    ];
    pressureMatRef.current.uniforms.uRdx.value = uRdx.current;

    for (let i = 0; i < pressureIterations.current; i++) {
      pressureMatRef.current.uniforms.uTexture.value = pressureRtA.texture;
      pressureMatRef.current.uniforms.uDivergenceTex.value =
        divergenceRt.texture;
      state.gl.setRenderTarget(pressureRtB);
      state.gl.render(scene, quadCamera.current);
      swapPressure();
    }

    // subtract gradient
    quadRef.current.material = gradientMatRef.current;
    gradientMatRef.current.uniforms.uResolution.value = [
      pixelSize[0],
      pixelSize[1]
    ];
    gradientMatRef.current.uniforms.uRdx.value = uRdx.current;
    gradientMatRef.current.uniforms.uTexture.value = velocityRtA.texture;
    gradientMatRef.current.uniforms.uPressureTex.value = pressureRtA.texture;
    gradientMatRef.current.uniforms.uGradientAmount.value = gradientAmount;
    state.gl.setRenderTarget(velocityRtB);
    state.gl.render(scene, quadCamera.current);
    swapVelocity();

    setFlowMap(velocityRtA.texture);
    setFlowMapDensity(densityRtA.texture);

    // render density
    // quadRef.current.material = pointerMatRef.current

    // render to screen
    state.gl.setRenderTarget(null);
  });

  return createPortal(
    <>
      {/* <Leva hidden /> */}
      <ScreenQuad ref={quadRef} />
      <OrthographicCamera
        makeDefault={false}
        ref={quadCamera}
        position={[0, 0, 1]}
      />
      {/* Materials */}
      <pointerVelocityMaterial ref={pointerVelMatRef} attach="material" />
      <pointerMaterial ref={pointerMatRef} attach="material" />
      <advectMaterial ref={advectMatRef} attach="material" />
      <divergenceMaterial ref={divergenceMatRef} attach="material" />
      <pressureMaterial ref={pressureMatRef} attach="material" />
      <gradientSubtractMaterial ref={gradientMatRef} attach="material" />
    </>,
    scene
  );
};

export default FlowMap;
