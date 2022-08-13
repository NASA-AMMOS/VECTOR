import { createContext, useContext, useState, useEffect } from 'react';

import { useData } from '@/stores/DataContext';

export enum Route {
    STATISTICS = 'STATISTICS',
    IMAGES = 'IMAGES',
    CAMERAS = 'CAMERAS',
    IMAGE = 'IMAGE',
    TRACK = 'TRACK',
};

interface Router {
    pathname: Route;
    push: React.Dispatch<React.SetStateAction<Route>>;
};

interface ProvideRouterProps {
    children: React.ReactNode;
};

export const RouterContext = createContext<Router>({} as Router);

export function useRouter() {
    return useContext(RouterContext);
}

export default function ProvideRouter({ children }: ProvideRouterProps) {
    const { setActiveImage, setActiveTrack } = useData();

    const [route, setRoute] = useState<Route>(Route.STATISTICS);

    useEffect(() => {
        if (route !== Route.IMAGE && route !== Route.TRACK) {
            setActiveImage(null);
        }
        if (route !== Route.TRACK) {
            setActiveTrack(null);
        }
    }, [route]);

    return (
        <RouterContext.Provider value={{ pathname: route, push: setRoute }}>
            {children}
        </RouterContext.Provider>
    );
}
