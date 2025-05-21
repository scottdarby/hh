import { LinearFilter, NearestFilter } from "three";

/**
 * Object containing data about animation textures
 *
 * loadingMutex: lock to prevent the same texture trying to load twice
 * loaded: bool if the texture is fully loaded
 * posPath: path to position texture
 * posFilter: Filter to use, usually Linear for linear interopolation between frames
 * colPath: path to colour texture
 * colFilter: Filter to use, usually Linear for linear interopolation between frames
 */
export const textureInfo = {
  intro: {
    loadingMutex: false,
    loaded: false,
    posPath: "/key-to-longevity/vat/intro/pos.png",
    posFilter: LinearFilter
  },
  telomere: {
    loadingMutex: false,
    loaded: false,
    posPath: "/key-to-longevity/vat/telomere/pos.png",
    posFilter: LinearFilter
  },
  DNA: {
    loadingMutex: false,
    loaded: false,
    posPath: "/key-to-longevity/vat/dna/pos.png",
    posFilter: LinearFilter,
    colPath: "/key-to-longevity/vat/dna/col.png",
    colFilter: LinearFilter
  },
  mit: {
    loadingMutex: false,
    loaded: false,
    posPath: "/key-to-longevity/vat/mitochondria/pos.png",
    posFilter: LinearFilter
  },
  cells: {
    loadingMutex: false,
    loaded: false,
    posPath: "/key-to-longevity/vat/cells/pos.png",
    posFilter: LinearFilter,
    colPath: "/key-to-longevity/vat/cells/col.png",
    colFilter: LinearFilter
  },
  stemCells: {
    loadingMutex: false,
    loaded: false,
    posPath: "/key-to-longevity/vat/stem-cells/pos.png",
    posFilter: LinearFilter,
    colPath: "/key-to-longevity/vat/stem-cells/col.png",
    colFilter: LinearFilter
  },
  exosomes: {
    loadingMutex: false,
    loaded: false,
    posPath: "/key-to-longevity/vat/exosomes/pos.png",
    posFilter: LinearFilter
  },
  insulin: {
    loadingMutex: false,
    loaded: false,
    posPath: "/key-to-longevity/vat/insulin/pos.png",
    posFilter: LinearFilter,
    colPath: "/key-to-longevity/vat/insulin/col.png",
    colFilter: LinearFilter
  },
  proteostasis: {
    loadingMutex: false,
    loaded: false,
    posPath: "/key-to-longevity/vat/proteostasis/pos.png",
    posFilter: LinearFilter,
    colPath: "/key-to-longevity/vat/proteostasis/col.png",
    colFilter: LinearFilter
  },
  histones: {
    loadingMutex: false,
    loaded: false,
    posPath: "/key-to-longevity/vat/histones/pos.png",
    posFilter: LinearFilter,
    colPath: "/key-to-longevity/vat/histones/col.png",
    colFilter: LinearFilter
  },
  macro: {
    loadingMutex: false,
    loaded: false,
    posPath: "/key-to-longevity/vat/macroautophagy/pos.png",
    posFilter: LinearFilter,
    colPath: "/key-to-longevity/vat/macroautophagy/col.png",
    colFilter: LinearFilter
  },
  dysbiosis: {
    loadingMutex: false,
    loaded: false,
    posPath: "/key-to-longevity/vat/dysbiosis/pos.png",
    posFilter: LinearFilter,
    colPath: "/key-to-longevity/vat/dysbiosis/col.png",
    colFilter: NearestFilter
  },
  inflammation: {
    loadingMutex: false,
    loaded: false,
    posPath: "/key-to-longevity/vat/inflammation/pos.png",
    posFilter: LinearFilter,
    colPath: "/key-to-longevity/vat/inflammation/col.png",
    colFilter: NearestFilter
  }
};
