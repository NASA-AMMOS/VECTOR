import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Vector2 } from 'three';

const baseVector = new Vector2();

export type Tiepoint = {
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

export enum PageType {
    STATISTICS = 'STATISTICS',
    IMAGES = 'IMAGES',
    CAMERAS = 'CAMERAS',
    IMAGE = 'IMAGE',
    TRACK = 'TRACK',
};

export const DataContext = createContext({});

export function useData() {
    return useContext(DataContext);
}

export default function ProvideData({ children }) {
    const [tiepoints, setTiepoints] = useState<Tiepoint[]>([]);
    const [cameras, setCameras] = useState({});
    const [images, setImages] = useState([]);
    const [vicar, setVICAR] = useState({});

    const [activeImage, setActiveImage] = useState<string>(null);
    const [activeTrack, setActiveTrack] = useState<number>(null);

    const imageTiepoints = useMemo(() => {
        return tiepoints.reduce((obj, tiepoint) => {
            obj[tiepoint.leftId] = obj[tiepoint.leftId] ? [...obj[tiepoint.leftId], tiepoint] : [tiepoint];
            obj[tiepoint.rightId] = obj[tiepoint.rightId] ? [...obj[tiepoint.rightId], tiepoint] : [tiepoint];
            return obj;
        }, {});
    }, [tiepoints]);

    const getImageURL = useCallback((id) => {
        const [_, fileId] = id.split('_');
        const image = images.find((image) => image.name.includes(fileId));
        return image.url;
    }, [images]);

    const getVICARFile = useCallback((id) => {
        const [_, fileId] = id.split('_');
        const key = Object.keys(vicar).find((v) => v.includes(fileId));
        return vicar[key];
    }, [vicar]);

    const parseVICARField = useCallback((field) => {
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
