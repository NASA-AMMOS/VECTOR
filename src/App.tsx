import Landing from '@/components/Landing';
import GlobalImageView from '@/components/GlobalImageView';
import ActiveImageView from '@/components/ActiveImageView';
import ActiveTrackView from '@/components/ActiveTrackView';
import NavBar from '@/components/NavBar';
import { useData } from '@/DataContext';
import * as styles from '@/App.css';

function App() {
    const { tiepoints, cameras, activeImage, activeTrack } = useData();

    if (!tiepoints || !cameras) {
        return <Landing />
    } else {
        return (
            <>
                <main className={styles.container}>
                    {!activeImage && <GlobalImageView />}
                    {activeImage && !activeTrack && <ActiveImageView />}
                    {activeImage && activeTrack && <ActiveTrackView />}
                </main>
                <NavBar />
            </>
        );
    }

}

export default App;
