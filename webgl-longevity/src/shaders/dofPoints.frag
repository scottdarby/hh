varying vec4 vColor;
varying float vDistance;

void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;

    if (dot(cxy, cxy) > 1.0) {
        discard;
    }

    float alpha = (1.3 - clamp(vDistance * 1.5, 0.0, 1.0));
    alpha *= vColor.a;

    gl_FragColor = vec4(vColor.rgb, alpha);
}