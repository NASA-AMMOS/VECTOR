import { Reducer, useReducer, useEffect } from 'react';
import Landing from '@/components/Landing';
import Overview from '@/components/Overview';
import ActiveImageView from '@/components/ActiveImageView';
import ActiveTrackView from '@/components/ActiveTrackView';
import NavBar from '@/components/NavBar';
import { ActionType, useData } from '@/DataContext';
import * as styles from '@/App.css';

interface IReducer {
    type: ActionType;
};

function reducer(state, action): Reducer<number, IReducer> {
    switch (action.type) {
        case ActionType.STATISTICS:
            return 0;
        case ActionType.IMAGES:
            return 1;
        case ActionType.CAMERAS:
            return 2;
        case ActionType.ENTER:
            return -1;
        default:
            return state;
    }
}

function App() {
    const { tiepoints, cameras, vicar, activeImage, activeTrack, setActiveImage, setActiveTrack } = useData();

    const [state, dispatch] = useReducer<Reducer<number, IReducer>>(reducer, 0);

    useEffect(() => {
        if (state !== -1) {
            // Clear out active selections after returning to global view.
            setActiveImage(null);
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
                    <ActiveImageView />
                    {activeImage && activeTrack && <ActiveTrackView />}
                </main>
                <NavBar state={state} dispatch={dispatch} />
            </>
        );
    }
}

export default App;
