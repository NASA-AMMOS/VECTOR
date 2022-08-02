import cn from 'classnames';
import { fileOpen } from 'browser-fs-access';
import { useData } from '@/DataContext';
import * as styles from '@/components/NavBar.css';

function NavBar({ state, dispatch }) {
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
            {!activeImage && (
                <div>
                    <button
                        className={cn(styles.button, { [styles.active]: state === 0 })}
                        onClick={() => dispatch({ type: 'statistics' })}
                    >
                        Global Statistics
                    </button>
                    <button
                        className={cn(styles.button, { [styles.active]: state === 1 })}
                        onClick={() => dispatch({ type: 'images' })}
                    >
                        Image Grid
                    </button>
                </div>
            )}
            <div>
                <button className={cn(styles.button, styles.active)}>
                    Filter & Sort
                </button>
            </div>
        </nav>
    );
}

export default NavBar;
