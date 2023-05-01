import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import cn from 'classnames';

import { ResidualType, Track as ITrack, useData } from '@/stores/DataContext';
import { AxesType, ResidualSortDirection, ResidualSortField, useFilters } from '@/stores/FiltersContext';

import RadialChart, { RadialChartPoint } from '@/charts/radial';
import HistogramChart, { HistogramChartPoint } from '@/charts/histogram';

import TiepointImage from '@/components/TiepointImage';
import Track from '@/components/Track';

import { H2 } from '@/styles/headers.css';
import * as styles from '@/routes/image.css';

export default function Image() {
    const { cameraId } = useParams();

    const { cameraTrackMap, cameraPointMap, maxResidualLength } = useData();
    const { filterState, guardInitialPoint, guardFinalPoint, roundToPrecision } = useFilters();

    if (!cameraId || !(cameraId in cameraTrackMap)) {
        return null;
    }

    const [residualAngles, setResidualAngles] = useState<RadialChartPoint[]>([]);
    const [residualCounts, setResidualCounts] = useState<HistogramChartPoint[][]>([]);

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

    useEffect(() => {
        const newAngles: RadialChartPoint[] = [];
        const newCounts: HistogramChartPoint[][] = [[], []];

        for (const point of cameraPointMap[cameraId]) {
            if (guardInitialPoint(point)) {
                const initialResidualLength = roundToPrecision(point.initialResidualLength);

                newAngles.push({
                    radius: initialResidualLength,
                    angle: roundToPrecision(point.initialResidualAngle),
                    type: ResidualType.INITIAL,
                });
                newCounts[0].push({ x: initialResidualLength, type: ResidualType.INITIAL });
            }

            if (guardFinalPoint(point)) {
                const finalResidualLength = roundToPrecision(point.finalResidualLength);

                newAngles.push({
                    radius: finalResidualLength,
                    angle: roundToPrecision(point.finalResidualAngle),
                    type: ResidualType.FINAL,
                });
                newCounts[1].push({ x: finalResidualLength, type: ResidualType.FINAL });
            }
        }

        setResidualAngles(newAngles);
        setResidualCounts(newCounts.filter((v) => v.length > 0));
    }, [cameraId, cameraPointMap, filterState]);

    return (
        <section className={styles.container}>
            <div className={styles.column}>
                <TiepointImage />
                <div className={styles.block}>
                    <div className={styles.item}>
                        <h2 className={cn(H2, styles.header)}>Residual Angle</h2>
                        <RadialChart
                            data={residualAngles}
                            maxRadius={filterState.axesType === AxesType.ABSOLUTE ? maxResidualLength : null}
                        />
                    </div>
                    <div className={styles.item}>
                        <h2 className={cn(H2, styles.header)}>Residual Length vs. Pixel</h2>
                        <HistogramChart data={residualCounts} />
                    </div>
                </div>
            </div>
            <div className={styles.tracks}>
                <h2 className={cn(H2, styles.header)}>Tracks</h2>
                {cameraTracks.map((track) => (
                    <Track key={track.id} trackId={track.id} isGrouped />
                ))}
            </div>
        </section>
    );
}
