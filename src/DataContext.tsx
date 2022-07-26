import { createContext, useContext, useState, useMemo } from 'react';
import { Vector2 } from 'three';

const baseVector = new Vector2();

const DataContext = createContext({});

export function useData() {
    return useContext(DataContext);
}

export default function ProvideData({ children }) {
    const [tiepoints, setTiepoints] = useState(null);
    const [cameras, setCameras] = useState(null);

    const [activeImage, setActiveImage] = useState(null);
    const [activeTrack, setActiveTrack] = useState(null);

    const [renderTarget, setRenderTarget] = useState(null);

    const residuals = useMemo(() => {
        if (!tiepoints) return null;

        const newResiduals = {};

        const initialResiduals = [];
        const finalResiduals = [];

        for (const imageId of Object.keys(tiepoints)) {
            const imageTiepoints = tiepoints[imageId];
            for (const tiepoint of imageTiepoints) {
                const initialResidual = new Vector2(...tiepoint.initialResidual);
                const finalResidual = new Vector2(...tiepoint.finalResidual);

                const initialDistance = Number(baseVector.distanceTo(initialResidual));
                const finalDistance = Number(baseVector.distanceTo(finalResidual));

                const item = {
                    initial: initialDistance,
                    final: finalDistance
                };

                newResiduals[imageId] = newResiduals[imageId] ? [...newResiduals[imageId], item] : [item];
            }
        }

        return newResiduals;
    }, [tiepoints]);

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

                const initialResidualDistance = baseVector.clone().distanceTo(initialResidual);
                const finalResidualDistance = baseVector.clone().distanceTo(finalResidual);

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

    return (
        <DataContext.Provider
            value={{
                tiepoints,
                cameras,
                activeImage,
                activeTrack,
                residuals,
                tracks,
                renderTarget,

                setTiepoints,
                setCameras,
                setActiveImage,
                setActiveTrack,
                setRenderTarget
            }}
        >
            {children}
        </DataContext.Provider>
    );
}
