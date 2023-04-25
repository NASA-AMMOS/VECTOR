import { Camera, ImageFile, Track } from '@/stores/DataContext';

export enum LoaderType {
    TRACKS = 'track',
    CAMERAS = 'camera',
}

export default class Loader {
    loadTracks(_file: File): Promise<Track[]> {
        throw new Error('Method loadTracks() is not implemented');
    }

    loadCameras(_file: File): Promise<Camera[]> {
        throw new Error('Method loadCameras() is not implemented');
    }

    loadImage(_file: File): Promise<ImageFile> {
        throw new Error('Method loadImage() is not implemented');
    }
}
