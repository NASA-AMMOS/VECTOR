import { DoubleSide, Mesh, PlaneGeometry, ShaderMaterial } from 'three';

import vertexShader from '@/shaders/grid/vertex.glsl?raw';
import fragmentShader from '@/shaders/grid/fragment.glsl?raw';

// Based on the drei library with modifications to
// handle arbitrary axis-aligned directions.
// https://github.com/pmndrs/drei/blob/master/src/core/Grid.tsx
export default class InfiniteGrid extends Mesh<PlaneGeometry, ShaderMaterial> {
    constructor({
        fadeDistance = 10000,

        cellSize = 1,
        sectionSize = 2,

        cellThickness = 0.1,
        sectionThickness = 0.2,
    } = {}) {
        const geometry = new PlaneGeometry();

        const material = new ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uFadeDistance: { value: fadeDistance },

                uCellSize: { value: cellSize },
                uSectionSize: { value: sectionSize },

                uCellThickness: { value: cellThickness },
                uSectionThickness: { value: sectionThickness },

                uAxesType: { value: 0.0 },
            },
            side: DoubleSide,
            transparent: true,
            extensions: {
                derivatives: true,
            },
        });

        super(geometry, material);
        this.frustumCulled = false;
    }
}
