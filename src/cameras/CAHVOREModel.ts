import {
    BoxGeometry,
    BufferAttribute,
    DoubleSide,
    EdgesGeometry,
    Group,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
    Ray,
    Vector2,
    Vector3,
} from 'three';

import { ResidualType } from '@/stores/DataContext';

import CameraModel from '@/cameras/CameraModel';

import { theme } from '@/theme.css';

export default class CAHVOREModel extends CameraModel {
    static ID = 'CAHVORE';

    static PARAMETERS = ['C', 'A', 'H', 'V', 'O', 'R', 'E'];

    static INITIAL_MATERIAL = new MeshBasicMaterial({
        transparent: true,
        opacity: 0.25,
        side: DoubleSide,
        depthWrite: false,
        color: theme.color.initialHex,
    });

    static FINAL_MATERIAL = new MeshBasicMaterial({
        transparent: true,
        opacity: 0.25,
        side: DoubleSide,
        depthWrite: false,
        color: theme.color.finalHex,
    });

    static LINE_MATERIAL = new LineBasicMaterial();

    private C: Vector3;
    private A: Vector3;
    private H: Vector3;
    private V: Vector3;
    private O: Vector3;
    private R: Vector3;
    private E: Vector3;
    private linearity: number;

    // Utilities for ray-projection.
    private EPSILON = 1e-15;
    private LARGE_EPSILON = 1e-8;
    private MAX_NEWTON = 100;

    private u3 = new Vector3();
    private v3 = new Vector3();
    private w3 = new Vector3();
    private rp = new Vector3();
    private lambdap3 = new Vector3();
    private cp = new Vector3();
    private ri = new Vector3();

    // Parameters for camera frustum.
    private near = 0.01;
    private far = 4;
    private widthSegments = 8;
    private heightSegments = 8;
    private planarProjectionFactor = 0;

    private group: Group | null = null;
    private frustum: Mesh<BoxGeometry, MeshBasicMaterial> | null = null;
    private lines: LineSegments<EdgesGeometry, LineBasicMaterial> | null = null;
    private position = new Vector3();
    private pixel = new Vector2();
    private planeProjection = new Vector3();

    // Utilities for vector math.
    private tempVec3 = new Vector3();

    static process(element: Element): CAHVOREModel {
        const p = [];

        for (const letter of CAHVOREModel.PARAMETERS) {
            const parameter = element.querySelector(`parameter[id="${letter}"]`)!;

            const x = Number(parameter.getAttribute('x')!);
            const y = Number(parameter.getAttribute('y')!);
            const z = Number(parameter.getAttribute('z')!);

            p.push(new Vector3(x, y, z));
        }

        // Handle linearity term.
        const T = element.querySelector(`parameter[id="T"]`)!.getAttribute('v')!;
        let linearity = 0;
        if (T === '1') {
            linearity = 1;
        } else if (T === '2') {
            linearity = 0;
        } else if (T === '3') {
            linearity = Number(element.querySelector(`parameter[id="P"]`)!.getAttribute('v')!);
        }

        return new CAHVOREModel(p[0], p[1], p[2], p[3], p[4], p[5], p[6], linearity);
    }

    constructor(C: Vector3, A: Vector3, H: Vector3, V: Vector3, O: Vector3, R: Vector3, E: Vector3, linearity: number) {
        super();

        this.C = C;
        this.A = A;
        this.H = H;
        this.V = V;
        this.O = O;
        this.R = R;
        this.E = E;
        this.linearity = linearity;
    }

    getCenter(): Vector3 {
        return this.C;
    }

    getAxis(): Vector3 {
        return this.A;
    }

    getForwardVector(pixel: Vector2): Ray {
        return this.projectRay(pixel);
    }

    // Based on Garrett Johnson's CameraModelUtilsJS library.
    // https://github.com/NASA-AMMOS/CameraModelUtilsJS
    getFrustumMesh(image: Vector2, type: ResidualType): Group {
        if (this.group) return this.group;

        if (this.frustum && this.frustum.geometry) this.frustum.geometry.dispose();

        const geometry = new BoxGeometry(0.25, 0.25, 0.25, this.widthSegments, this.heightSegments, 1);
        geometry.translate(0.5, 0.5, 0);

        const positions = geometry.getAttribute('position') as BufferAttribute;

        const projectDirection = this.A.clone().normalize();
        for (let i = 0, l = positions.count; i < l; i++) {
            this.position.fromBufferAttribute(positions, i);

            // Convert to image space.
            this.position.x = this.position.x * image.x;
            this.position.y = this.position.y * image.y;

            this.pixel.set(this.position.x, this.position.y);
            const ray = this.projectRay(this.pixel);

            // Get point along ray.
            ray.at(this.position.z < 0 ? this.near : this.far, this.tempVec3);

            // Get plane-projection of point.
            const zSign = this.position.z < 0;
            ray.direction.normalize();
            ray.direction.multiplyScalar(1 / ray.direction.dot(projectDirection));
            this.planeProjection.copy(ray.origin).addScaledVector(ray.direction, zSign ? this.near : this.far);

            // Interpolate to the plane vector based on planar factor.
            this.tempVec3.lerp(this.planeProjection, this.planarProjectionFactor);

            positions.setXYZ(i, this.tempVec3.x, this.tempVec3.y, this.tempVec3.z);
        }

        geometry.setAttribute('position', positions);
        geometry.computeVertexNormals();

        if (type === ResidualType.INITIAL) {
            this.frustum = new Mesh(geometry, CAHVOREModel.INITIAL_MATERIAL);
        } else if (type === ResidualType.FINAL) {
            this.frustum = new Mesh(geometry, CAHVOREModel.FINAL_MATERIAL);
        } else {
            throw new Error(`Unsupported Residual Type: ${type}`);
        }

        if (this.lines && this.lines.geometry) this.lines.geometry.dispose();
        this.lines = new LineSegments(new EdgesGeometry(this.frustum.geometry, 35), CAHVOREModel.LINE_MATERIAL);

        this.group = new Group();
        this.group.add(this.frustum);
        this.group.add(this.lines);

        return this.group;
    }

    // Based on Todd Litwin's cmod library.
    // https://github.jpl.nasa.gov/telitwin/cmod
    projectRay(pixel: Vector2): Ray {
        this.u3.copy(this.A).multiplyScalar(pixel.y);
        this.u3.subVectors(this.V, this.u3);

        this.v3.copy(this.A).multiplyScalar(pixel.x);
        this.v3.subVectors(this.H, this.v3);

        this.w3.crossVectors(this.u3, this.v3);
        this.u3.crossVectors(this.V, this.H);

        let avh1 = this.A.dot(this.u3);
        if (Math.abs(avh1) < this.EPSILON) {
            throw new Error(`Division by Zero: ${avh1}`);
        }
        avh1 = 1.0 / avh1;
        this.rp.copy(this.w3).multiplyScalar(avh1);

        const zetap = this.rp.dot(this.O);

        this.u3.copy(this.O).multiplyScalar(zetap);
        this.lambdap3.subVectors(this.rp, this.u3);

        const lambdap = this.lambdap3.length();

        if (Math.abs(zetap) < this.EPSILON) {
            throw new Error(`Division by Zero: ${zetap}`);
        }
        const chip = lambdap / zetap;

        if (chip < this.LARGE_EPSILON) {
            // Approximation for small angles.
            this.cp.copy(this.C);
            this.ri.copy(this.O);
        } else {
            // Full calculation using Newton's method.
            let n = 0.0;
            let chi = chip;
            let dchi = 1.0;

            let chi2, chi3, chi4, chi5;
            while (true) {
                if (++n > this.MAX_NEWTON) {
                    throw new Error('Too many iterations');
                }

                // Compute terms from the current value of chi.
                chi2 = chi * chi;
                chi3 = chi * chi2;
                chi4 = chi * chi3;
                chi5 = chi * chi4;

                // Check exit criterion from last update.
                if (Math.abs(dchi) < this.LARGE_EPSILON) break;

                // Update chi.
                const deriv = 1.0 + this.R.x + 3.0 * this.R.y * chi2 + 5.0 * this.R.z * chi4;
                dchi = ((1.0 + this.R.x) * chi + this.R.y * chi3 + this.R.z * chi5 - chip) / deriv;
                chi -= dchi;
            }

            // Compute incoming ray's angle.
            const linchi = this.linearity * chi;
            let theta;
            if (this.linearity < -this.EPSILON) {
                theta = Math.asin(linchi) / this.linearity;
            } else if (this.linearity > this.EPSILON) {
                theta = Math.atan(linchi) / this.linearity;
            } else {
                theta = chi;
            }

            const theta2 = theta * theta;
            const theta3 = theta * theta2;
            const theta4 = theta * theta3;

            // Compute the shift of the entrance pupil.
            let s = Math.sin(theta);
            if (Math.abs(s) < this.EPSILON) {
                throw new Error(`Division by Zero: ${s}`);
            }
            s = (theta / s - 1.0) * (this.E.x + this.E.y * theta2 + this.E.z * theta4);

            this.cp.copy(this.O).multiplyScalar(s);
            this.cp.add(this.C);

            this.u3.copy(this.lambdap3).normalize();
            this.u3.multiplyScalar(Math.sin(theta));

            this.v3.copy(this.O).multiplyScalar(Math.cos(theta));
            this.ri.addVectors(this.u3, this.v3);
        }

        return new Ray(this.cp, this.ri);
    }
}
