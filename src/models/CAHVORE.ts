import CameraModel, { LinearityMode } from '@/models/Camera';
import Vec3Utils, { Vec3 } from '@/models/Vec3';
import { Point } from '@/models/Point';
import { Ray } from '@/models/Ray';

export default class CAHVORECamera implements CameraModel {
    static MAX_NEWTON = 100;

    private C: Vec3;
    private A: Vec3;
    private H: Vec3;
    private V: Vec3;
    private O: Vec3;
    private R: Vec3;
    private E: Vec3;

    private linearityMode: LinearityMode;

    constructor(C: Vec3, A: Vec3, H: Vec3, V: Vec3, O: Vec3, R: Vec3, E: Vec3, linearityMode: LinearityMode) {
        this.C = C;
        this.A = A;
        this.H = H;
        this.V = V;
        this.O = O;
        this.R = R;
        this.E = E;
        this.linearityMode = linearityMode;
    }

    projectRay(pixel: Point): Ray {
        let u3 = Vec3Utils.sub(this.V, Vec3Utils.scale(this.A, pixel[1]));
        let v3 = Vec3Utils.sub(this.H, Vec3Utils.scale(this.A, pixel[0]));

        let w3 = Vec3Utils.cross(u3, v3);
        u3 = Vec3Utils.cross(this.V, this.H);

        let avh1 = 1 / Vec3Utils.dot(this.A, u3);
        let rp = Vec3Utils.scale(w3, avh1);

        let zetap = Vec3Utils.dot(rp, this.O);
        u3 = Vec3Utils.scale(this.O, zetap);
        let lambdap3 = Vec3Utils.sub(rp, u3);

        let chip = Vec3Utils.size(lambdap3) / zetap;
        let cp, ri;
        if (chip < Number.EPSILON) {
            cp = this.C;
            ri = this.O;
        } else {
            let n = 0;
            let chi = chip;
            let dchi = 1;
            while (true) {
                let deriv;

                if (++n > CAHVORECamera.MAX_NEWTON) {
                    throw new Error('Too many iterations');
                }

                let chi2 = chi * chi;
                let chi3 = chi * chi2;
                let chi4 = chi * chi3;
                let chi5 = chi * chi4;

                if (Math.abs(dchi) < 1e-8) break;

                deriv = 1 + this.R[0] + 3 * this.R[1] * chi2 + 5 * this.R[2] * chi4;
                dchi = ((1 + this.R[0]) * chi + this.R[1] * chi3 + this.R[2] * chi5 - chip) / deriv;
                chi -= dchi;
            }

            const linearity = this.linearityMode;
            let theta = chi;
            if (linearity < -Number.EPSILON) {
                theta = Math.asin(linearity * chi) / linearity;
            } else if (linearity > Number.EPSILON) {
                theta = Math.atan(linearity * chi) / linearity;
            }

            let theta2 = theta * theta;
            let theta3 = theta * theta2;
            let theta4 = theta * theta3;

            let s = (theta / Math.sin(theta) - 1) * (this.E[0] + this.E[1] * theta2 + this.E[2] * theta4);

            cp = Vec3Utils.scale(this.O, s);
            cp = Vec3Utils.add(this.C, cp);

            u3 = Vec3Utils.normalize(lambdap3);
            u3 = Vec3Utils.scale(u3, Math.sin(theta));
            v3 = Vec3Utils.scale(this.O, Math.cos(theta));
            ri = Vec3Utils.add(u3, v3);
        }

        return [cp, ri];
    }

    getCenter(): Vec3 {
        return this.C;
    }

    getForwardVector(width: number, height: number): Ray {
        return this.projectRay([width * 0.5, height * 0.5]);
    }
}
