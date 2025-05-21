const pointerFrag = `
varying vec2 vUv;

uniform sampler2D uTexture;
uniform float uAspect;
uniform vec2 uMousePos;
uniform float uMouseRadius;
uniform vec3 uColor;
uniform float uFadeAmount;
uniform vec3 uMouseDelta;

void main() {
  vec2 uv = vUv;
  vec2 p = (uv - (uMousePos + 1.0) / 2.0)  * vec2(uAspect, 1.0);

  float deltaRadius = uMouseRadius * (max(abs(uMouseDelta.x), abs(uMouseDelta.y)) * 10.0);
  
  vec3 col = min(exp(1.0 - dot(p, p) / deltaRadius), 0.02) * uColor;
  
  gl_FragColor = vec4(texture2D(uTexture, uv).xyz * uFadeAmount + col, 1.0);
}
`;

export default pointerFrag;
