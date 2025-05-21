#pragma glslify: random = require(glsl-random) 

uniform sampler2D positions;
uniform sampler2D vatColDNA;
uniform sampler2D vatColCells;
uniform sampler2D vatColStemCells;
uniform sampler2D vatColInsulin;
uniform sampler2D vatColProteostasis;
uniform sampler2D vatColHistones;
uniform sampler2D vatColMacro;
uniform sampler2D vatColDysbiosis;
uniform sampler2D vatColInflammation;

uniform sampler2D uMousePosTexture;

uniform float uTime;
uniform float uFocus;
uniform float uFov;
uniform float uBlur;
uniform float uDNAAmount;
uniform float uCellsAmount;
uniform float uStemCellsAmount;
uniform float uInsulinAmount;
uniform float uProteostasisAmount;
uniform float uHistonesAmount;
uniform float uMacroAmount;
uniform float uDysbiosisAmount;
uniform float uInflammationAmount;

uniform float currentFrame;

varying float vDistance;
varying vec4 vColor;

void main() {

    vec4 color1 = vec4( vec3(83.0, 232.0, 228.0) / 100.0, 1.0 );
    vec4 color2 = vec4( vec3(81.0, 168.0, 220.0) / 300.0, 1.0 );

    vec4 posData = texture2D(positions, position.xy);
    vec3 pos = posData.xyz;

    if (posData.w > 0.5) {
        vColor = color1;
    } else {
        vColor = color2;
    }

    // hide points at central location
    if (length(abs(pos)) < 0.01 ) {
        pos = vec3(9999.0);
    }

    pos.x += sin(1.0 + posData.w * 30.0 + uTime * 0.1) * 0.001;
    pos.y -= sin(2.0 + posData.w * 50.0 + uTime * 0.096) * 0.001;
    pos.z += sin(3.0 + posData.w * 90.1 + uTime * 0.136) * 0.001;

    float totalFrames = 139.0;
    float chunk = 1.0 / 4.0; // 1.0 / how many rows in texture

    float s = position.x;
    float t = position.y + fract( (totalFrames-currentFrame) / totalFrames ) * chunk;
    vec2 st = vec2(s, t);

    vec4 DNAColor = texture2D(vatColDNA, st);
    vColor = mix(vColor, DNAColor, uDNAAmount);

    vec4 cellsColor = texture2D(vatColCells, st);
    vColor = mix(vColor, cellsColor, uCellsAmount);

    vec4 stemCellsColor = texture2D(vatColStemCells, st);
    vColor = mix(vColor, stemCellsColor, uStemCellsAmount);

    vec4 insulinColor = texture2D(vatColInsulin, st);
    vColor = mix(vColor, insulinColor, uInsulinAmount);

    vec4 proteostasisColor = texture2D(vatColProteostasis, st);
    vColor = mix(vColor, proteostasisColor, uProteostasisAmount);

    vec4 histonesColor = texture2D(vatColHistones, st);
    vColor = mix(vColor, histonesColor, uHistonesAmount);

    vec4 macroColor = texture2D(vatColMacro, st) * 1.5;
    vColor = mix(vColor, macroColor, uMacroAmount);

    vec4 dysbiosisColor = texture2D(vatColDysbiosis, st);
    vColor = mix(vColor, dysbiosisColor, uDysbiosisAmount);

    vec4 inflammationColor = texture2D(vatColInflammation, st) * 2.5;
    vColor = mix(vColor, inflammationColor, uInflammationAmount);

    vec4 mvPosition2 = vec4( pos, 1.0 );
    mvPosition2 = modelViewMatrix * mvPosition2;
    vec4 newPos = projectionMatrix * mvPosition2;
    newPos /= newPos.w;

    vec4 mousePos = texture2D(uMousePosTexture, ((newPos.xy + 1.0) / 2.0)  );

    pos.xy += (mousePos.xy) * 0.15;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    gl_Position = projectionMatrix * mvPosition;
    
    vDistance = abs(uFocus - -mvPosition.z);
    gl_PointSize = max(2.5, step(1.0 - (1.0 / uFov), posData.w) * vDistance * uBlur);

}