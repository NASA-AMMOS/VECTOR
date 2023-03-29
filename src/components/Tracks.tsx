import { useMemo } from 'react';
import { Vector2 } from 'three';

import { useData } from '@/stores/DataContext';
import { ResidualSortField, ResidualSortDirection } from '@/stores/ToolsContext';
import Track, { TrackState } from '@/components/Track';

import * as styles from '@/components/Tracks.css';

const baseVector = new Vector2();
const tempVector = new Vector2();

interface TracksProps {
    state: TrackState;
}

export default function Tracks({ state }: TracksProps) {
    const { tracks, imageTracks, activeImage } = useData();

    const activeTracks = useMemo<number[]>(() => {
        if (Object.keys(imageTracks).length === 0 || !activeImage) {
            return [];
        }

        const imageTrack = imageTracks[activeImage];
        const trackIds = [...new Set(imageTrack.map((track) => track.id))];

        trackIds.sort((idA, idB) => {
            const trackA = tracks.find((track) => track.id === idA);
            const trackB = tracks.find((track) => track.id === idB);

            if (trackA === undefined || trackB === undefined) {
                throw new Error('Failed to sort tracks');
            }

            const trackAPoints = trackA.points;
            const trackBPoints = trackB.points;

            // TODO: This is a similar calculation to what we do in GlobalImageView, we can cache this...
            if (state.residualSort.field === ResidualSortField.INITIAL) {
                const trackAInitialResiduals = [];
                for (const point of trackAPoints) {
                    const distance = baseVector.distanceTo(
                        tempVector.set(point.initialResidual[0], point.initialResidual[1]),
                    );
                    trackAInitialResiduals.push(Number(distance.toFixed(1)));
                }

                const trackBInitialResiduals = [];
                for (const point of trackBPoints) {
                    const distance = baseVector.distanceTo(
                        tempVector.set(point.initialResidual[0], point.initialResidual[1]),
                    );
                    trackBInitialResiduals.push(Number(distance.toFixed(1)));
                }

                const maxResidualA = Math.max(...trackAInitialResiduals);
                const maxResidualB = Math.max(...trackBInitialResiduals);

                if (
                    (state.residualSort.direction === ResidualSortDirection.INCREASING &&
                        maxResidualA < maxResidualB) ||
                    (state.residualSort.direction === ResidualSortDirection.DECREASING && maxResidualA > maxResidualB)
                ) {
                    return -1;
                }
                return 1;
            } else if (state.residualSort.field === ResidualSortField.FINAL) {
                const trackAFinalResiduals = [];
                for (const point of trackAPoints) {
                    const distance = baseVector.distanceTo(
                        tempVector.set(point.finalResidual[0], point.finalResidual[1]),
                    );
                    trackAFinalResiduals.push(Number(distance.toFixed(1)));
                }

                const trackBFinalResiduals = [];
                for (const point of trackBPoints) {
                    const distance = baseVector.distanceTo(
                        tempVector.set(point.finalResidual[0], point.finalResidual[1]),
                    );
                    trackBFinalResiduals.push(Number(distance.toFixed(1)));
                }

                const maxResidualA = Math.max(...trackAFinalResiduals);
                const maxResidualB = Math.max(...trackBFinalResiduals);

                if (
                    (state.residualSort.direction === ResidualSortDirection.INCREASING &&
                        maxResidualA < maxResidualB) ||
                    (state.residualSort.direction === ResidualSortDirection.DECREASING && maxResidualA > maxResidualB)
                ) {
                    return -1;
                }
                return 1;
            }

            return 0;
        });

        return trackIds;
    }, [state, imageTracks, activeImage]);

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>Tracks</h2>
            {activeTracks.map((trackId) => (
                <Track key={trackId} state={state} activeImage={activeImage} activeTrack={trackId} isGrouped />
            ))}
        </div>
    );
}
