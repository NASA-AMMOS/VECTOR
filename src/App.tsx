import NavBar from '@/components/NavBar';
import Images from '@/components/Images';
import Tracks from '@/components/Tracks';
import TiepointImage from '@/components/TiepointImage';
import ResidualLength from '@/components/ResidualLength';
import CameraViewport from '@/components/CameraViewport';
import { useData } from '@/DataContext';
import * as styles from '@/App.css';

function App() {
    const { activeImage, activeTrack } = useData();

    return (
        <>
            <NavBar />
            <main className={styles.container}>
                {!activeImage  && <Images />}
                {activeImage && !activeTrack && (
                    <section className={styles.subcontainer}>
                        <div className={styles.block}>
                            <TiepointImage />
                            <div className={styles.item}>
                                <ResidualLength activeImage={activeImage} />
                            </div>
                        </div>
                        <Tracks />
                    </section>
                )}
                {activeImage && activeTrack && (
                    <section className={styles.subcontainer}>
                        <CameraViewport />
                    </section>
                )}
            </main>
        </>
    );
}

export default App;
