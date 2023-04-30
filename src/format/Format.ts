import { Camera, Track } from '@/stores/DataContext';

export enum FormatType {
    JPL,
    VECTOR,
}

export default class Format {
    static async processTracks(_: unknown): Promise<Track[]> {
        throw new Error('Method processTracks() is not implemented');
    }

    static async processCameras(_: unknown): Promise<Camera[]> {
        throw new Error('Method processCameras() is not implemented');
    }
}
