import { useGSAP } from "@gsap/react";
import { useFBO } from "@react-three/drei";
import {
  createPortal,
  extend,
  MaterialNode,
  useFrame,
  useThree
} from "@react-three/fiber";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useControls } from "leva";
import { MutableRefObject, RefObject, useEffect, useMemo, useRef } from "react";
import { isMobile } from "react-device-detect";
import {
  CanvasTexture,
  FloatType,
  ImageBitmapLoader,
  MathUtils,
  NearestFilter,
  OrthographicCamera,
  Points,
  RGBAFormat,
  Scene,
  WebGLRenderTarget
} from "three";
gsap.registerPlugin(ScrollTrigger);

import { config } from "../config";
import { textureInfo } from "../data/textureInfo";
import { useInput } from "../hooks/useInput";
import { DofPointsMaterial } from "../materials/dofPointsMaterial";
import { SimulationMaterial } from "../materials/simulationMaterial";
import { globalFlowMapStore } from "../state/flowMap";

// r3f typescript stuff
extend({ SimulationMaterial });
extend({ DofPointsMaterial });
declare module "@react-three/fiber" {
  interface ThreeElements {
    simulationMaterial: MaterialNode<
      SimulationMaterial,
      typeof SimulationMaterial
    >;
    dofPointsMaterial: MaterialNode<
      DofPointsMaterial,
      typeof DofPointsMaterial
    >;
  }
}

const CONTROLS_DEFAULT = {
  focus: { value: 7.0, min: 3, max: 20, step: 0.01 },
  speed: { value: 1.0, min: 0.1, max: 2, step: 0.1 },
  aperture: { value: isMobile ? 10.0 : 4.5, min: 1, max: 5.6, step: 0.1 },
  fov: { value: 50, min: 0, max: 200 },
  curl: { value: 2.0, min: 0.01, max: 3.0, step: 0.01 },
  introAmount: { value: 0, min: 0.0, max: 1.0, step: 0.001 },
  telomereAmount: { value: 0, min: 0.0, max: 1.0, step: 0.001 },
  DNAAmount: { value: 0, min: 0.0, max: 1.0, step: 0.001 },
  mitAmount: { value: 0, min: 0.0, max: 1.0, step: 0.001 },
  cellsAmount: { value: 0, min: 0.0, max: 1.0, step: 0.001 },
  stemCellsAmount: { value: 0, min: 0.0, max: 1.0, step: 0.001 },
  exosomesAmount: { value: 0, min: 0.0, max: 1.0, step: 0.001 },
  insulinAmount: { value: 0, min: 0.0, max: 1.0, step: 0.001 },
  proteostasisAmount: { value: 0, min: 0.0, max: 1.0, step: 0.001 },
  histonesAmount: { value: 0, min: 0.0, max: 1.0, step: 0.001 },
  macroAmount: { value: 0, min: 0.0, max: 1.0, step: 0.001 },
  dysbiosisAmount: { value: 0, min: 0.0, max: 1.0, step: 0.001 },
  inflammationAmount: { value: 0, min: 0.0, max: 1.0, step: 0.001 }
};

const ANIMATION_VALUES: any = {
  introAmount: 0,
  telomereAmount: 0,
  DNAAmount: 0,
  mitAmount: 0,
  cellsAmount: 0,
  stemCellsAmount: 0,
  exosomesAmount: 0,
  insulinAmount: 0,
  proteostasisAmount: 0,
  histonesAmount: 0,
  macroAmount: 0,
  dysbiosisAmount: 0,
  inflammationAmount: 0,
  objectRotation: { x: 0, y: 0, z: 0 },
  cameraPosition: { ...config.camera.initPos },
  speedMultiplier: 0
};

interface Rotations {
  [propName: string]: { x: number; y: number; z: number };
}
const SECTION_ROTATIONS: Rotations = {
  intro: { x: 0, y: -Math.PI / 2, z: 0 },
  telomere: { x: 0, y: 0, z: 0 },
  DNA: { x: 0, y: Math.PI / 4, z: 0 },
  mit: { x: -Math.PI / 2, y: 0, z: 0 },
  cells: { x: 0, y: 0, z: 0 },
  stemCells: { x: 0, y: 0, z: 0 },
  exosomes: { x: 0, y: 0, z: 0 },
  insulin: { x: 0, y: 0, z: 0 },
  proteostasis: { x: 0, y: Math.PI, z: 0 },
  histones: { x: 0, y: -Math.PI, z: 0 },
  macro: { x: 0, y: 0, z: 0 },
  dysbiosis: { x: 0, y: 0, z: 0 },
  inflammation: { x: 0, y: 0, z: 0 }
};

const BLEND_TWEENS = {
  intro: null,
  telomere: null,
  DNA: null,
  mit: null,
  cells: null,
  stemCells: null,
  exosomes: null,
  insulin: null,
  proteostasis: null,
  histones: null,
  macro: null,
  dysbiosis: null,
  inflammation: null
};

// tween parameters
const TRANSITION_SPEED = 1.5;
const DEFAULT_EASING = "power3.in";
const DEFAULT_DELAY = 0.1;

const numOfFrames = config.simulation.numOfFrames; // total number of frames in each animation texture
const width = config.simulation.textureWidth;
const height = config.simulation.textureHeight;

interface DataProps {
  causesOfAging: Array<{ causeOfAgingType: string }>;
}

interface ParticlesProps {
  refs?: MutableRefObject<RefObject<HTMLDivElement>[]>;
  data?: DataProps;
  introRef?: MutableRefObject<HTMLDivElement | null>;
  type?: string;
}

export function Particles(props: ParticlesProps) {
  const simRef = useRef<SimulationMaterial | null>(null); // material used for particle simulation
  const renderRef = useRef<DofPointsMaterial | null>(null); // material used for rendering particles to screen
  const pointsRef = useRef<Points>(null!);

  const { camera } = useThree(); // main three js camera

  const input = useInput(); // mouse/touch data
  const scaledFrame = useRef(0.0); // scaled frame counter - allows control of animation speed

  const flowMapRef = useRef(globalFlowMapStore.getState().flowMap); // mouse/touch position flow map passed to particle simulation to perturb particles
  useEffect(
    () =>
      globalFlowMapStore.subscribe(
        (state) => (flowMapRef.current = state.flowMap)
      ),
    []
  ); // allows access to flowmap each frame

  const textureLoader = useMemo(() => new ImageBitmapLoader(), []);
  textureLoader.setOptions({ imageOrientation: "flipY" });

  const [params, set] = useControls(() => CONTROLS_DEFAULT);
  const animationRef = useRef<any>({ ...ANIMATION_VALUES }); // object of values for GSAP to animate
  const animationTextures = useRef<any>(textureInfo); // object containing data about animation textures
  const blendTweens = useRef<any>({ ...BLEND_TWEENS }); // tweens used for blending between animations
  const activeSection = useRef<string | null>(); // keep track of current active section

  /**
   * @param key animation key
   * @returns null
   */
  function loadAnimationTexture(key: string) {
    const animData = animationTextures.current[key];

    if (animData.loaded === true) {
      // if animation data already available and, tween to this animation
      if (activeSection.current === key) {
        blendTweens.current[key].play();
      }

      return;
    }

    if (animData.loadingMutex === true) {
      // if animation data is already in loading, state exit early
      return;
    }

    animData.loadingMutex = true; // set loading state

    // capitalize key for uniforms
    const capitalKey = key.charAt(0).toUpperCase() + key.slice(1);

    // load animation data and once ready, update shader uniforms
    textureLoader.load(animData.posPath, (imageBitmap) => {
      const texture = new CanvasTexture(imageBitmap);
      texture.minFilter = animData.posFilter;
      texture.magFilter = animData.posFilter;
      texture.generateMipmaps = false;

      const uniformKey = "vatPos" + capitalKey;
      simRef.current!.uniforms[uniformKey].value = texture;

      animData.loaded = true; // set loaded flag

      if (activeSection.current === key) {
        // tween to this animation
        blendTweens.current[key].play();

        // start animation on first frame
        if (frame.current % 2 === 0) {
          frame.current = 0;
          scaledFrame.current = 0;
        } else {
          frame.current = 1;
          scaledFrame.current = 1;
        }
      }
    });

    // if this animation has associated colour data, load this and update uniform once ready
    if (typeof animData.colPath !== "undefined") {
      textureLoader.load(animData.colPath, (imageBitmap) => {
        const texture = new CanvasTexture(imageBitmap);
        texture.minFilter = animData.colFilter;
        texture.magFilter = animData.colFilter;
        texture.generateMipmaps = false;

        const uniformKey = "vatCol" + capitalKey;
        renderRef.current!.uniforms[uniformKey].value = texture;
      });
    }
  }

  // reset loaded state if coming back to this page
  function resetTextureState() {
    Object.keys(animationTextures.current).forEach((key) => {
      animationTextures.current[key].loaded = false;
      animationTextures.current[key].loadingMutex = false;
    });
  }

  // check if we are looking at a single cause of aging page
  useEffect(() => {
    if (typeof props.type !== "undefined") {
      activeSection.current = props.type;

      createBlendTween(props.type);

      // animate object rotation
      const currentRotation = SECTION_ROTATIONS[props.type];
      gsap.to(animationRef.current.objectRotation, {
        ease: "power2.in",
        x: currentRotation.x,
        y: currentRotation.y,
        z: currentRotation.z,
        duration: 1,
        onUpdate: () => {
          if (pointsRef.current) {
            pointsRef.current.rotation.set(
              animationRef.current.objectRotation.x,
              animationRef.current.objectRotation.y,
              animationRef.current.objectRotation.z
            );
          }
        }
      });

      loadAnimationTexture(props.type);
    }
  }, [props.type]);

  function createBlendTween(type: any) {
    const propertyName = type + "Amount";
    blendTweens.current[type] = gsap.to(animationRef.current, {
      ease: DEFAULT_EASING,
      delay: DEFAULT_DELAY,
      [propertyName]: 1.0,
      duration: TRANSITION_SPEED,
      onUpdate: () => {
        set({ [propertyName]: animationRef.current[propertyName] });
      }
    });
    blendTweens.current[type].pause(); // stop blend tween here and play once texture data is available
  }

  // set up scroll triggered animation on mount
  useGSAP(() => {
    // ScrollTrigger.enable();

    const gsapContext = gsap.context(() => {
      if (props.refs && props.data) {
        // add intro element ref to array
        const sectionRefs = [props.introRef, ...props.refs.current];
        const sectionDataArr = [
          { causeOfAgingType: "intro" },
          ...props.data.causesOfAging
        ];

        sectionRefs.forEach((elementRef, i) => {
          // get section data
          const sectionData = sectionDataArr[i];
          const type = sectionData.causeOfAgingType;
          const propertyName = type + "Amount";

          let nextType = "";
          if (typeof sectionDataArr[i + 1] !== "undefined") {
            nextType = sectionDataArr[i + 1].causeOfAgingType;
          }
          let prevType = "";
          if (typeof sectionDataArr[i - 1] !== "undefined") {
            prevType = sectionDataArr[i - 1].causeOfAgingType;
          }

          // TODO: [lukemartin] Disabling snapping altogether for now as it's causing issues on mobile
          let shouldSnap = false;
          if (type === "intro") {
            shouldSnap = false;
          }

          ScrollTrigger.create({
            trigger: elementRef!.current,
            start: "top center",
            end: "+=70%",
            scrub: true,
            snap: shouldSnap
              ? { snapTo: isMobile ? [0.715] : [0.7], duration: 0.5 }
              : undefined,
            // markers: true,
            onToggle: async (e) => {
              if (e.isActive) {
                // set current section
                activeSection.current = type;

                // animate object rotation
                const currentRotation = SECTION_ROTATIONS[type];
                gsap.to(animationRef.current.objectRotation, {
                  ease: "power2.in",
                  x: currentRotation.x,
                  y: currentRotation.y,
                  z: currentRotation.z,
                  duration: 1,
                  onUpdate: () => {
                    if (pointsRef.current) {
                      pointsRef.current.rotation.set(
                        animationRef.current.objectRotation.x,
                        animationRef.current.objectRotation.y,
                        animationRef.current.objectRotation.z
                      );
                    }
                  }
                });

                // animate camera
                let cameraPosition = {
                  x: isMobile ? 0.0 : 0.9,
                  y: config.camera.initPos.y,
                  z: config.camera.initPos.z
                };
                if (i % 2 == 0) {
                  cameraPosition = {
                    x: isMobile ? 0.0 : -0.9,
                    y: config.camera.initPos.y,
                    z: config.camera.initPos.z
                  };
                }

                gsap.to(animationRef.current.cameraPosition, {
                  ease: DEFAULT_EASING,
                  x: cameraPosition.x,
                  y: cameraPosition.y,
                  z: cameraPosition.z,
                  duration: 1,
                  onUpdate: () => {
                    camera.position.set(
                      animationRef.current.cameraPosition.x,
                      animationRef.current.cameraPosition.y,
                      animationRef.current.cameraPosition.z
                    );
                  }
                });

                createBlendTween(type);

                // load in adjacent animation textures
                loadAnimationTexture(type);

                if (nextType) {
                  loadAnimationTexture(nextType);
                }
                if (prevType) {
                  loadAnimationTexture(prevType);
                }
              } else {
                gsap.killTweensOf(animationRef.current);
                animationRef.current[propertyName] = 0;
                set({ [propertyName]: 0 });
              }
            }
          });
        });
      }
    }, pointsRef);

    // cleanup
    return () => {
      resetTextureState();

      set({
        introAmount: 0,
        telomereAmount: 0,
        DNAAmount: 0,
        mitAmount: 0,
        cellsAmount: 0,
        stemCellsAmount: 0,
        exosomesAmount: 0,
        insulinAmount: 0,
        proteostasisAmount: 0,
        histonesAmount: 0,
        macroAmount: 0,
        dysbiosisAmount: 0,
        inflammationAmount: 0
      });

      animationRef.current = { ...ANIMATION_VALUES };
      animationRef.current.cameraPosition = { ...config.camera.initPos };
      blendTweens.current = { ...BLEND_TWEENS };

      activeSection.current = null;

      frame.current = 0;
      scaledFrame.current = 0;

      camera.position.set(
        config.camera.initPos.x,
        config.camera.initPos.y,
        config.camera.initPos.z
      );

      gsap.killTweensOf(animationRef.current);
      gsapContext.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      // ScrollTrigger.disable();
    };
  }, []);

  // Set up FBO
  const quadScene = useMemo(() => new Scene(), []);
  const quadCamera = useMemo(
    () => new OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1),
    []
  );
  const quadPositions = useMemo(
    () =>
      new Float32Array([
        -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0
      ]),
    []
  );
  const quadUVs = useMemo(
    () => new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]),
    []
  );

  const simRT = useRef<WebGLRenderTarget | null>(null);
  const frame = useRef(0);

  const target = useFBO(width, height, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat,
    stencilBuffer: false,
    type: FloatType,
    depthBuffer: false,
    depth: false
  });

  const target2 = useFBO(width, height, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat,
    stencilBuffer: false,
    type: FloatType,
    depthBuffer: false,
    depth: false
  });

  // particle uv in position texture
  const particleLookup = useMemo(() => {
    const length = width * height;
    const particleLookup = new Float32Array(length * 3);
    for (let i = 0; i < length; i++) {
      const x = (i % width) / width;
      const y = Math.floor(i / width) / height;

      particleLookup[i * 3 + 0] = x;
      particleLookup[i * 3 + 1] = y;
      particleLookup[i * 3 + 2] = 0;
    }

    return particleLookup;
  }, [width, height]);

  function swapBuffers() {
    if (frame.current % 2 === 0) {
      simRT.current = target;
    } else {
      simRT.current = target2;
    }
  }

  // slow down time when mouse pressed
  useEffect(() => {
    if (input.down === true) {
      gsap.to(animationRef.current, {
        ease: "power2.in",
        speedMultiplier: 0.0,
        duration: 0.5
      });
    } else {
      gsap.to(animationRef.current, {
        ease: "power2.in",
        speedMultiplier: 1.0,
        duration: 0.5
      });
    }
  }, [input.down]);

  useFrame((state) => {
    frame.current += 1; // increment current frame

    // scaledFrame.current += animationRef.current.speedMultiplier;
    scaledFrame.current += 1;

    swapBuffers(); // swap render targets for GPGPU setup

    state.gl.setRenderTarget(simRT.current);
    state.gl.render(quadScene, quadCamera);
    state.gl.setRenderTarget(null);

    if (!renderRef.current || !simRT.current || !simRef.current) {
      return;
    }

    const renderUniforms = renderRef.current.uniforms;

    renderUniforms.positions.value = simRT.current.texture;
    renderUniforms.uTime.value = scaledFrame.current;
    renderUniforms.uFocus.value = MathUtils.lerp(
      renderUniforms.uFocus.value,
      7.1 + Math.sin(scaledFrame.current * 0.0066), // animate focus in and out
      // params.focus,
      0.1
    );

    renderUniforms.uFov.value = MathUtils.lerp(
      renderUniforms.uFov.value,
      params.fov,
      0.1
    );
    renderUniforms.uBlur.value = MathUtils.lerp(
      renderUniforms.uBlur.value,
      (5.6 - params.aperture) * 9,
      0.1
    );

    renderUniforms.uDNAAmount.value = MathUtils.lerp(
      renderUniforms.uDNAAmount.value,
      params.DNAAmount,
      0.01
    );
    renderUniforms.uCellsAmount.value = MathUtils.lerp(
      renderUniforms.uCellsAmount.value,
      params.cellsAmount,
      0.01
    );
    renderUniforms.uStemCellsAmount.value = MathUtils.lerp(
      renderUniforms.uStemCellsAmount.value,
      params.stemCellsAmount,
      0.01
    );
    renderUniforms.uInsulinAmount.value = MathUtils.lerp(
      renderUniforms.uInsulinAmount.value,
      params.insulinAmount,
      0.01
    );
    renderUniforms.uProteostasisAmount.value = MathUtils.lerp(
      renderUniforms.uProteostasisAmount.value,
      params.proteostasisAmount,
      0.01
    );
    renderUniforms.uHistonesAmount.value = MathUtils.lerp(
      renderUniforms.uHistonesAmount.value,
      params.histonesAmount,
      0.01
    );
    renderUniforms.uMacroAmount.value = MathUtils.lerp(
      renderUniforms.uMacroAmount.value,
      params.macroAmount,
      0.01
    );
    renderUniforms.uDysbiosisAmount.value = MathUtils.lerp(
      renderUniforms.uDysbiosisAmount.value,
      params.dysbiosisAmount,
      0.01
    );
    renderUniforms.uInflammationAmount.value = MathUtils.lerp(
      renderUniforms.uInflammationAmount.value,
      params.inflammationAmount,
      0.01
    );

    renderUniforms.currentFrame.value =
      (Math.sin(scaledFrame.current * 0.0026) + 1) * 0.5 * (numOfFrames * 0.99);

    renderUniforms.uMousePosTexture.value = flowMapRef.current;

    if (renderUniforms.currentFrame.value < 1) {
      renderUniforms.currentFrame.value = 1;
    }

    const simUniforms = simRef.current.uniforms;

    simUniforms.positions.value = simRT.current.texture;
    simUniforms.uTime.value = state.clock.elapsedTime * params.speed;
    simUniforms.uCurlFreq.value = MathUtils.lerp(
      simUniforms.uCurlFreq.value,
      params.curl,
      0.1
    );
    simUniforms.uIntroAmount.value = params.introAmount;
    simUniforms.uTelomereAmount.value = params.telomereAmount;
    simUniforms.uDNAAmount.value = MathUtils.lerp(
      simUniforms.uDNAAmount.value,
      params.DNAAmount,
      0.1
    );
    simUniforms.uMitAmount.value = MathUtils.lerp(
      simUniforms.uMitAmount.value,
      params.mitAmount,
      0.1
    );
    simUniforms.uCellsAmount.value = MathUtils.lerp(
      simUniforms.uCellsAmount.value,
      params.cellsAmount,
      0.1
    );
    simUniforms.uStemCellsAmount.value = MathUtils.lerp(
      simUniforms.uStemCellsAmount.value,
      params.stemCellsAmount,
      0.1
    );
    simUniforms.uExosomesAmount.value = MathUtils.lerp(
      simUniforms.uExosomesAmount.value,
      params.exosomesAmount,
      0.1
    );
    simUniforms.uInsulinAmount.value = MathUtils.lerp(
      simUniforms.uInsulinAmount.value,
      params.insulinAmount,
      0.1
    );
    simUniforms.uProteostasisAmount.value = MathUtils.lerp(
      simUniforms.uProteostasisAmount.value,
      params.proteostasisAmount,
      0.1
    );
    simUniforms.uHistonesAmount.value = MathUtils.lerp(
      simUniforms.uHistonesAmount.value,
      params.histonesAmount,
      0.1
    );
    simUniforms.uMacroAmount.value = MathUtils.lerp(
      simUniforms.uMacroAmount.value,
      params.macroAmount,
      0.1
    );
    simUniforms.uDysbiosisAmount.value = MathUtils.lerp(
      simUniforms.uDysbiosisAmount.value,
      params.dysbiosisAmount,
      0.1
    );
    simUniforms.uInflammationAmount.value = MathUtils.lerp(
      simUniforms.uInflammationAmount.value,
      params.inflammationAmount,
      0.1
    );

    simUniforms.uMousePosTexture.value = flowMapRef.current;

    simUniforms.currentFrame.value = renderUniforms.currentFrame.value;
  });

  return (
    <>
      {createPortal(
        <mesh frustumCulled={false}>
          <simulationMaterial ref={simRef} />
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={quadPositions.length / 3}
              array={quadPositions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-uv"
              count={quadUVs.length / 2}
              array={quadUVs}
              itemSize={2}
            />
          </bufferGeometry>
        </mesh>,
        quadScene
      )}
      <points frustumCulled={false} ref={pointsRef}>
        <dofPointsMaterial ref={renderRef} />
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleLookup.length / 3}
            array={particleLookup}
            itemSize={3}
          />
        </bufferGeometry>
      </points>
    </>
  );
}
