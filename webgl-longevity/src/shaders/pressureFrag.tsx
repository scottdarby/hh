const pressureFrag = `
varying vec2 vUv;

uniform vec2 uResolution;
uniform sampler2D uTexture; // pressure
uniform sampler2D uDivergenceTex;
uniform vec2 uRdx;

void main () {
  // vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 uv = vUv;

  float L = texture2D( uTexture, clamp( uv - vec2(uRdx.x, 0.0), 0.0, 1.0 ) ).x;
  float R = texture2D( uTexture, clamp( uv + vec2(uRdx.x, 0.0), 0.0, 1.0 ) ).x;
  float T = texture2D( uTexture, clamp( uv + vec2(0.0, uRdx.y), 0.0, 1.0 ) ).x;
  float B = texture2D( uTexture, clamp( uv - vec2(0.0, uRdx.y), 0.0, 1.0 ) ).x;

  float divergence = texture2D(uDivergenceTex, uv).r;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
`;

export default pressureFrag;
