import { fileOpen } from 'browser-fs-access';
import { useData } from '@/DataContext';
import * as styles from '@/components/NavBar.css';

function NavBar() {
    const { activeImage, activeTrack, setActiveImage, setActiveTrack } = useData();

    const parser = new DOMParser();

    function handleBack() {
        if (activeTrack) {
            setActiveTrack(null);
        } else {
            setActiveImage(null);
        }
    }

    return (
        <nav className={styles.container}>
            {activeImage && (
                <button className={styles.button} onClick={handleBack}>
                    Back
                </button>
            )}
            {!activeImage && (
                <h1 className={styles.header}>
                    VECTOR
                </h1>
            )}
            <div>
                <button className={styles.button}>
                    File Information
                </button>
            </div>
        </nav>
    );
}

export default NavBar;
