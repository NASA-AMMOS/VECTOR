import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import cn from 'classnames';

import { ResidualType, useData } from '@/stores/DataContext';
import { AxesType, useFilters } from '@/stores/FiltersContext';

import RadialChart, { RadialChartPoint } from '@/charts/radial';
import HistogramChart, { HistogramChartPoint } from '@/charts/histogram';
import SlopeChart, { SlopeChartPoint } from '@/charts/slope';

import Track from '@/components/Track';
import CameraViewport from '@/components/CameraViewport';

import { H2 } from '@/styles/headers.css';
import * as styles from '@/routes/track.css';

export default function TrackView() {
    const { trackId } = useParams();

    const { tracks, maxResidualLength } = useData();
    const { filterState, guardInitialPoint, guardFinalPoint } = useFilters();

    const track = useMemo(() => tracks.find((t) => t.id === trackId), [trackId, tracks]);

    if (!trackId || !track) {
        return null;
    }

    const [residualAngles, setResidualAngles] = useState<RadialChartPoint[]>([]);
    const [residualCounts, setResidualCounts] = useState<HistogramChartPoint[][]>([]);
    const [residualPoints, setResidualPoints] = useState<SlopeChartPoint[]>([]);

    useEffect(() => {
        const newAngles: RadialChartPoint[] = [];
        const newCounts: HistogramChartPoint[][] = [[], []];
        const newPoints: SlopeChartPoint[] = [];

        for (const point of track.points) {
            if (guardInitialPoint(point)) {
                newAngles.push({
                    radius: point.initialResidualLength,
                    angle: point.initialResidualAngle,
                    type: ResidualType.INITIAL,
                });
                newCounts[0].push({ x: point.initialResidualLength, type: ResidualType.INITIAL });
            }

            if (guardFinalPoint(point)) {
                newAngles.push({
                    radius: point.finalResidualLength,
                    angle: point.finalResidualAngle,
                    type: ResidualType.FINAL,
                });
                newCounts[1].push({ x: point.finalResidualLength, type: ResidualType.FINAL });
            }

            newPoints.push(
                { type: ResidualType.INITIAL, index: point.index, value: point.initialResidualLength },
                { type: ResidualType.FINAL, index: point.index, value: point.finalResidualLength },
            );
        }

        setResidualAngles(newAngles);
        setResidualCounts(newCounts.filter((v) => v.length > 0));
        setResidualPoints(newPoints);
    }, [track, filterState]);

    return (
        <section className={styles.container}>
            <div className={styles.stage}>
                <h3 className={cn(H2, styles.trackTitle)}>Track ID: {trackId}</h3>
                <div className={styles.track}>
                    <Track trackId={trackId} />
                </div>
                <div className={styles.canvas}>
                    <CameraViewport />
                </div>
            </div>
            <div className={styles.charts}>
                <div className={styles.chart}>
                    <h2 className={cn(H2, styles.chartTitle)}>Residual Angle</h2>
                    <RadialChart
                        data={residualAngles}
                        maxRadius={filterState.axesType === AxesType.ABSOLUTE ? maxResidualLength : null}
                    />
                </div>
                <div className={styles.chart}>
                    <h2 className={cn(H2, styles.chartTitle)}>Residual Length vs. Pixels</h2>
                    <HistogramChart data={residualCounts} />
                </div>
                <div className={styles.chart}>
                    <h2 className={cn(H2, styles.chartTitle)}>Residual Change</h2>
                    <SlopeChart data={residualPoints} />
                </div>
            </div>
        </section>
    );
}
