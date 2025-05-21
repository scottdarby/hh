const advectFrag = `
varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uVelocityTex;
uniform vec2 uRdx;
uniform float uTimestep;
uniform float uDiffusion;
uniform vec2 uResolution;

void main () {
  //vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 uv = vUv;
  vec2 pos = uv - uTimestep * uRdx * texture2D(uVelocityTex, uv).xy;
  vec4 col = uDiffusion * texture2D(uTexture, pos); 
  gl_FragColor = vec4(col.rgb, 1.0);
}
`;

export default advectFrag;
