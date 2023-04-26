import { Vector3 } from 'three';

import Loader, { LoaderType } from '@/loaders/Loader';

import CAHVOREModel from '@/cameras/CAHVOREModel';

import { Camera, ImageFile, Point, Track } from '@/stores/DataContext';
import SiteFrame from '@/cs/SiteFrame';

export default class VECTORLoader extends Loader {
    private parser: DOMParser;
    private files: Record<string, Document>;

    private tempVec3 = new Vector3();

    constructor() {
        super();
        this.parser = new DOMParser();
        this.files = {};
    }

    async inferType(file: File): Promise<LoaderType | null> {
        const contents = await file.text();

        const xml = this.parser.parseFromString(contents, 'application/xml');
        this.files[file.name] = xml;

        const tag = xml.querySelector('vector');
        if (tag) {
            const format = tag.getAttribute('format');
            if (format && format === LoaderType.TRACKS) {
                return LoaderType.TRACKS;
            } else if (format && format === LoaderType.CAMERAS) {
                return LoaderType.CAMERAS;
            }
        }
        return null;
    }

    async processTracks(file: File): Promise<Track[]> {
        const xml = this.files[file.name];
        const elements = xml.querySelectorAll('track');

        const frame = xml.querySelector('vector')!.getAttribute('reference_frame');
        let cs = null;
        switch (frame) {
            case SiteFrame.ID:
                cs = SiteFrame;
                break;
        }

        const tracks = [];
        for (const element of elements) {
            const id = element.getAttribute('id')!;
            const initial = element.querySelector('initial_xyz')!;
            const final = element.querySelector('final_xyz')!;

            const points = this.processPoints(element.querySelectorAll('point'));

            let initialXYZ: [number, number, number];
            if (cs) {
                this.tempVec3.set(
                    Number(initial.getAttribute('x')!),
                    Number(initial.getAttribute('y')!),
                    Number(initial.getAttribute('z')!),
                );
                cs.convert(this.tempVec3);
                initialXYZ = [this.tempVec3.x, this.tempVec3.y, this.tempVec3.z];
            } else {
                initialXYZ = [
                    Number(initial.getAttribute('x')!),
                    Number(initial.getAttribute('y')!),
                    Number(initial.getAttribute('z')!),
                ];
            }

            let finalXYZ: [number, number, number];
            if (cs) {
                this.tempVec3.set(
                    Number(final.getAttribute('x')!),
                    Number(final.getAttribute('y')!),
                    Number(final.getAttribute('z')!),
                );
                cs.convert(this.tempVec3);
                finalXYZ = [this.tempVec3.x, this.tempVec3.y, this.tempVec3.z];
            } else {
                finalXYZ = [
                    Number(final.getAttribute('x')!),
                    Number(final.getAttribute('y')!),
                    Number(final.getAttribute('z')!),
                ];
            }

            const track: Track = {
                id,
                initialXYZ,
                finalXYZ,
                points,
            };

            tracks.push(track);
        }

        return tracks;
    }

    async processCameras(file: File): Promise<Camera[]> {
        const xml = this.files[file.name];
        const elements = xml.querySelectorAll('camera');
        const frame = xml.querySelector('vector')!.getAttribute('reference_frame')!;

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
                        initial: CAHVOREModel.process(initialModel, frame),
                        final: CAHVOREModel.process(finalModel, frame),
                    };

                    cameras.push(camera);
                    break;
                default:
                    throw new Error(`Unsupported Camera Model: ${model}`);
            }
        }

        return cameras;
    }

    async processImage(file: File): Promise<ImageFile> {
        return new Promise((resolve) => {
            const url = URL.createObjectURL(file);
            const image = new Image();
            image.onload = () => {
                resolve({
                    name: file.name,
                    url,
                    width: image.width,
                    height: image.height,
                });
            };
            image.src = url;
        });
    }

    private processPoints(elements: NodeListOf<Element>): Point[] {
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

            points.push(point);
        }
        return points;
    }
}
