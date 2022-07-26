import { useState, useMemo, useEffect } from 'react';
import { Vector2 } from 'three';
import cn from 'classnames';
import { useData } from '@/DataContext';
import SlopeChart from '@/components/SlopeChart';
import TiepointImage from '@/components/TiepointImage';
import * as styles from '@/components/Tracks.css';

export function Track({ activeImage, activeTrack }) {
    const { tracks, activeTrack: contextTrack, setActiveTrack } = useData();

    function handleClick() {
        setActiveTrack(Number(Number(activeTrack)));
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
                {tracks[activeTrack].tiepoints.map((tiepoint, index) => (
                    <div key={index} className={styles.tiepoint}>
                        <span
                            key={tiepoint.initialResidual}
                            className={styles.residual}
                            style={{ opacity: tiepoint.initialResidual / tracks[activeTrack].maxResidual }}
                        ></span>
                        <span
                            key={tiepoint.finalResidual}
                            className={styles.residual}
                            style={{ opacity: tiepoint.finalResidual / tracks[activeTrack].maxResidual }}
                        ></span>
                    </div>
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
