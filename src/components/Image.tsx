import { useState, useMemo, useEffect } from 'react';
import { Vector2 } from 'three';
import { useData } from '@/DataContext';
import * as styles from '@/components/Image.css';

function Image() {
    const { activeImage, tiepoints } = useData();

    const [tracks, setTracks] = useState({});

    const activeTiepoints = useMemo(() => tiepoints[activeImage], [activeImage, tiepoints]);

    const trackMap = useMemo(() => activeTiepoints.reduce((obj, tiepoint) => {
        obj[tiepoint.trackId] = obj[tiepoint.trackId] ? [...obj[tiepoint.trackId], tiepoint] : [tiepoint];
        return obj;
    }, {}), [activeTiepoints]);

    const baseVector = new Vector2();

    useEffect(() => {
        const newTracks = {};

        for (const trackId of Object.keys(trackMap)) {
            const newTrack = [];
            let maxResidual = 0;
            
            for (const tiepoint of trackMap[trackId]) {
                const initialResidual = new Vector2(...tiepoint.initialResidual);
                const finalResidual = new Vector2(...tiepoint.finalResidual);

                const initialResidualDistance = baseVector.clone().distanceTo(initialResidual);
                const finalResidualDistance = baseVector.clone().distanceTo(finalResidual);

                maxResidual = Math.max(maxResidual, initialResidualDistance, finalResidualDistance);

                newTrack.push({ initialResidual: initialResidualDistance, finalResidual: finalResidualDistance });
            }
            
            newTracks[trackId] = {
                maxResidual,
                tiepoints: newTrack,
            };
        }

        setTracks(newTracks);
    }, [trackMap]);

    return (
        <section className={styles.container}>
            <div className={styles.tracks}>
                <h2 className={styles.header}>
                    Tracks
                </h2>
                {Object.keys(tracks).map((trackId) => (
                    <div key={trackId} className={styles.track}>
                        {tracks[trackId].tiepoints.map((tiepoint, index) => (
                            <div key={index} className={styles.tiepoint}>
                                <span
                                    key={tiepoint.initialResidual}
                                    className={styles.residual}
                                    style={{ opacity: tiepoint.initialResidual / tracks[trackId].maxResidual }}
                                ></span>
                                <span
                                    key={tiepoint.finalResidual}
                                    className={styles.residual}
                                    style={{ opacity: tiepoint.finalResidual / tracks[trackId].maxResidual }}
                                ></span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Image;
