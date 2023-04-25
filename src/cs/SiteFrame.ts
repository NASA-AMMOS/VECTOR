import { Vector3 } from 'three';

import CoordinateFrame from '@/cs/CoordinateFrame';

export default class SiteFrame extends CoordinateFrame {
    static ID = 'SITE_FRAME';

    static convert(v: Vector3): Vector3 {
        return v.applyAxisAngle(CoordinateFrame.X_AXIS, 0.5 * Math.PI);
    }
}
