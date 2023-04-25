uniform float uFadeDistance;

uniform float uCellSize;
uniform float uSectionSize;

uniform float uCellThickness;
uniform float uSectionThickness;

varying vec3 worldPosition;

float getGrid(float size, float thickness) {
    vec2 r = worldPosition.xz / size;
    vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
    float line = min(grid.x, grid.y) + 1.0 - thickness;
    return 1.0 - min(line, 1.0);
}

void main() {
    float g1 = getGrid(uCellSize, uCellThickness);
    float g2 = getGrid(uSectionSize, uSectionThickness);

    float d = 1.0 - min(distance(cameraPosition.xz, worldPosition.xz) / uFadeDistance, 1.0);
    float alpha = (g1 + g2) * d;

    gl_FragColor = vec4(vec3(0.1), mix(0.75 * alpha, alpha, g2));
    if (gl_FragColor.a <= 0.0) discard;
}
