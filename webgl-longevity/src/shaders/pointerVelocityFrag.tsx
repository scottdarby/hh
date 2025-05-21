const pointerFrag = `
varying vec2 vUv;

uniform sampler2D uTexture;
uniform float uAspect;
uniform vec2 uMousePos;
uniform float uMouseRadius;
uniform vec3 uColor;
uniform float uFadeAmount;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  vec2 p = (uv - (uMousePos + 1.0) / 2.0)  * vec2(uAspect, 1.0);
  vec3 col = exp(1.0 - dot(p, p) / uMouseRadius) * uColor;

  gl_FragColor = vec4(texture2D(uTexture, uv).xyz * uFadeAmount + col, 1.0);
}
`;

export default pointerFrag;
