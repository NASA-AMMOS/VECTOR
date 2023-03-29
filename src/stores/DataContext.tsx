import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Vector2 } from 'three';
import { Polar } from '@/utils/helpers';

const baseVector = new Vector2();

export enum EditOperation {
    EDIT = 'EDIT',
    DELETE = 'DELETE',
}

export enum EditType {
    IMAGE = 'IMAGE',
    TRACK = 'TRACK',
    TIEPOINT = 'TIEPOINT',
}

export type ImageTrackMap = Record<string, Track[]>;

export interface Point {
    index: number;
    id: string;
    key: number;
    pixel: [number, number];
    initialResidual: [number, number];
    finalResidual: [number, number];
}

export interface Track {
    index: number;
    trackId: number;
    initialXYZ: [number, number, number];
    finalXYZ: [number, number, number];
    points: Point[];
}

export interface Frame {
    name: string;
    index: string;
}

export interface CameraModel {
    C: number[];
    A: number[];
    H: number[];
    frame: Frame;
}

export interface Camera {
    initial: CameraModel;
    final: CameraModel;
}

export interface Cameras {
    [key: string]: Camera;
}

export interface Image {
    name: string;
    url: string;
}

export interface VICAR {
    [key: string]: string[];
}

export interface Edit {
    id: string | number;
    type: string;
    operation: string;
}

interface DataStore {
    tracks: Track[];
    cameras: Cameras;
    images: Image[];
    vicar: VICAR;

    tiepointsFile: string;

    activeImage: string | null;
    activeTrack: number | null;

    editHistory: Edit[];

    imageTracks: ImageTrackMap;
    initialResidualBounds: [[number, number], [number, number]];
    finalResidualBounds: [[number, number], [number, number]];
    residualBounds: [[number, number], [number, number]];
    editedTracks: number[];

    getImageURL: (id: string) => string | null;
    getVICARFile: (id: string) => string[];
    parseVICARField: (metadata: string[], fieldName: string) => number[];

    setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
    setCameras: React.Dispatch<React.SetStateAction<Cameras>>;
    setImages: React.Dispatch<React.SetStateAction<Image[]>>;
    setVICAR: React.Dispatch<React.SetStateAction<VICAR>>;

    // TODO: Need equivalent of setTiepointsFile for tracks.
    setTiepointsFile: React.Dispatch<React.SetStateAction<string>>;

    setEditHistory: React.Dispatch<React.SetStateAction<Edit[]>>;

    setActiveImage: React.Dispatch<React.SetStateAction<string | null>>;
    setActiveTrack: React.Dispatch<React.SetStateAction<number | null>>;
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
    const [cameras, setCameras] = useState<Cameras>({});
    const [images, setImages] = useState<Image[]>([]);
    const [vicar, setVICAR] = useState<VICAR>({});

    const [tiepointsFile, setTiepointsFile] = useState<string>('');

    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [activeTrack, setActiveTrack] = useState<number | null>(null);

    const [editHistory, setEditHistory] = useState<Edit[]>([]);

    const imageTracks = useMemo(() => {
        return tracks.reduce<ImageTrackMap>((result: ImageTrackMap, track: Track) => {
            for (const point of track.points) {
                // TODO: Check for duplicate tracks being included?
                if (point.id in result) {
                    result[point.id].push(track);
                } else {
                    result[point.id] = [track];
                }
            }
            return result;
        }, {});
    }, [tracks]);

    const [initialResidualBounds, finalResidualBounds] = useMemo<
        [[[number, number], [number, number]], [[number, number], [number, number]]]
    >(() => {
        const cartInitialResiduals = [];
        const polarInitialResiduals = [];

        const cartFinalResiduals = [];
        const polarFinalResiduals = [];

        for (const track of tracks) {
            for (const point of track.points) {
                const initialResidual = new Vector2(...point.initialResidual);
                const finalResidual = new Vector2(...point.finalResidual);
                const initialDistance = Number(baseVector.distanceTo(initialResidual).toFixed(1));
                const finalDistance = Number(baseVector.distanceTo(finalResidual).toFixed(1));
                cartInitialResiduals.push(initialDistance);
                cartFinalResiduals.push(finalDistance);
                polarInitialResiduals.push(Polar(point.initialResidual).radius);
                polarFinalResiduals.push(Polar(point.finalResidual).radius);
            }
        }

        return [
            [
                [Math.min(...cartInitialResiduals), Math.max(...cartInitialResiduals)],
                [Math.min(...polarInitialResiduals), Math.max(...polarInitialResiduals)],
            ],
            [
                [Math.min(...cartFinalResiduals), Math.max(...cartFinalResiduals)],
                [Math.min(...polarFinalResiduals), Math.max(...polarFinalResiduals)],
            ],
        ];
    }, [tracks]);

    const residualBounds = useMemo<[[number, number], [number, number]]>(() => {
        return [
            [
                Math.min(initialResidualBounds[0][0], finalResidualBounds[0][0]),
                Math.max(initialResidualBounds[0][1], finalResidualBounds[0][1]),
            ],
            [
                Math.min(initialResidualBounds[1][0], finalResidualBounds[1][0]),
                Math.max(initialResidualBounds[1][1], finalResidualBounds[1][1]),
            ],
        ];
    }, [initialResidualBounds, finalResidualBounds]);

    const editedTracks = useMemo<number[]>(
        () =>
            editHistory
                .filter((e) => e.type === EditType.TRACK)
                .map((e) => e.id)
                .map(Number),
        [editHistory],
    );

    const getImageURL = useCallback(
        (id: string) => {
            const fileId = id.slice(6);
            const image = images.find((image) => image.name.includes(fileId));
            if (!image) return null;
            return image.url;
        },
        [images],
    );

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
                images,
                vicar,

                tiepointsFile,

                editHistory,

                activeImage,
                activeTrack,

                imageTracks,
                initialResidualBounds,
                finalResidualBounds,
                residualBounds,
                editedTracks,

                getImageURL,
                getVICARFile,
                parseVICARField,

                setTracks,
                setCameras,
                setImages,
                setVICAR,

                setTiepointsFile,

                setEditHistory,

                setActiveImage,
                setActiveTrack,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}
