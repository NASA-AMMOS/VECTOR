import { Group, Ray, Vector2, Vector3 } from 'three';

import { ResidualType } from '@/stores/DataContext';

export default class CameraModel {
    static ID = '';

    static process(_element: Element, _frame: string): CameraModel {
        throw new Error('Method process() is not implemented');
    }

    getCenter(): Vector3 {
        throw new Error('Method getCenter() is not implemented');
    }

    getAxis(): Vector3 {
        throw new Error('Method getCenter() is not implemented');
    }

    getForwardVector(_pixel: Vector2): Ray {
        throw new Error('Method getCenter() is not implemented');
    }

    getFrustumMesh(_image: Vector2, _type: ResidualType): Group {
        throw new Error('Method getCenter() is not implemented');
    }

    projectRay(_pixel: Vector2): Ray {
        throw new Error('Method getCenter() is not implemented');
    }
}
