const gradientSubtractFrag = `
varying vec2 vUv;

uniform vec2 uResolution;
uniform sampler2D uPressureTex;
uniform sampler2D uTexture; // velocity
uniform vec2 uRdx;
uniform float uGradientAmount;

void main () {
  //vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 uv = vUv;

  float L = texture2D( uPressureTex, clamp( uv - vec2(uRdx.x, 0.0), 0.0, 1.0 ) ).x;
  float R = texture2D( uPressureTex, clamp( uv + vec2(uRdx.x, 0.0), 0.0, 1.0 ) ).x;
  float T = texture2D( uPressureTex, clamp( uv + vec2(0.0, uRdx.y), 0.0, 1.0 ) ).x;
  float B = texture2D( uPressureTex, clamp( uv - vec2(0.0, uRdx.y), 0.0, 1.0 ) ).x;
  
  vec2 velocity = texture2D(uTexture, uv).xy - (vec2(R - L, T - B) * uGradientAmount);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

export default gradientSubtractFrag;
