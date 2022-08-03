import { Reducer, useReducer, useEffect } from 'react';
import Landing from '@/components/Landing';
import Overview from '@/components/Overview';
import ActiveImageView from '@/components/ActiveImageView';
import ActiveTrackView from '@/components/ActiveTrackView';
import NavBar from '@/components/NavBar';
import { PageType, useData } from '@/DataContext';
import * as styles from '@/App.css';

interface IReducer {
    type: PageType;
};

function reducer(state, action): Reducer<number, IReducer> {
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

function App() {
    const { tiepoints, cameras, vicar, activeImage, activeTrack, setActiveImage, setActiveTrack } = useData();

    const [state, dispatch] = useReducer<Reducer<number, IReducer>>(reducer, 0);

    useEffect(() => {
        if (state < 3) {
            // Clear out active selections after returning to global view.
            setActiveImage(null);
            setActiveTrack(null);
        } else if (state === 3) {
            setActiveTrack(null);
        }
    }, [state]);

    if (tiepoints.length === 0 || Object.keys(cameras).length === 0 || Object.keys(vicar).length === 0) {
        return <Landing />
    } else {
        return (
            <>
                <main className={styles.container}>
                    <Overview state={state} dispatch={dispatch} />
                    <ActiveImageView dispatch={dispatch} />
                    <ActiveTrackView dispatch={dispatch} />
                </main>
                <NavBar state={state} dispatch={dispatch} />
            </>
        );
    }
}

export default App;
