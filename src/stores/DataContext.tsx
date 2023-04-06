import { createContext, useContext, useState, useMemo, useCallback } from 'react';

import CameraModel from '@/models/Camera';

export type CameraImageMap = Record<string, Camera>;
export type CameraTrackMap = Record<string, Track[]>;
export type CameraPointMap = Record<string, Point[]>;

export type VICAR = Record<string, string[]>;

export enum ResidualType {
    INITIAL = 'INITIAL',
    FINAL = 'FINAL',
}

export interface Point {
    index: number;
    cameraId: string;
    key: number;
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
}

export interface Camera {
    id: string;
    imageName: string;
    imageURL: string;
    imageWidth: number;
    imageHeight: number;
    initial: CameraModel;
    final: CameraModel;
}

interface DataStore {
    tracks: Track[];
    cameras: Camera[];
    vicar: VICAR;

    cameraMap: CameraImageMap;
    cameraTrackMap: CameraTrackMap;
    cameraPointMap: CameraPointMap;
    points: Point[];

    minResidualLength: number;
    maxResidualLength: number;

    minResidualAngle: number;
    maxResidualAngle: number;

    getVICARFile: (id: string) => string[];
    parseVICARField: (metadata: string[], fieldName: string) => number[];

    setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
    setCameras: React.Dispatch<React.SetStateAction<Camera[]>>;
    setVICAR: React.Dispatch<React.SetStateAction<VICAR>>;
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
    const [vicar, setVICAR] = useState<VICAR>({});

    // Provide a LUT for images by camera ID. This improves the rendering
    // significantly because images can be 100s of entries and we often
    // need specific cameras while knowing the ID.
    const cameraMap = useMemo(() => {
        return cameras.reduce<CameraImageMap>((map, camera) => {
            if (!(camera.id in map)) {
                map[camera.id] = camera;
            }
            return map;
        }, {});
    }, [cameras]);

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
        return cameras.reduce<CameraPointMap>((map, camera) => {
            const tracks = cameraTrackMap[camera.id];
            map[camera.id] = tracks.map((track) => track.points).flat();
            return map;
        }, {});
    }, [cameraTrackMap]);

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

    const getVICARFile = useCallback(
        (id: string) => {
            const fileId = id.slice(6);
            const key = Object.keys(vicar).find((v: string) => v.includes(fileId));
            if (!key) return [];
            return vicar[key];
        },
        [vicar],
    );

    const parseVICARField = useCallback((metadata: string[], fieldName: string) => {
        const field = metadata.find((f: string) => f.startsWith(fieldName));
        if (!field) return [];
        const [_, vector] = field.replace(/[\(\)]/g, '').split('=');
        const values = vector.split(',');
        return values.map(Number);
    }, []);

    return (
        <DataContext.Provider
            value={{
                tracks,
                cameras,
                vicar,

                cameraMap,
                cameraTrackMap,
                cameraPointMap,
                points,

                minResidualLength,
                maxResidualLength,

                minResidualAngle,
                maxResidualAngle,

                getVICARFile,
                parseVICARField,

                setTracks,
                setCameras,
                setVICAR,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}
