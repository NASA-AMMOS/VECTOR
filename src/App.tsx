import NavBar from '@/components/NavBar';
import GlobalImageView from '@/components/GlobalImageView';
import ActiveImageView from '@/components/ActiveImageView';
import CameraViewport from '@/components/CameraViewport';
import { useData } from '@/DataContext';
import * as styles from '@/App.css';

function App() {
    const { activeImage, activeTrack } = useData();

    return (
        <>
            <main className={styles.container}>
                {!activeImage  && <GlobalImageView />}
                {activeImage && !activeTrack && <ActiveImageView />}
                {activeImage && activeTrack && (
                    <section className={styles.subcontainer}>
                        <CameraViewport />
                    </section>
                )}
                <NavBar />
            </main>
        </>
    );
}

export default App;
