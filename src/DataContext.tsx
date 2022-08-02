import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Vector2 } from 'three';

const baseVector = new Vector2();

export const DataContext = createContext({});

export function useData() {
    return useContext(DataContext);
}

export default function ProvideData({ children }) {
    const [tiepoints, setTiepoints] = useState(null);
    const [cameras, setCameras] = useState(null);
    const [images, setImages] = useState([]);
    const [vicar, setVICAR] = useState({});

    const [activeImage, setActiveImage] = useState(null);
    const [activeTrack, setActiveTrack] = useState(null);

    const tracks = useMemo(() => {
        if (!activeImage || !tiepoints) return null;

        const trackIds = tiepoints[activeImage].map((tiepoint) => tiepoint.trackId);

        const activeTiepoints = Object.values(tiepoints).flat().filter((tiepoint) => trackIds.includes(tiepoint.trackId));

        const trackMap = activeTiepoints.reduce((obj, tiepoint) => {
            obj[tiepoint.trackId] = obj[tiepoint.trackId] ? [...obj[tiepoint.trackId], tiepoint] : [tiepoint];
            return obj;
        }, {});

        const newTracks = {};

        for (const trackId of Object.keys(trackMap)) {
            const newTrack = [];
            let maxResidual = 0;
            
            for (const tiepoint of trackMap[trackId]) {
                const initialResidual = new Vector2(...tiepoint.initialResidual);
                const finalResidual = new Vector2(...tiepoint.finalResidual);

                const initialResidualDistance = baseVector.distanceTo(initialResidual);
                const finalResidualDistance = baseVector.distanceTo(finalResidual);

                maxResidual = Math.max(maxResidual, initialResidualDistance, finalResidualDistance);

                newTrack.push({ initialResidual: initialResidualDistance, finalResidual: finalResidualDistance });
            }
            
            newTracks[trackId] = {
                maxResidual,
                tiepoints: newTrack,
            };
        }

        return newTracks;
    }, [activeImage, tiepoints]);

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

    return (
        <DataContext.Provider
            value={{
                tiepoints,
                cameras,
                images,
                vicar,

                activeImage,
                activeTrack,

                tracks,

                getImageURL,
                getVICARFile,

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
