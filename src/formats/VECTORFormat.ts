import { Vector3 } from 'three';

import Format from '@/formats/Format';

import { Camera, Point, Track } from '@/stores/DataContext';

import CAHVOREModel from '@/cameras/CAHVOREModel';

export default class VECTORFormat extends Format {
    static async processTracks(xml: Document): Promise<Track[]> {
        const elements = xml.querySelectorAll('track');

        const tracks = [];
        for (const element of elements) {
            const id = element.getAttribute('id')!;
            const initial = element.querySelector('initial_xyz')!;
            const final = element.querySelector('final_xyz')!;

            const points = this.processPoints(element.querySelectorAll('point'));

            const track: Track = {
                id,
                initialXYZ: [
                    Number(initial.getAttribute('x')!),
                    Number(initial.getAttribute('y')!),
                    Number(initial.getAttribute('z')!),
                ],
                finalXYZ: [
                    Number(final.getAttribute('x')!),
                    Number(final.getAttribute('y')!),
                    Number(final.getAttribute('z')!),
                ],
                points,
            };

            tracks.push(track);
        }

        return tracks;
    }

    static async processCameras(xml: Document): Promise<Camera[]> {
        const elements = xml.querySelectorAll('camera');

        const cameras: Camera[] = [];
        for (const element of elements) {
            const id = element.getAttribute('id')!;
            const imageName = element.getAttribute('image')!;

            const model = element.getAttribute('model')!;
            switch (model) {
                case CAHVOREModel.ID:
                    const initialModel = element.querySelector('initial')!;
                    const finalModel = element.querySelector('final')!;

                    const camera: Camera = {
                        id,
                        imageName,
                        initial: this.processCAHVORE(initialModel),
                        final: this.processCAHVORE(finalModel),
                    };

                    cameras.push(camera);
                    break;
                default:
                    throw new Error(`Unsupported Camera Model: ${model}`);
            }
        }

        return cameras;
    }

    private static processPoints(elements: NodeListOf<Element>): Point[] {
        const points = [];
        for (const element of elements) {
            const id = element.getAttribute('id')!;
            const cameraId = element.getAttribute('camera_id')!;

            const pixel = element.querySelector('pixel')!;
            const initialResidual = element.querySelector('initial_residual')!;
            const finalResidual = element.querySelector('final_residual')!;

            const initialResidualX = Number(initialResidual.getAttribute('x')!);
            const initialResidualY = Number(initialResidual.getAttribute('y')!);

            const finalResidualX = Number(finalResidual.getAttribute('x')!);
            const finalResidualY = Number(finalResidual.getAttribute('y')!);

            const point: Point = {
                id,
                cameraId,
                pixel: [Number(pixel.getAttribute('x')!), Number(pixel.getAttribute('y')!)],
                initialResidual: [initialResidualX, initialResidualY],
                initialResidualLength: Math.sqrt(
                    initialResidualX * initialResidualX + initialResidualY * initialResidualY,
                ),
                initialResidualAngle: Math.atan2(initialResidualY, initialResidualX) * (180 / Math.PI),
                finalResidual: [finalResidualX, finalResidualY],
                finalResidualLength: Math.sqrt(finalResidualX * finalResidualX + finalResidualY * finalResidualY),
                finalResidualAngle: Math.atan2(finalResidualY, finalResidualX) * (180 / Math.PI),
            };

            if (point.initialResidualAngle < 0) point.initialResidualAngle += 360.0;
            if (point.finalResidualAngle < 0) point.finalResidualAngle += 360.0;

            points.push(point);
        }
        return points;
    }

    private static processCAHVORE(element: Element): CAHVOREModel {
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
}
