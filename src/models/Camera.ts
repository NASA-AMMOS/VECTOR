import { Vec3 } from '@/models/Vec3';
import { Point } from '@/models/Point';
import { Ray } from '@/models/Ray';

export enum LinearityMode {
    PERSPECTIVE = 1,
    FISH_EYE = 0,
}

export default interface CameraModel {
    projectRay(pixel: Point): Ray;

    getCenter(): Vec3;

    getForwardVector(width: number, height: number): Ray;
}
