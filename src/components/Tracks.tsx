import { useState, useMemo, useEffect, forwardRef } from 'react';
import cn from 'classnames';
import { Canvas } from '@react-three/fiber';
import { View, useTexture } from '@react-three/drei';
import { useData } from '@/DataContext';
import SlopeChart from '@/components/SlopeChart';
import TiepointImage from '@/components/TiepointImage';
import * as styles from '@/components/Tracks.css';

function TrackImage({ activeImage, activeTiepoint }) {
    const { getImageURL } = useData();

    const imageTex = useTexture(getImageURL(activeTiepoint.leftId === activeImage ? activeTiepoint.leftId : activeTiepoint.rightId));

    return (
        <mesh>
            <planeGeometry args={[imageTex.image.width, imageTex.image.height]} />
            <meshBasicMaterial map={imageTex} />
        </mesh>
    );
}

export function Track({ activeImage, activeTrack, views, isGrouped }) {
    const { tiepoints, setActiveTrack } = useData();

    const activeTiepoints = useMemo(() => {
        return Object.values(tiepoints).flat().filter((tiepoint, index, self) => {
            // Remove duplicate tiepoints that exist from image pairs.
            return index === self.findIndex((t) => t.index === tiepoint.index);
        }).filter((t) => t.trackId === Number(activeTrack));
    }, [tiepoints, activeImage, activeTrack]);

    function handleClick() {
        setActiveTrack(Number(activeTrack));
    }

    function updateViews(element, tiepoint) {
        if (element) {
            views.current.push({
                ref: { current: element },
                scene: (
                    <TrackImage activeImage={activeImage} activeTiepoint={tiepoint} />
                ),
            });
        }
    }

    return (
        <div
            key={activeTrack}
            className={cn(styles.track, { [styles.trackSpacing]: isGrouped, [styles.trackWidth]: !isGrouped })}
            onClick={handleClick}
        >
            {isGrouped && (
                <>
                    <h3 className={styles.subheader}>
                        ID: {activeTrack}
                    </h3>
                    <div className={styles.slope}>
                        <SlopeChart
                            activeImage={activeImage}
                            activeTrack={activeTrack}
                            isSmall
                        />
                    </div>
                </>
            )}
            <div className={styles.tiepoints}>
                {activeTiepoints.map((tiepoint, index) => (
                    <div
                        ref={(element) => updateViews(element, tiepoint)}
                        key={index}
                        className={styles.tiepoint}
                    />
                ))}
            </div>
        </div>
    )
}

const Tracks = forwardRef(({ activeTracks, views }, ref) => {
    const { activeImage } = useData();

    return (
        <div ref={ref} className={styles.container}>
            <h2 className={styles.header}>
                Tracks
            </h2>
            {activeTracks.map((trackId) => (
                <Track
                    key={trackId}
                    activeImage={activeImage}
                    activeTrack={trackId}
                    views={views}
                    isGrouped
                />
            ))}
        </div>
    );
});

export default Tracks;
