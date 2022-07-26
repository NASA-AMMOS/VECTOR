import NavBar from '@/components/NavBar';
import GlobalImageView from '@/components/GlobalImageView';
import ActiveImageView from '@/components/ActiveImageView';
import ActiveTrackView from '@/components/ActiveTrackView';
import { useData } from '@/DataContext';
import * as styles from '@/App.css';

function App() {
    const { activeImage, activeTrack } = useData();

    return (
        <>
            <main className={styles.container}>
                {!activeImage  && <GlobalImageView />}
                {activeImage && !activeTrack && <ActiveImageView />}
                {activeImage && activeTrack && <ActiveTrackView />}
                <NavBar />
            </main>
        </>
    );
}

export default App;
