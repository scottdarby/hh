#pragma glslify: curl4 = require(./curl4.glsl)

uniform sampler2D positions;
uniform sampler2D vatPosIntro;
uniform sampler2D vatPosTelomere;
uniform sampler2D vatPosDNA;
uniform sampler2D vatPosMit;
uniform sampler2D vatPosCells;
uniform sampler2D vatPosStemCells;
uniform sampler2D vatPosExosomes;
uniform sampler2D vatPosInsulin;
uniform sampler2D vatPosProteostasis;
uniform sampler2D vatPosHistones;
uniform sampler2D vatPosMacro;
uniform sampler2D vatPosDysbiosis;
uniform sampler2D vatPosInflammation;
uniform sampler2D uMousePosTexture;

uniform float uTime;
uniform float uCurlFreq;
uniform float currentFrame;

uniform float uIntroAmount;
uniform float uTelomereAmount;
uniform float uDNAAmount;
uniform float uMitAmount;
uniform float uCellsAmount;
uniform float uStemCellsAmount;
uniform float uExosomesAmount;
uniform float uInsulinAmount;
uniform float uProteostasisAmount;
uniform float uHistonesAmount;
uniform float uMacroAmount;
uniform float uDysbiosisAmount;
uniform float uInflammationAmount;

varying vec2 vUv;

void main() {

    float totalFrames = 139.0;
    float chunk = 1.0 / 8.0; // 1.0 / how many rows in texture/2

    float s = vUv.x;
    float t = vUv.y - fract( currentFrame / totalFrames ) * chunk;

    vec3 offset = vec3(0.1);

    // Intro
    float bboxMaxIntro = 0.80271;
    float bboxMinIntro = -0.73441;
    float boundingBoxRangeIntro = bboxMaxIntro - bboxMinIntro;
    vec3 positionsIntro = texture2D(vatPosIntro, vec2(s, (chunk + t))).rgb * boundingBoxRangeIntro + bboxMinIntro;
    vec3 positionsIntro2 = texture2D(vatPosIntro, vec2(s, t)).rgb * boundingBoxRangeIntro + bboxMinIntro;
    positionsIntro += (positionsIntro2 / 10.0);

    // Telomere
    float bboxMaxTelomere = 0.99204;
    float bboxMinTelomere = -0.25223;
    float boundingBoxRangeTelomere = bboxMaxTelomere - bboxMinTelomere;
    vec3 positionsTelomere = texture2D(vatPosTelomere, vec2(s, (chunk + t))).rgb * boundingBoxRangeTelomere + bboxMinTelomere;
    vec3 positionsTelomere2 = texture2D(vatPosTelomere, vec2(s, t)).rgb * boundingBoxRangeTelomere + bboxMinTelomere;
    positionsTelomere += positionsTelomere2 / 10.0;
    positionsTelomere *= 3.0;
    positionsTelomere.z -= 0.6;

    // DNA
    float bboxMaxDNA = 0.97311;
    float bboxMinDNA = -0.97367;
    float boundingBoxRangeDNA = bboxMaxDNA - bboxMinDNA;
    vec3 positionsDNA = texture2D(vatPosDNA, vec2(s, chunk + t)).rgb * boundingBoxRangeDNA + bboxMinDNA;
    vec3 positionsDNA2 = texture2D(vatPosDNA, vec2(s, t)).rgb * boundingBoxRangeDNA + bboxMinDNA;
    positionsDNA += positionsDNA2 / 10.0;
    positionsDNA *= 1.5;
    
    // Mitochondria
    float bboxMaxMit = 1.07439;
    float bboxMinMit = -1.0642;
    float boundingBoxRangeMit = bboxMaxMit - bboxMinMit;
    vec3 positionsMit = texture2D(vatPosMit, vec2(s, (chunk + t))).rgb * boundingBoxRangeMit + bboxMinMit;
    vec3 positionsMit2 = texture2D(vatPosMit, vec2(s, t)).rgb * boundingBoxRangeMit + bboxMinMit;
    positionsMit += positionsMit2 / 10.0;
    positionsMit *= 1.5;

    // Cells
    float bboxMaxCells = 2.91911;
    float bboxMinCells = -2.92403;
    float boundingBoxRangeCells = bboxMaxCells - bboxMinCells;
    vec3 positionsCells = texture2D(vatPosCells, vec2(s, (chunk + t))).rgb * boundingBoxRangeCells + bboxMinCells;
    vec3 positionsCells2 = texture2D(vatPosCells, vec2(s, t)).rgb * boundingBoxRangeCells + bboxMinCells;
    positionsCells += positionsCells2 / 10.0;
    positionsCells *= 0.3;

    // Stem Cells
    float bboxMaxStemCells = 1.30189;
    float bboxMinStemCells = -1.30801;
    float boundingBoxRangeStemCells = bboxMaxStemCells - bboxMinStemCells;
    vec3 positionsStemCells = texture2D(vatPosStemCells, vec2(s, (chunk + t))).rgb * boundingBoxRangeStemCells + bboxMinStemCells;
    vec3 positionsStemCells2 = texture2D(vatPosStemCells, vec2(s, t)).rgb * boundingBoxRangeStemCells + bboxMinStemCells;
    positionsStemCells += positionsStemCells2 / 10.0;
    positionsStemCells *= 0.8;

    // Exosomes
    float bboxMaxExosomes = 7.74214;
    float bboxMinExosomes = -7.92532;
    float boundingBoxRangeExosomes = bboxMaxExosomes - bboxMinExosomes;
    vec3 positionsExosomes = texture2D(vatPosExosomes, vec2(s, (chunk + t))).rgb * boundingBoxRangeExosomes + bboxMinExosomes;
    vec3 positionsExosomes2 = texture2D(vatPosExosomes, vec2(s, t)).rgb * boundingBoxRangeExosomes + bboxMinExosomes;
    positionsExosomes += positionsExosomes2 / 10.0;
    positionsExosomes *= 0.19;

    // Insulin
    float bboxMaxInsulin = 1.17219;
    float bboxMinInsulin = -0.81281;
    float boundingBoxRangeInsulin = bboxMaxInsulin - bboxMinInsulin;
    vec3 positionsInsulin = texture2D(vatPosInsulin, vec2(s, (chunk + t))).rgb * boundingBoxRangeInsulin + bboxMinInsulin;
    vec3 positionsInsulin2 = texture2D(vatPosInsulin, vec2(s, t)).rgb * boundingBoxRangeInsulin + bboxMinInsulin;
    positionsInsulin += (positionsInsulin2 / 10.0);
    positionsInsulin *= 0.9;

    // Proteostasis
    float bboxMaxProteostasis = 1.38109;
    float bboxMinProteostasis = -0.8158;
    float boundingBoxRangeProteostasis = bboxMaxProteostasis - bboxMinProteostasis;
    vec3 positionsProteostasis = texture2D(vatPosProteostasis, vec2(s, (chunk + t))).rgb * boundingBoxRangeProteostasis + bboxMinProteostasis;
    vec3 positionsProteostasis2 = texture2D(vatPosProteostasis, vec2(s, t)).rgb * boundingBoxRangeProteostasis + bboxMinProteostasis;
    positionsProteostasis += (positionsProteostasis2 / 10.0);
    positionsProteostasis *= 0.8;

    // Histones
    float bboxMaxHistones = 1.08382;
    float bboxMinHistones = -1.40185;
    float boundingBoxRangeHistones = bboxMaxHistones - bboxMinHistones;
    vec3 positionsHistones = texture2D(vatPosHistones, vec2(s, (chunk + t))).rgb * boundingBoxRangeHistones + bboxMinHistones;
    vec3 positionsHistones2 = texture2D(vatPosHistones, vec2(s, t)).rgb * boundingBoxRangeHistones + bboxMinHistones;
    positionsHistones += (positionsHistones2 / 10.0);
    positionsHistones *= 0.8;

    // Macroautophagy
    float bboxMaxMacro = 1.72923;
    float bboxMinMacro = -1.78051;
    float boundingBoxRangeMacro = bboxMaxMacro - bboxMinMacro;
    vec3 positionsMacro = texture2D(vatPosMacro, vec2(s, (chunk + t))).rgb * boundingBoxRangeMacro + bboxMinMacro;
    vec3 positionsMacro2 = texture2D(vatPosMacro, vec2(s, t)).rgb * boundingBoxRangeMacro + bboxMinMacro;
    positionsMacro += (positionsMacro2 / 10.0);
    positionsMacro *= 0.5;

    // Dysbiosis
    float bboxMaxDysbiosis =  1.41792;
    float bboxMinDysbiosis = -1.46363;
    float boundingBoxRangeDysbiosis = bboxMaxDysbiosis - bboxMinDysbiosis;
    vec3 positionsDysbiosis = texture2D(vatPosDysbiosis, vec2(s, (chunk + t))).rgb * boundingBoxRangeDysbiosis + bboxMinDysbiosis;
    vec3 positionsDysbiosis2 = texture2D(vatPosDysbiosis, vec2(s, t)).rgb * boundingBoxRangeDysbiosis + bboxMinDysbiosis;
    positionsDysbiosis += (positionsDysbiosis2 / 10.0);
    positionsDysbiosis *= 0.7;

    // Inflammation
    float bboxMaxInflammation = 1.1311;
    float bboxMinInflammation = -1.1498;
    float boundingBoxRangeInflammation = bboxMaxInflammation - bboxMinInflammation;
    vec3 positionsInflammation = texture2D(vatPosInflammation, vec2(s, (chunk + t))).rgb * boundingBoxRangeInflammation + bboxMinInflammation;
    vec3 positionsInflammation2 = texture2D(vatPosInflammation, vec2(s, t)).rgb * boundingBoxRangeInflammation + bboxMinInflammation;
    positionsInflammation += (positionsInflammation2 / 10.0);
    positionsInflammation *= 3.0;

    vec4 pos = texture2D(positions, vec2(vUv.x, 1.0-vUv.y ));
   
    pos.rgb += curl4(pos.rgb * uCurlFreq, uTime * 0.00015, 0.02) * 0.0015;

    pos.rgb = mix(pos.rgb, positionsTelomere + offset, uTelomereAmount);
    pos.rgb = mix(pos.rgb, positionsMit + offset, uMitAmount);
    pos.rgb = mix(pos.rgb, positionsDNA + offset, uDNAAmount);
    pos.rgb = mix(pos.rgb, positionsCells + offset, uCellsAmount);
    pos.rgb = mix(pos.rgb, positionsStemCells + offset, uStemCellsAmount);
    pos.rgb = mix(pos.rgb, positionsExosomes + offset, uExosomesAmount);
    pos.rgb = mix(pos.rgb, positionsInsulin + offset, uInsulinAmount);
    pos.rgb = mix(pos.rgb, positionsProteostasis + offset, uProteostasisAmount);
    pos.rgb = mix(pos.rgb, positionsHistones + offset, uHistonesAmount);
    pos.rgb = mix(pos.rgb, positionsMacro + offset, uMacroAmount);
    pos.rgb = mix(pos.rgb, positionsDysbiosis + offset, uDysbiosisAmount);
    pos.rgb = mix(pos.rgb, positionsInflammation + offset, uInflammationAmount);
    pos.rgb = mix(pos.rgb, positionsIntro + offset, uIntroAmount);

    gl_FragColor = vec4(pos.rgb, pos.a);
}