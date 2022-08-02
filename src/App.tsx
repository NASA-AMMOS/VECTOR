import { useReducer } from 'react';
import Landing from '@/components/Landing';
import Overview from '@/components/Overview';
import ActiveImageView from '@/components/ActiveImageView';
import ActiveTrackView from '@/components/ActiveTrackView';
import NavBar from '@/components/NavBar';
import { useData } from '@/DataContext';
import * as styles from '@/App.css';

function App() {
    const { tiepoints, cameras, vicar, activeImage, activeTrack } = useData();

    const [state, dispatch] = useReducer(reducer, 0);

    function reducer(state, action) {
        switch (action.type) {
            case 'statistics':
                return 0;
            case 'images':
                return 1;
            default:
                throw new Error();
        }
    }

    if (!tiepoints || !cameras || !vicar) {
        return <Landing />
    } else {
        return (
            <>
                <main className={styles.container}>
                    <Overview state={state} />
                    {activeImage && !activeTrack && <ActiveImageView />}
                    {activeImage && activeTrack && <ActiveTrackView />}
                </main>
                <NavBar state={state} dispatch={dispatch} />
            </>
        );
    }

}

export default App;
