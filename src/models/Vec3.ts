import { Quat } from '@/models/Quat';

export type Vec3 = [number, number, number];

// A few utility functions for vector math on arrays
// without needing to allocate memory for Vector classes.
export default class Vec3Utils {
    public static dot(a: Vec3, b: Vec3): number {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    public static cross(a: Vec3, b: Vec3): Vec3 {
        const ax = a[0];
        const ay = a[1];
        const az = a[2];
        const bx = b[0];
        const by = b[1];
        const bz = b[2];
        return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
    }

    public static add(a: Vec3, b: Vec3): Vec3 {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    }

    public static sub(a: Vec3, b: Vec3): Vec3 {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }

    public static scale(v: Vec3, x: number): Vec3 {
        return [v[0] * x, v[1] * x, v[2] * x];
    }

    public static size(v: Vec3): number {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    }

    public static normalize(v: Vec3): Vec3 {
        return Vec3Utils.scale(v, 1 / Vec3Utils.size(v));
    }

    public static applyQuat(v: Vec3, q: Quat): Vec3 {
        const x = v[0];
        const y = v[1];
        const z = v[2];

        const qx = q[0];
        const qy = q[1];
        const qz = q[2];
        const qw = q[3];

        const ix = qw * x + qy * z - qz * y;
        const iy = qw * y + qz * x - qx * z;
        const iz = qw * z + qx * y - qy * x;
        const iw = -qx * x - qy * y - qz * z;

        return [
            ix * qw + iw * -qx + iy * -qz - iz * -qy,
            iy * qw + iw * -qy + iz * -qx - ix * -qz,
            iz * qw + iw * -qz + ix * -qy - iy * -qx,
        ];
    }
}
