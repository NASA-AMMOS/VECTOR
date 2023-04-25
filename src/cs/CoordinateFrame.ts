import { Vector3 } from 'three';

export default class CoordinateFrame {
    static ID = '';

    static X_AXIS = new Vector3(1, 0, 0);

    static convert(_v: Vector3): Vector3 {
        throw new Error('Method convert() is not implemented');
    }
}
