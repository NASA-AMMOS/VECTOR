import { FormatType } from '@/formats/Format';

export enum LoaderType {
    TRACKS = 'track',
    CAMERAS = 'camera',
}

export default class Loader {
    static EXTENSIONS: string[] = [];

    static async load(_: File): Promise<unknown> {
        throw new Error('Method load() is not implemented');
    }

    static inferFormat(_: unknown): FormatType {
        throw new Error('Method inferFormat() is not implemented');
    }

    static inferType(_: unknown, _format: FormatType): LoaderType {
        throw new Error('Method inferType() is not implemented');
    }
}
