import { Bloom, EffectComposer } from "@react-three/postprocessing";
import React from "react";

const Post = () => {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.8}
        luminanceThreshold={0.0}
        luminanceSmoothing={0.9}
        height={800}
        kernelSize={2}
      />
    </EffectComposer>
  );
};

export default Post;
