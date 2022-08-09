import cn from 'classnames';
import { PageAction, PageType } from '@/App';
import { useData } from '@/DataContext';
import * as styles from '@/components/NavBar.css';

interface NavBarProps {
    state: number;
    dispatch: React.Dispatch<PageAction>;
};

export default function NavBar({ state, dispatch }: NavBarProps) {
    const { activeImage, activeTrack } = useData();

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
                    Scene
                </button>
                <button
                    className={cn(styles.item, styles.button, { [styles.active]: state === 0 })}
                    onClick={() => dispatch({ type: PageType.STATISTICS })}
                >
                    Overview
                </button>
                <div className={styles.item}>
                    <button
                        className={cn(styles.button, { [styles.active]: state >= 2 })}
                        onClick={() => dispatch({ type: PageType.IMAGES })}
                    >
                        Images
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
                    Files
                </button>
            </div>
        </nav>
    );
}
