import { Vector3 } from 'three';

import Format from '@/formats/Format';

import { Camera, CameraImageMap, Point, Track } from '@/stores/DataContext';

import CAHVOREModel from '@/cameras/CAHVOREModel';

// The JPL format maintains an additional key parameter to
// accumulate the points into the track format. Since this
// is an extension of the standard Point interface we can
// return it from the method as is, but the rest of VECTOR
// will be unaware of the key parameter.
interface JPLPoint extends Point {
    key: number;
}

interface JPLTrack extends Omit<Track, 'points'> {
    points: JPLPoint[];
}

export default class JPLFormat extends Format {
    static async processTracks(xml: Document): Promise<Track[]> {
        const tiepoints = xml.querySelectorAll('tie');

        // Use a mapping to create tracks because the lookup
        // for exisiting tracks will be significantly faster
        // than traversing the output array. This could probably
        // be further optimized by treating the points array as
        // a map so the key lookup is also efficient.
        const newTracks: { [key: string]: JPLTrack } = {};

        let pointId = 0;
        for (const tiepoint of tiepoints.values()) {
            const trackId = tiepoint.querySelector('track')!.getAttribute('id')!;

            if (trackId in newTracks) {
                const currentTrack = newTracks[trackId];

                const leftKey = Number(tiepoint.getAttribute('left_key'));
                const rightKey = Number(tiepoint.getAttribute('right_key'));

                if (!currentTrack.points.some((point) => point.key == leftKey)) {
                    const cameraId = xml.querySelector(`image[key="${leftKey}"]`)!.getAttribute('unique_id')!;
                    const pixel = tiepoint.querySelector('left');

                    const initialResidual = tiepoint.querySelector('left_init_residual');
                    const finalResidual = tiepoint.querySelector('left_final_residual');

                    const initialResidualX = Number(initialResidual!.getAttribute('samp'));
                    const initialResidualY = Number(initialResidual!.getAttribute('line'));

                    const finalResidualX = Number(finalResidual!.getAttribute('samp'));
                    const finalResidualY = Number(finalResidual!.getAttribute('line'));

                    const point: JPLPoint = {
                        cameraId,
                        id: pointId.toString(),
                        key: leftKey,
                        pixel: [Number(pixel!.getAttribute('samp')), Number(pixel!.getAttribute('line'))],
                        initialResidual: [initialResidualX, initialResidualY],
                        initialResidualLength: Math.sqrt(
                            initialResidualX * initialResidualX + initialResidualY * initialResidualY,
                        ),
                        initialResidualAngle: Math.atan2(initialResidualY, initialResidualX) * (180 / Math.PI),
                        finalResidual: [finalResidualX, finalResidualY],
                        finalResidualLength: Math.sqrt(
                            finalResidualX * finalResidualX + finalResidualY * finalResidualY,
                        ),
                        finalResidualAngle: Math.atan2(finalResidualY, finalResidualX) * (180 / Math.PI),
                    };
                    pointId++;

                    if (point.initialResidualAngle < 0) point.initialResidualAngle += 360.0;
                    if (point.finalResidualAngle < 0) point.finalResidualAngle += 360.0;

                    currentTrack.points.push(point);
                }

                if (!currentTrack.points.some((point) => point.key == rightKey)) {
                    const cameraId = xml.querySelector(`image[key="${rightKey}"]`)!.getAttribute('unique_id')!;
                    const pixel = tiepoint.querySelector('right');

                    const initialResidual = tiepoint.querySelector('right_init_residual');
                    const finalResidual = tiepoint.querySelector('right_final_residual');

                    const initialResidualX = Number(initialResidual!.getAttribute('samp'));
                    const initialResidualY = Number(initialResidual!.getAttribute('line'));

                    const finalResidualX = Number(finalResidual!.getAttribute('samp'));
                    const finalResidualY = Number(finalResidual!.getAttribute('line'));

                    const point: JPLPoint = {
                        cameraId,
                        id: pointId.toString(),
                        key: rightKey,
                        pixel: [Number(pixel!.getAttribute('samp')), Number(pixel!.getAttribute('line'))],
                        initialResidual: [initialResidualX, initialResidualY],
                        initialResidualLength: Math.sqrt(
                            initialResidualX * initialResidualX + initialResidualY * initialResidualY,
                        ),
                        initialResidualAngle: Math.atan2(initialResidualY, initialResidualX) * (180 / Math.PI),
                        finalResidual: [finalResidualX, finalResidualY],
                        finalResidualLength: Math.sqrt(
                            finalResidualX * finalResidualX + finalResidualY * finalResidualY,
                        ),
                        finalResidualAngle: Math.atan2(finalResidualY, finalResidualX) * (180 / Math.PI),
                    };
                    pointId++;

                    if (point.initialResidualAngle < 0) point.initialResidualAngle += 360.0;
                    if (point.finalResidualAngle < 0) point.finalResidualAngle += 360.0;

                    currentTrack.points.push(point);
                }
            } else {
                const leftKey = Number(tiepoint.getAttribute('left_key'));
                const leftCameraId = xml.querySelector(`image[key="${leftKey}"]`)!.getAttribute('unique_id')!;
                const leftPixel = tiepoint.querySelector('left');

                const leftInitialResidual = tiepoint.querySelector('left_init_residual');
                const leftFinalResidual = tiepoint.querySelector('left_final_residual');

                const leftInitialResidualX = Number(leftInitialResidual!.getAttribute('samp'));
                const leftInitialResidualY = Number(leftInitialResidual!.getAttribute('line'));

                const leftFinalResidualX = Number(leftFinalResidual!.getAttribute('samp'));
                const leftFinalResidualY = Number(leftFinalResidual!.getAttribute('line'));

                const pointLeft: JPLPoint = {
                    id: pointId.toString(),
                    cameraId: leftCameraId,
                    key: leftKey,
                    pixel: [Number(leftPixel!.getAttribute('samp')), Number(leftPixel!.getAttribute('line'))],
                    initialResidual: [leftInitialResidualX, leftInitialResidualY],
                    initialResidualLength: Math.sqrt(
                        leftInitialResidualX * leftInitialResidualX + leftInitialResidualY * leftInitialResidualY,
                    ),
                    initialResidualAngle: Math.atan2(leftInitialResidualY, leftInitialResidualX) * (180 / Math.PI),
                    finalResidual: [leftFinalResidualX, leftFinalResidualY],
                    finalResidualLength: Math.sqrt(
                        leftFinalResidualX * leftFinalResidualX + leftFinalResidualY * leftFinalResidualY,
                    ),
                    finalResidualAngle: Math.atan2(leftFinalResidualY, leftFinalResidualX) * (180 / Math.PI),
                };
                pointId++;

                if (pointLeft.initialResidualAngle < 0) pointLeft.initialResidualAngle += 360.0;
                if (pointLeft.finalResidualAngle < 0) pointLeft.finalResidualAngle += 360.0;

                const rightKey = Number(tiepoint.getAttribute('right_key'));
                const rightCameraId = xml.querySelector(`image[key="${rightKey}"]`)!.getAttribute('unique_id')!;
                const rightPixel = tiepoint.querySelector('right');

                const rightInitialResidual = tiepoint.querySelector('right_init_residual');
                const rightFinalResidual = tiepoint.querySelector('right_final_residual');

                const rightInitialResidualX = Number(rightInitialResidual!.getAttribute('samp'));
                const rightInitialResidualY = Number(rightInitialResidual!.getAttribute('line'));

                const rightFinalResidualX = Number(rightFinalResidual!.getAttribute('samp'));
                const rightFinalResidualY = Number(rightFinalResidual!.getAttribute('line'));

                const pointRight: JPLPoint = {
                    id: pointId.toString(),
                    cameraId: rightCameraId,
                    key: rightKey,
                    pixel: [Number(rightPixel!.getAttribute('samp')), Number(rightPixel!.getAttribute('line'))],
                    initialResidual: [rightInitialResidualX, rightInitialResidualY],
                    initialResidualLength: Math.sqrt(
                        rightInitialResidualX * rightInitialResidualX + rightInitialResidualY * rightInitialResidualY,
                    ),
                    initialResidualAngle: Math.atan2(rightInitialResidualY, rightInitialResidualX) * (180 / Math.PI),
                    finalResidual: [rightFinalResidualX, rightFinalResidualY],
                    finalResidualLength: Math.sqrt(
                        rightFinalResidualX * rightFinalResidualX + rightFinalResidualY * rightFinalResidualY,
                    ),
                    finalResidualAngle: Math.atan2(rightFinalResidualY, rightFinalResidualX) * (180 / Math.PI),
                };
                pointId++;

                if (pointRight.initialResidualAngle < 0) pointRight.initialResidualAngle += 360.0;
                if (pointRight.finalResidualAngle < 0) pointRight.finalResidualAngle += 360.0;

                const initialXYZ = tiepoint.querySelector('init_xyz');
                const finalXYZ = tiepoint.querySelector('final_xyz');

                newTracks[trackId] = {
                    id: trackId,
                    initialXYZ: [
                        Number(initialXYZ!.getAttribute('x')),
                        Number(initialXYZ!.getAttribute('y')),
                        Number(initialXYZ!.getAttribute('z')),
                    ],
                    finalXYZ: [
                        Number(finalXYZ!.getAttribute('x')),
                        Number(finalXYZ!.getAttribute('y')),
                        Number(finalXYZ!.getAttribute('z')),
                    ],
                    points: [pointLeft, pointRight],
                };
            }
        }

        return Object.values(newTracks);
    }

    static async processCameras(xml: Document): Promise<Camera[]> {
        const solutions = xml.querySelectorAll('solution');

        const cameras = [];
        for (const image of solutions) {
            const id = image.querySelector('image')!.getAttribute('unique_id')!;

            const initialModel = image.querySelector('original_camera_model')!;
            const finalModel = image.querySelector('camera_model')!;

            cameras.push({
                id,
                imageName: id.slice(6),
                initial: this.processCAHVORE(initialModel),
                final: this.processCAHVORE(finalModel),
            });
        }

        return cameras;
    }

    static mapImages(cameras: Camera[], images: CameraImageMap): Camera[] {
        const newCameras = [];

        const imageNames = Object.keys(images);
        for (const camera of cameras) {
            const image = imageNames.find((name) => name.includes(camera.imageName));
            if (image) {
                camera.imageName = image;
                newCameras.push(camera);
            }
        }

        return newCameras;
    }

    private static processCAHVORE(element: Element): CAHVOREModel {
        const p = [];

        for (const letter of CAHVOREModel.PARAMETERS) {
            const parameter = element.querySelector(`parameter[id="${letter}"]`)!;

            const x = Number(parameter.getAttribute('value1')!);
            const y = Number(parameter.getAttribute('value2')!);
            const z = Number(parameter.getAttribute('value3')!);

            p.push(new Vector3(x, y, z));
        }

        // Handle linearity term.
        const T = element.querySelector(`parameter[id="T"]`)!.getAttribute('value')!;
        let linearity = 0;
        if (T === '1') {
            linearity = 1;
        } else if (T === '2') {
            linearity = 0;
        } else if (T === '3') {
            linearity = Number(element.querySelector(`parameter[id="P"]`)!.getAttribute('value')!);
        }

        return new CAHVOREModel(p[0], p[1], p[2], p[3], p[4], p[5], p[6], linearity);
    }
}
