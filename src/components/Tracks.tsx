import { useMemo } from 'react';
import cn from 'classnames';
import { useData } from '@/DataContext';
import SlopeChart from '@/components/SlopeChart';
import TiepointImage from '@/components/TiepointImage';
import * as styles from '@/components/Tracks.css';

export function Track({ activeImage, activeTrack }) {
    const { tiepoints, renderTarget, activeTrack: contextTrack, setActiveTrack } = useData();

    const activeTiepoints = useMemo(() => {
        const newTiepoints = tiepoints[activeImage];
        if (!activeTrack) {
            return newTiepoints;
        }
        return newTiepoints.filter((t) => t.trackId === Number(activeTrack));
    }, [activeImage, tiepoints]);

    function handleClick() {
        setActiveTrack(Number(activeTrack));
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
                {renderTarget && activeTiepoints.map((tiepoint, index) => (
                    <img
                        key={index}
                        className={styles.tiepoint}
                        // src={renderTarget}
                        alt={`Track ID: ${activeTrack}`}
                    />
                ))}
            </div>
        </div>
    )
}

function Tracks() {
    const { activeImage, tiepoints, tracks } = useData();

    return (
        <div className={styles.container}>
            <div>
                <h2 className={styles.header}>
                    Tracks
                </h2>
                {Object.keys(tracks).map((trackId) => (
                    <Track key={trackId} activeImage={activeImage} activeTrack={trackId} />
                ))}
            </div>
        </div>
    );
}

export default Tracks;
