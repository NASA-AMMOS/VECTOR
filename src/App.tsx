import { useReducer, useEffect } from 'react';
import Landing from '@/components/Landing';
import Overview from '@/components/Overview';
import ActiveImageView from '@/components/ActiveImageView';
import ActiveTrackView from '@/components/ActiveTrackView';
import NavBar from '@/components/NavBar';
import { useData } from '@/DataContext';
import * as styles from '@/App.css';

export enum PageType {
    STATISTICS = 'STATISTICS',
    IMAGES = 'IMAGES',
    CAMERAS = 'CAMERAS',
    IMAGE = 'IMAGE',
    TRACK = 'TRACK',
};

export type PageAction = {
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

    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        if (state < 3) {
            // Clear out active selections after returning to global view.
            setActiveImage(null);
            setActiveTrack(null);
        } else if (state === 3) {
            setActiveTrack(null);
        }
    }, [state]);

    return (
        <>
            {tiepoints.length === 0 || Object.keys(cameras).length === 0 || Object.keys(vicar).length === 0 ? (
                <Landing />
            ) : (
                <>
                    <NavBar state={state} dispatch={dispatch} />
                    <main className={styles.container}>
                        <Overview activeRoute={state} route={dispatch} />
                        <ActiveImageView route={dispatch} />
                        <ActiveTrackView route={dispatch} />
                    </main>
                </>
            )}    
        </>
    );
}
