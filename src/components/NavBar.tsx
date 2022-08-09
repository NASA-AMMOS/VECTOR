import { useState } from 'react';
import cn from 'classnames';
import { PageAction, PageType } from '@/App';
import { useData } from '@/DataContext';
import * as styles from '@/components/NavBar.css';

interface NavBarProps {
    route: number;
    dispatchRoute: React.Dispatch<PageAction>;
};

export default function NavBar({ route, dispatchRoute }: NavBarProps) {
    const { activeImage, activeTrack, editHistory } = useData();

    const [activeHistoryModal, setActiveHistoryModal] = useState(false);

    function handleHistoryClick() {
        setActiveHistoryModal((prevState) => !prevState);
    }

    return (
        <>
            <nav className={styles.container}>
                <div>
                    <h1 className={cn(styles.item, styles.header)}>
                        VECTOR
                    </h1>
                    {editHistory.length > 0 && (
                        <p className={cn(styles.item, styles.edited)}>
                            Edited
                        </p>
                    )}
                </div>
                <div>
                    <button
                        className={cn(styles.item, styles.button, { [styles.active]: route === 1 })}
                        onClick={() => dispatchRoute({ type: PageType.CAMERAS })}
                    >
                        Scene
                    </button>
                    <button
                        className={cn(styles.item, styles.button, { [styles.active]: route === 0 })}
                        onClick={() => dispatchRoute({ type: PageType.STATISTICS })}
                    >
                        Overview
                    </button>
                    <div className={styles.item}>
                        <button
                            className={cn(styles.button, { [styles.active]: route >= 2 })}
                            onClick={() => dispatchRoute({ type: PageType.IMAGES })}
                        >
                            Images
                        </button>
                        {activeImage && (
                            <button
                                className={cn(styles.button, styles.small, { [styles.active]: route >= 3 })}
                                onClick={() => dispatchRoute({ type: PageType.IMAGE })}
                            >
                                Active Image
                            </button>
                        )}
                        {activeImage && activeTrack && (
                            <button
                                className={cn(styles.button, styles.small, { [styles.active]: route === 4 })}
                                onClick={() => dispatchRoute({ type: PageType.TRACK })}
                            >
                                Active Track
                            </button>
                        )}
                    </div>
                </div>
                <div>
                    {editHistory.length > 0 && (
                        <button
                            className={cn(styles.button, styles.item, styles.active)}
                            onClick={handleHistoryClick}
                        >
                            Edit History
                        </button>
                    )}
                    <button className={cn(styles.button, styles.item, styles.active)}>
                        Files
                    </button>
                </div>
            </nav>
            {activeHistoryModal && (
                <>
                    <div className={styles.shadow} />
                    <div className={styles.modal}>
                        <div className={styles.top}>
                            <h2 className={styles.header}>
                                Edit History
                            </h2>
                            <div className={styles.close} onClick={handleHistoryClick}>
                                +
                            </div>
                        </div>
                        <div className={styles.edits}>
                            {editHistory.map(({ id, type, operation }) => (
                                <p
                                    key={`${type}_${id}_${operation}`}
                                    className={styles.edit}
                                >
                                    &gt; {type} {operation} {id}
                                </p>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
