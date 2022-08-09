import { ReactNode, Dispatch, SetStateAction, createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Vector2 } from 'three';
import { Polar } from '@/utils/helpers';

const baseVector = new Vector2();

export enum EditOperation {
    EDIT = 'EDIT',
    DELETE = 'DELETE',
};

export enum EditType {
    IMAGE = 'IMAGE',
    TRACK = 'TRACK',
    TIEPOINT = 'TIEPOINT',
};

export interface Tiepoint {
    index: number;
    trackId: number;
    leftId: string;
    rightId: string;
    leftKey: number;
    rightKey: number;
    initialXYZ: [number, number, number];
    finalXYZ: [number, number, number];
    leftPixel: [number, number];
    rightPixel: [number, number];
    initialResidual: [number, number];
    finalResidual: [number, number];
};

export interface Frame {
    name: string;
    index: string;
};

export interface CameraModel {
    C: number[];
    A: number[];
    H: number[];
    frame: Frame;
};

export interface Camera {
    initial: CameraModel;
    final: CameraModel;
};

export interface Cameras {
    [key: string]: Camera;
};

export interface Image {
    name: string;
    url: string;
};

export interface VICAR {
    [key: string]: string[];
};

export interface Edit {
    id: string;
    type: string;
    operation: string;
};

export interface IDataContext {
    tiepoints: Tiepoint[];
    cameras: Cameras;
    images: Image[];
    vicar: VICAR;
    mesh: string | null;

    tiepointsFile: string;

    activeImage: string | null;
    activeTrack: number | null;

    editHistory: Edit[];

    imageTiepoints: Record<string, Tiepoint[]>;
    initialResidualBounds: [[number, number], [number, number]];
    finalResidualBounds: [[number, number], [number, number]];
    residualBounds: [[number, number], [number, number]];

    getImageURL: (id: string) => string | null;
    getVICARFile: (id: string) => string[];
    parseVICARField: (metadata: string[], fieldName: string) => number[];

    setTiepoints: Dispatch<SetStateAction<Tiepoint[]>>;
    setCameras: Dispatch<SetStateAction<Cameras>>;
    setImages: Dispatch<SetStateAction<Image[]>>;
    setVICAR: Dispatch<SetStateAction<VICAR>>;
    setMesh: Dispatch<SetStateAction<string | null>>;

    setTiepointsFile: Dispatch<SetStateAction<string>>;

    setEditHistory: Dispatch<SetStateAction<Edit[]>>;

    setActiveImage: Dispatch<SetStateAction<string | null>>;
    setActiveTrack: Dispatch<SetStateAction<number | null>>;
};

export interface ProvideDataProps {
    children: ReactNode;
};

export const DataContext = createContext<IDataContext>({} as IDataContext);

export function useData() {
    return useContext(DataContext);
}

export default function ProvideData({ children }: ProvideDataProps) {
    const [tiepoints, setTiepoints] = useState<Tiepoint[]>([]);
    const [cameras, setCameras] = useState<Cameras>({});
    const [images, setImages] = useState<Image[]>([]);
    const [vicar, setVICAR] = useState<VICAR>({});
    const [mesh, setMesh] = useState<string | null>(null);

    const [tiepointsFile, setTiepointsFile] = useState<string>('');

    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [activeTrack, setActiveTrack] = useState<number | null>(null);

    const [editHistory, setEditHistory] = useState<Edit[]>([]);

    const imageTiepoints = useMemo(() => {
        return tiepoints.reduce<Record<string, Tiepoint[]>>((obj, tiepoint) => {
            obj[tiepoint.leftId] = obj[tiepoint.leftId] ? [...obj[tiepoint.leftId], tiepoint] : [tiepoint];
            obj[tiepoint.rightId] = obj[tiepoint.rightId] ? [...obj[tiepoint.rightId], tiepoint] : [tiepoint];
            return obj;
        }, {});
    }, [tiepoints]);

    const [initialResidualBounds, finalResidualBounds] = useMemo<[[[number, number], [number, number]], [[number, number], [number, number]]]>(() => {
        const cartInitialResiduals = [];
        const polarInitialResiduals = [];

        const cartFinalResiduals = [];
        const polarFinalResiduals = [];

        for (const tiepoint of tiepoints) {
            const initialResidual = new Vector2(...tiepoint.initialResidual);
            const finalResidual = new Vector2(...tiepoint.finalResidual);
            const initialDistance = Number(baseVector.distanceTo(initialResidual).toFixed(1));
            const finalDistance = Number(baseVector.distanceTo(finalResidual).toFixed(1));
            cartInitialResiduals.push(initialDistance);
            cartFinalResiduals.push(finalDistance);
            polarInitialResiduals.push(Polar(tiepoint.initialResidual).radius);
            polarFinalResiduals.push(Polar(tiepoint.finalResidual).radius);
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
    }, [tiepoints]);

    const residualBounds = useMemo<[[number, number], [number, number]]>(() => {
        return [
            [
                Math.min(initialResidualBounds[0][0], finalResidualBounds[0][0]),
                Math.max(initialResidualBounds[0][1], finalResidualBounds[0][1])
            ],
            [
                Math.min(initialResidualBounds[1][0], finalResidualBounds[1][0]),
                Math.max(initialResidualBounds[1][1], finalResidualBounds[1][1])
            ],
        ];
    }, [initialResidualBounds, finalResidualBounds]);

    const getImageURL = useCallback((id: string) => {
        const [_, fileId] = id.split('_');
        const image = images.find((image) => image.name.includes(fileId));
        if (!image) return null;
        return image.url;
    }, [images]);

    const getVICARFile = useCallback((id: string) => {
        const [_, fileId] = id.split('_');
        const key = Object.keys(vicar).find((v: string) => v.includes(fileId));
        if (!key) return [];
        return vicar[key];
    }, [vicar]);

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
                tiepoints,
                cameras,
                images,
                vicar,
                mesh,

                tiepointsFile,

                editHistory,

                activeImage,
                activeTrack,

                imageTiepoints,
                initialResidualBounds,
                finalResidualBounds,
                residualBounds,

                getImageURL,
                getVICARFile,
                parseVICARField,

                setTiepoints,
                setCameras,
                setImages,
                setVICAR,
                setMesh,

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
