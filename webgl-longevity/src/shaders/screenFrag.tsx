const screenFrag = `
varying vec2 vUv;

uniform sampler2D uTexture;

void main () {
  vec2 uv = vUv;
  vec4 col = abs(texture2D(uTexture, uv) * 1.0);

  gl_FragColor = vec4(col.rgb * 0.45, 1.0);
}
`;

export default screenFrag;
