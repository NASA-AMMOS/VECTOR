import cn from 'classnames';
import { ActionType } from '@/DataContext';
import * as styles from '@/components/NavBar.css';

function NavBar({ state, dispatch }) {
    return (
        <nav className={styles.container}>
            <h1 className={styles.header}>
                VECTOR
            </h1>
            <div>
                <button
                    className={cn(styles.button, { [styles.active]: state === 2 })}
                    onClick={() => dispatch({ type: ActionType.CAMERAS })}
                >
                    Camera Viewport
                </button>
                <button
                    className={cn(styles.button, { [styles.active]: state === 0 })}
                    onClick={() => dispatch({ type: ActionType.STATISTICS })}
                >
                    Global Statistics
                </button>
                <button
                    className={cn(styles.button, { [styles.active]: state === 1 })}
                    onClick={() => dispatch({ type: ActionType.IMAGES })}
                >
                    Image Grid
                </button>
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
