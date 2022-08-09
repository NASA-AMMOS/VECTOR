import { useState, useReducer, useEffect } from 'react';
import Landing from '@/components/Landing';
import Overview from '@/components/Overview';
import ActiveImageView from '@/components/ActiveImageView';
import ActiveTrackView from '@/components/ActiveTrackView';
import NavBar from '@/components/NavBar';
import ContextMenu from '@/components/ContextMenu';
import { useData } from '@/DataContext';
import * as styles from '@/App.css';

export enum PageType {
    STATISTICS = 'STATISTICS',
    IMAGES = 'IMAGES',
    CAMERAS = 'CAMERAS',
    IMAGE = 'IMAGE',
    TRACK = 'TRACK',
};

export interface ContextMenuState {
    isEnabled: boolean;
    isTrack: boolean;
    isTiepoint: boolean;
    x: number;
    y: number;
    data: any;
};

export interface PageAction {
    type: PageType;
};

const initialState = 0;

function reducer(state: number, action: PageAction): number {
    switch (action.type) {
        case PageType.STATISTICS:
            return 0;
        case PageType.CAMERAS:
            return 1;
        case PageType.IMAGES:
            return 2;
        case PageType.IMAGE:
            return 3;
        case PageType.TRACK:
            return 4;
        default:
            return state;
    }
}

export default function App() {
    const { tiepoints, cameras, vicar, activeImage, activeTrack, setActiveImage, setActiveTrack } = useData();

    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        isEnabled: false,
        isTrack: false,
        isTiepoint: false,
        x: 0,
        y: 0,
        data: null,
    });

    const [route, dispatchRoute] = useReducer(reducer, initialState);

    function disableContextMenu() {
        setContextMenu((prevState) => ({
            ...prevState,
            isEnabled: false,
            isTrack: false,
            isTiepoint: false,
            data: null,
        }));
    }

    useEffect(() => {
        if (route < 3) {
            // Clear out active selections after returning to global view.
            setActiveImage(null);
            setActiveTrack(null);
        } else if (route === 3) {
            setActiveTrack(null);
        }
    }, [route]);

    useEffect(() => {
        window.addEventListener('click', disableContextMenu, false);
        return () => {
            window.removeEventListener('click', disableContextMenu, false);
        };
    }, []);

    return (
        <>
            {tiepoints.length === 0 || Object.keys(cameras).length === 0 || Object.keys(vicar).length === 0 ? (
                <Landing />
            ) : (
                <>
                    <NavBar
                        route={route}
                        dispatchRoute={dispatchRoute}
                    />
                    <main className={styles.container}>
                        <Overview activeRoute={route} route={dispatchRoute} />
                        <ActiveImageView
                            contextMenu={contextMenu}
                            setContextMenu={setContextMenu}
                            dispatchRoute={dispatchRoute}
                        />
                        <ActiveTrackView route={dispatchRoute} />
                    </main>
                    {contextMenu.isEnabled && <ContextMenu state={contextMenu} />}
                </>
            )}
        </>
    );
}
