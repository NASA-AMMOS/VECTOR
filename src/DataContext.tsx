import { ReactNode, Dispatch, SetStateAction, createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Vector2 } from 'three';

const baseVector = new Vector2();

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

export interface IDataContext {
    tiepoints: Tiepoint[];
    cameras: Cameras;
    images: Image[];
    vicar: VICAR;

    activeImage: string | null;
    activeTrack: number | null;

    imageTiepoints: Record<string, Tiepoint[]>;

    getImageURL: (id: string) => string | null;
    getVICARFile: (id: string) => string[];
    parseVICARField: (metadata: string[], fieldName: string) => number[];

    setTiepoints: Dispatch<SetStateAction<Tiepoint[]>>;
    setCameras: Dispatch<SetStateAction<Cameras>>;
    setImages: Dispatch<SetStateAction<Image[]>>;
    setVICAR: Dispatch<SetStateAction<VICAR>>;

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

    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [activeTrack, setActiveTrack] = useState<number | null>(null);

    const imageTiepoints = useMemo(() => {
        return tiepoints.reduce<Record<string, Tiepoint[]>>((obj, tiepoint) => {
            obj[tiepoint.leftId] = obj[tiepoint.leftId] ? [...obj[tiepoint.leftId], tiepoint] : [tiepoint];
            obj[tiepoint.rightId] = obj[tiepoint.rightId] ? [...obj[tiepoint.rightId], tiepoint] : [tiepoint];
            return obj;
        }, {});
    }, [tiepoints]);

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

                activeImage,
                activeTrack,

                imageTiepoints,

                getImageURL,
                getVICARFile,
                parseVICARField,

                setTiepoints,
                setCameras,
                setImages,
                setVICAR,

                setActiveImage,
                setActiveTrack,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}
