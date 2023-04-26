import { useEffect, useState } from 'react';

import { ResidualType, useData } from '@/stores/DataContext';
import { useFilters } from '@/stores/FiltersContext';

import RadialChart, { RadialChartPoint } from '@/charts/radial';
import HistogramChart, { HistogramChartPoint } from '@/charts/histogram';

import CameraViewport from '@/components/CameraViewport';

import * as styles from '@/routes/scene.css';

export default function Scene() {
    const { points } = useData();
    const { filterState, guardInitialPoint, guardFinalPoint, roundToPrecision } = useFilters();

    const [residualAngles, setResidualAngles] = useState<RadialChartPoint[]>([]);
    const [residualLengths, setResidualLengths] = useState<HistogramChartPoint[][]>([]);

    useEffect(() => {
        const newAngles: RadialChartPoint[] = [];
        const newLengths: HistogramChartPoint[][] = [[], []];

        for (const point of points) {
            if (guardInitialPoint(point)) {
                const initialResidualLength = roundToPrecision(point.initialResidualLength);

                newLengths[0].push({ x: initialResidualLength, type: ResidualType.INITIAL });
                newAngles.push({
                    radius: initialResidualLength,
                    angle: roundToPrecision(point.initialResidualAngle),
                    type: ResidualType.INITIAL,
                });
            }

            if (guardFinalPoint(point)) {
                const finalResidualLength = roundToPrecision(point.finalResidualLength);

                newLengths[1].push({ x: finalResidualLength, type: ResidualType.FINAL });
                newAngles.push({
                    radius: finalResidualLength,
                    angle: roundToPrecision(point.finalResidualAngle),
                    type: ResidualType.FINAL,
                });
            }
        }

        setResidualAngles(newAngles);
        setResidualLengths(newLengths.filter((v) => v.length > 0));
    }, [points, filterState]);

    return (
        <section className={styles.container}>
            <section className={styles.canvas}>
                <CameraViewport />
            </section>
            <section className={styles.charts}>
                <div className={styles.chart}>
                    <h2 className={styles.header}>Residual Length vs. Pixels</h2>
                    <HistogramChart data={residualLengths} />
                </div>
                <div className={styles.chart}>
                    <h2 className={styles.header}>Residual Angle vs. Pixels</h2>
                    <RadialChart data={residualAngles} maxRadius={null} />
                </div>
            </section>
        </section>
    );
}
