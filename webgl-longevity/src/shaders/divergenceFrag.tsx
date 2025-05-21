const divergenceFrag = `
varying vec2 vUv;

uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform vec2 uRdx;

vec2 sampleVelocity (in vec2 uv) {
  vec2 multiplier = vec2(1.0, 1.0);
  if ( uv.x < 0.0 || uv.x > 1.0 ) {
    multiplier.x = -1.0;
  }
  if ( uv.y < 0.0 || uv.y > 1.0 ) {
    multiplier.y = -1.0;
  }
  
  // uv = clamp(uv, 0.0, 1.0);
  // return multiplier * texture2D(uTexture, uv).xy;
  return texture2D(uTexture, uv).xy;
}

void main () {
  //vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 uv = vUv;
  float L = sampleVelocity( uv - vec2(uRdx.x, 0.0) ).x;
  float R = sampleVelocity( uv + vec2(uRdx.x, 0.0) ).x;
  float T = sampleVelocity( uv + vec2(0.0, uRdx.y) ).y;
  float B = sampleVelocity( uv - vec2(0.0, uRdx.y) ).y;
  float divergence = (R - L + T - B) * 0.5;
  gl_FragColor = vec4(divergence, 0.0, 0.0, 1.0);
}
`;

export default divergenceFrag;
