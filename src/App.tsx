import NavBar from '@/components/NavBar';
import Images from '@/components/Images';
import Tracks from '@/components/Tracks';
import TiepointImage from '@/components/TiepointImage';
import { useData } from '@/DataContext';
import * as styles from '@/App.css';

function App() {
    const { activeImage } = useData();

    return (
        <>
            <NavBar />
            <main className={styles.container}>
                {!activeImage  && <Images />}
                {activeImage && (
                    <section className={styles.subcontainer}>
                        <div className={styles.list}>
                            <TiepointImage />
                        </div>
                        <Tracks />
                    </section>
                )}
            </main>
        </>
    );
}

export default App;
