uniform float uFadeDistance;

varying vec3 worldPosition;

void main() {
    vec3 p = position.xzy * (1.0 + uFadeDistance);
    p.xz += cameraPosition.xz;

    worldPosition = p;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
