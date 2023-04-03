import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import cn from 'classnames';

import { Track as ITrack, useData } from '@/stores/DataContext';
import { ResidualSortField, ResidualSortDirection, useFilters } from '@/stores/FiltersContext';

import Track from '@/components/Track';

import { H2 } from '@/styles/headers.css';
import * as styles from '@/components/Tracks.css';

export default function Tracks() {
    const { cameraId } = useParams();

    const { cameraTrackMap } = useData();
    const { filterState } = useFilters();

    if (!cameraId || !(cameraId in cameraTrackMap)) {
        return null;
    }

    const cameraTracks = useMemo<ITrack[]>(() => {
        const selectedTracks = cameraTrackMap[cameraId];

        selectedTracks.sort((a, b) => {
            let aMaxResidualLength = 0,
                bMaxResidualLength = 0;

            if (filterState.residualSortField === ResidualSortField.INITIAL) {
                const aResidualLength = a.points.map((p) => p.initialResidualLength);
                const bResidualLength = b.points.map((p) => p.initialResidualLength);

                aMaxResidualLength = Math.max.apply(Math, aResidualLength);
                bMaxResidualLength = Math.max.apply(Math, bResidualLength);
            } else if (filterState.residualSortField === ResidualSortField.FINAL) {
                const aResidualLength = a.points.map((p) => p.finalResidualLength);
                const bResidualLength = b.points.map((p) => p.finalResidualLength);

                aMaxResidualLength = Math.max.apply(Math, aResidualLength);
                bMaxResidualLength = Math.max.apply(Math, bResidualLength);
            }

            if (aMaxResidualLength === bMaxResidualLength) {
                return 0;
            } else if (
                (filterState.residualSortDirection === ResidualSortDirection.INCREASING &&
                    aMaxResidualLength < bMaxResidualLength) ||
                (filterState.residualSortDirection === ResidualSortDirection.DECREASING &&
                    aMaxResidualLength > bMaxResidualLength)
            ) {
                return -1;
            }
            return 1;
        });

        return selectedTracks;
    }, [cameraId, cameraTrackMap, filterState]);

    return (
        <div className={styles.container}>
            <h2 className={cn(H2, styles.header)}>Tracks</h2>
            {cameraTracks.map((track) => (
                <Track key={track.id} trackId={track.id} isGrouped />
            ))}
        </div>
    );
}
