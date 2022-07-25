import { createContext, useContext, useState } from 'react';

const DataContext = createContext({});

export function useData() {
    return useContext(DataContext);
}

export default function ProvideData({ children }) {
    const [tiepoints, setTiepoints] = useState(null);
    const [cameras, setCameras] = useState(null);

    const [activeImage, setActiveImage] = useState(null);
    const [activeTrack, setActiveTrack] = useState(null);

    return (
        <DataContext.Provider
            value={{
                tiepoints,
                cameras,
                activeImage,
                activeTrack,

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
