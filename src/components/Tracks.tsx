import { useRef, useMemo } from 'react';
import cn from 'classnames';
import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';
import { useData } from '@/DataContext';
import SlopeChart from '@/components/SlopeChart';
import TiepointImage from '@/components/TiepointImage';
import * as styles from '@/components/Tracks.css';

export function Track({ activeImage, activeTrack, views }) {
    const { tiepoints, activeTrack: contextTrack, setActiveTrack } = useData();

    const activeTiepoints = useMemo(() => {
        if (!activeTrack) {
            return tiepoints[activeImage];
        }
        return Object.values(tiepoints).flat().filter((t) => t.trackId === Number(activeTrack));
    }, [activeImage, tiepoints]);

    function handleClick() {
        setActiveTrack(Number(activeTrack));
    }

    function updateViews(element) {
        if (element) {
            views.current.push({ current: element });
        }
    }

    return (
        <div
            key={activeTrack}
            className={cn(styles.track, { [styles.trackSpacing]: !contextTrack })}
            onClick={handleClick}
        >
            {!contextTrack && (
                <>
                    <h3 className={styles.subheader}>
                        ID: {activeTrack}
                    </h3>
                    <div className={styles.slope}>
                        <SlopeChart activeImage={activeImage} activeTrack={activeTrack} />
                    </div>
                </>
            )}
            <div className={styles.tiepoints}>
                {activeTiepoints.map((tiepoint, index) => (
                    <div
                        ref={updateViews}
                        key={index}
                        className={styles.tiepoint}
                    />
                ))}
            </div>
        </div>
    )
}

function Tracks({ views }) {
    const { activeImage, tiepoints, tracks, renderTarget } = useData();

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>
                Tracks
            </h2>
            {Object.keys(tracks).map((trackId) => (
                <Track
                    key={trackId}
                    activeImage={activeImage}
                    activeTrack={trackId}
                    views={views}
                />
            ))}
        </div>
    );
}

export default Tracks;
