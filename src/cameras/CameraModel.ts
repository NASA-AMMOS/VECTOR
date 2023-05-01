import { Group, Ray, Vector2, Vector3 } from 'three';

import { ResidualType } from '@/stores/DataContext';

export default class CameraModel {
    static ID = '';

    getCenter(): Vector3 {
        throw new Error('Method getCenter() is not implemented');
    }

    getAxis(): Vector3 {
        throw new Error('Method getCenter() is not implemented');
    }

    getForwardVector(_: Vector2): Ray {
        throw new Error('Method getCenter() is not implemented');
    }

    getFrustumMesh(_: Vector2, _type: ResidualType): Group {
        throw new Error('Method getCenter() is not implemented');
    }

    projectRay(_: Vector2): Ray {
        throw new Error('Method getCenter() is not implemented');
    }
}
