import cn from 'classnames';
import { PageType, useData } from '@/DataContext';
import * as styles from '@/components/NavBar.css';

function NavBar({ state, dispatch }) {
    const { activeImage, activeTrack } = useData();

    console.log(state);

    return (
        <nav className={styles.container}>
            <h1 className={styles.header}>
                VECTOR
            </h1>
            <div>
                <button
                    className={cn(styles.item, styles.button, { [styles.active]: state === 1 })}
                    onClick={() => dispatch({ type: PageType.CAMERAS })}
                >
                    Camera Viewport
                </button>
                <button
                    className={cn(styles.item, styles.button, { [styles.active]: state === 0 })}
                    onClick={() => dispatch({ type: PageType.STATISTICS })}
                >
                    Global Statistics
                </button>
                <div className={styles.item}>
                    <button
                        className={cn(styles.button, { [styles.active]: state >= 2 })}
                        onClick={() => dispatch({ type: PageType.IMAGES })}
                    >
                        Image Grid
                    </button>
                    {activeImage && (
                        <button
                            className={cn(styles.button, styles.small, { [styles.active]: state >= 3 })}
                            onClick={() => dispatch({ type: PageType.IMAGE })}
                        >
                            Active Image
                        </button>
                    )}
                    {activeImage && activeTrack && (
                        <button
                            className={cn(styles.button, styles.small, { [styles.active]: state === 4 })}
                            onClick={() => dispatch({ type: PageType.TRACK })}
                        >
                            Active Track
                        </button>
                    )}
                </div>
            </div>
            <div>
                <button className={cn(styles.button, styles.active)}>
                    Filter & Sort
                </button>
            </div>
        </nav>
    );
}

export default NavBar;
