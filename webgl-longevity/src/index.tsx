import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import React, { RefObject } from "react";
import { NoToneMapping } from "three";

import FlowMap from "./components/FlowMap";
import { ParentGroup } from "./components/ParentGroup";
import { Particles } from "./components/Particles";
import Post from "./components/Post";
import { config } from "./config";

interface DataProps {
  causesOfAging: Array<{ causeOfAgingType: string }>;
}

interface AppProps {
  refs?: React.MutableRefObject<RefObject<HTMLDivElement>[]>;
  data?: DataProps;
  introRef?: React.MutableRefObject<HTMLDivElement | null>;
  type?: string;
}

export function App({ refs, data, introRef, type }: AppProps) {
  return (
    <Canvas
      style={{ position: "relative" }}
      dpr={[1, 1]}
      linear
      camera={{
        fov: config.camera.fov,
        position: [
          config.camera.initPos.x,
          config.camera.initPos.y,
          config.camera.initPos.z
        ],
        near: 0.01,
        far: 100
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = NoToneMapping;
      }}
      gl={{
        antialias: false
      }}
    >
      <Post />
      <FlowMap />
      <ParentGroup>
        <Leva hidden />
        <Particles refs={refs} data={data} introRef={introRef} type={type} />
      </ParentGroup>
    </Canvas>
  );
}
