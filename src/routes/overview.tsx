import { useEffect, useState } from 'react';
import cn from 'classnames';

import { ResidualType, useData } from '@/stores/DataContext';
import { useFilters } from '@/stores/FiltersContext';

import RadialChart, { RadialChartPoint } from '@/charts/radial';
import HistogramChart, { HistogramChartPoint } from '@/charts/histogram';

import { H2 } from '@/styles/headers.css';
import * as styles from '@/routes/overview.css';

export default function Overview() {
    const { points } = useData();
    const { filterState, guardInitialPoint, guardFinalPoint } = useFilters();

    const [residualAngles, setResidualAngles] = useState<RadialChartPoint[]>([]);
    const [residualLengths, setResidualLengths] = useState<HistogramChartPoint[][]>([]);

    useEffect(() => {
        const newAngles: RadialChartPoint[] = [];
        const newLengths: HistogramChartPoint[][] = [[], []];

        for (const point of points) {
            if (guardInitialPoint(point)) {
                newLengths[0].push({ x: point.initialResidualLength, type: ResidualType.INITIAL });
                newAngles.push({
                    radius: point.initialResidualLength,
                    angle: Math.round(point.initialResidualAngle),
                    type: ResidualType.INITIAL,
                });
            }

            if (guardFinalPoint(point)) {
                newLengths[1].push({ x: point.finalResidualLength, type: ResidualType.FINAL });
                newAngles.push({
                    radius: point.finalResidualLength,
                    angle: Math.round(point.finalResidualAngle),
                    type: ResidualType.FINAL,
                });
            }
        }

        setResidualAngles(newAngles);
        setResidualLengths(newLengths.filter((v) => v.length > 0));
    }, [points, filterState]);

    return (
        <section className={styles.container}>
            <div className={styles.item}>
                <h2 className={cn(H2, styles.title)}>Residual Angle</h2>
                <RadialChart data={residualAngles} maxRadius={null} />
            </div>
            <div className={styles.item}>
                <h2 className={cn(H2, styles.title)}>Residual Length</h2>
                <HistogramChart data={residualLengths} />
            </div>
        </section>
    );
}
