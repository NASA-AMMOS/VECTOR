import { Camera, CameraImageMap, Track } from '@/stores/DataContext';

export enum FormatType {
    VISOR,
    VECTOR,
}

export default class Format {
    static async processTracks(_: unknown): Promise<Track[]> {
        throw new Error('Method processTracks() is not implemented');
    }

    static async processCameras(_: unknown): Promise<Camera[]> {
        throw new Error('Method processCameras() is not implemented');
    }

    // A utility method for the VISOR format because the navigation XML
    // stores unique IDs that are partial strings to the full image name.
    static mapImages(_: Camera[], _images: CameraImageMap): Camera[] {
        throw new Error('Method mapImages() is not implemented');
    }
}
