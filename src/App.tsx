import NavBar from '@/components/NavBar';
import Images from '@/components/Images';
import Image from '@/components/Image';
import { useData } from '@/DataContext';
import * as styles from '@/App.css';

function App() {
    const { activeImage } = useData();

    return (
        <>
            <NavBar />
            <main className={styles.container}>
                {!activeImage  && <Images />}
                {activeImage && <Image />}
            </main>
        </>
    );
}

export default App;
