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

    const maxResidual = useMemo(() => residuals && Math.max(...Object.values(residuals).flat().map(({ initial, final }) => [initial, final]).flat()), [residuals]);

    return (
        <DataContext.Provider
            value={{
                tiepoints,
                cameras,
                activeImage,
                activeTrack,
                residuals,
                maxResidual,

                setTiepoints,
                setCameras,
                setActiveImage,
                setActiveTrack,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}
