import { createContext, useContext, useState, useMemo, useCallback } from 'react';

import { FormatType } from '@/formats/Format';

import CameraModel from '@/cameras/CameraModel';
import VECTORFormat from '@/formats/VECTORFormat';
import VISORFormat from '@/formats/VISORFormat';

export type CameraMap = Record<string, Camera>;
export type CameraImageMap = Record<string, ImageFile>;
export type CameraTrackMap = Record<string, Track[]>;
export type CameraPointMap = Record<string, Point[]>;

export enum EditStatus {
    ORIGINAL,
    DELETED,
}

export enum ResidualType {
    INITIAL = 'INITIAL',
    FINAL = 'FINAL',
}

export interface FileMetadata {
    file: File;
    format: FormatType;
}

export interface ImageFile {
    name: string;
    url: string;
    width: number;
    height: number;
}

export interface Point {
    id: string;
    cameraId: string;
    pixel: [number, number];
    initialResidual: [number, number];
    initialResidualLength: number;
    initialResidualAngle: number;
    finalResidual: [number, number];
    finalResidualLength: number;
    finalResidualAngle: number;
}

export interface Track {
    id: string;
    initialXYZ: [number, number, number];
    finalXYZ: [number, number, number];
    points: Point[];
    status: EditStatus;
}

export interface Camera {
    id: string;
    imageName: string;
    initial: CameraModel;
    final: CameraModel;
}

interface DataStore {
    tracks: Track[];
    setTracks: React.Dispatch<React.SetStateAction<Track[]>>;

    cameras: Camera[];
    setCameras: React.Dispatch<React.SetStateAction<Camera[]>>;

    images: Record<string, ImageFile>;
    setImages: React.Dispatch<React.SetStateAction<Record<string, ImageFile>>>;

    trackFile: FileMetadata | null;
    setTrackFile: React.Dispatch<React.SetStateAction<FileMetadata | null>>;

    cameraFile: FileMetadata | null;
    setCameraFile: React.Dispatch<React.SetStateAction<FileMetadata | null>>;

    cameraMap: CameraMap;
    cameraImageMap: CameraImageMap;
    cameraTrackMap: CameraTrackMap;
    cameraPointMap: CameraPointMap;
    points: Point[];

    minResidualLength: number;
    maxResidualLength: number;

    minResidualAngle: number;
    maxResidualAngle: number;

    exportTracks: () => void;
    exportCameras: () => void;
}

interface ProvideDataProps {
    children: React.ReactNode;
}

export const DataContext = createContext<DataStore>({} as DataStore);

export function useData() {
    return useContext(DataContext);
}

export default function ProvideData({ children }: ProvideDataProps) {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [cameras, setCameras] = useState<Camera[]>([]);

    const [images, setImages] = useState<CameraImageMap>({});

    const [trackFile, setTrackFile] = useState<FileMetadata | null>(null);
    const [cameraFile, setCameraFile] = useState<FileMetadata | null>(null);

    const cameraMap = useMemo(() => {
        return cameras.reduce<CameraMap>((map, camera) => {
            if (!(camera.id in map)) {
                map[camera.id] = camera;
            }
            return map;
        }, {});
    }, [cameras]);

    // Provide a LUT for images by camera ID. This improves the rendering
    // significantly because images can be 100s of entries and we often
    // need specific cameras while knowing the ID.
    const cameraImageMap = useMemo(() => {
        return cameras.reduce<CameraImageMap>((map, camera) => {
            if (!(camera.id in map) && camera.imageName in images) {
                map[camera.id] = images[camera.imageName];
            }
            return map;
        }, {});
    }, [cameras, images]);

    // Same reasoning — we can map cameras to tracks to improve performance.
    const cameraTrackMap = useMemo(() => {
        return tracks.reduce<CameraTrackMap>((map, track) => {
            for (const point of track.points) {
                if (point.cameraId in map) {
                    map[point.cameraId].push(track);
                } else {
                    map[point.cameraId] = [track];
                }
            }
            return map;
        }, {});
    }, [cameras, tracks]);

    const cameraPointMap = useMemo(() => {
        return tracks.reduce<CameraPointMap>((map, track) => {
            for (const point of track.points) {
                if (point.cameraId in map) {
                    map[point.cameraId].push(point);
                } else {
                    map[point.cameraId] = [point];
                }
            }
            return map;
        }, {});
    }, [cameras, tracks]);

    // Another one — useful for processing global residual information.
    const points = useMemo(() => tracks.map((track) => track.points).flat(), [tracks]);

    // The bounds for residual length and angle can be precomputed as it's
    // often needed for various aspects of the charts.
    const [[minResidualLength, maxResidualLength], [minResidualAngle, maxResidualAngle]] = useMemo(() => {
        const residualLengths = [];
        const residualAngles = [];

        for (const track of tracks) {
            for (const point of track.points) {
                residualLengths.push(point.initialResidualLength, point.finalResidualLength);
                residualAngles.push(point.initialResidualAngle, point.finalResidualAngle);
            }
        }

        return [
            [Math.min.apply(Math, residualLengths), Math.max.apply(Math, residualLengths)],
            [Math.min.apply(Math, residualAngles), Math.max.apply(Math, residualAngles)],
        ];
    }, [tracks]);

    const exportTracks = useCallback(() => {
        if (!trackFile || tracks.length < 1) return;

        switch (trackFile.format) {
            case FormatType.VECTOR:
                VECTORFormat.exportTracks(trackFile, tracks);
                break;
            case FormatType.VISOR:
                VISORFormat.exportTracks(trackFile, tracks);
                break;
        }
    }, [trackFile, tracks]);

    const exportCameras = useCallback(() => {
        if (!cameraFile || cameras.length < 1) return;

        switch (cameraFile.format) {
            case FormatType.VECTOR:
                VECTORFormat.exportCameras(cameraFile, cameras);
                break;
            case FormatType.VISOR:
                VISORFormat.exportCameras(cameraFile, cameras);
                break;
        }
    }, [cameraFile, cameras]);

    return (
        <DataContext.Provider
            value={{
                tracks,
                setTracks,

                cameras,
                setCameras,

                images,
                setImages,

                trackFile,
                setTrackFile,

                cameraFile,
                setCameraFile,

                cameraMap,
                cameraImageMap,
                cameraTrackMap,
                cameraPointMap,
                points,

                minResidualLength,
                maxResidualLength,

                minResidualAngle,
                maxResidualAngle,

                exportTracks,
                exportCameras,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}
