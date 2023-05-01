uniform float uFadeDistance;
uniform float uAxesType;

varying vec2 vCamera;
varying vec2 vPosition;

void main() {
    vec3 p;
    if (uAxesType == 1.0) {
        vCamera = cameraPosition.xy;
        p = position.xyz * (1.0 + uFadeDistance);
        p.xy += vCamera;
        vPosition = p.xy;
    } else if (uAxesType == 2.0) {
        vCamera = cameraPosition.yz;
        p = position.yzx * (1.0 + uFadeDistance);
        p.yz += vCamera;
        vPosition = p.yz;
    } else {
        vCamera = cameraPosition.xz;
        p = position.xzy * (1.0 + uFadeDistance);
        p.xz += vCamera;
        vPosition = p.xz;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
