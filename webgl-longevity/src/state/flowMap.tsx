import { Texture } from "three";
import { create } from "zustand";

interface FlowMapState {
  flowMap: Texture | null;
  setFlowMap: (by: Texture) => void;
  flowMapDensity: Texture | null;
  setFlowMapDensity: (by: Texture) => void;
}

const globalFlowMapStore = create<FlowMapState>((set) => ({
  flowMap: null,
  setFlowMap: (value) => set(() => ({ flowMap: value })),
  flowMapDensity: null,
  setFlowMapDensity: (value) => set(() => ({ flowMapDensity: value }))
}));

export { globalFlowMapStore };
