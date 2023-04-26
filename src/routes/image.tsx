import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import cn from 'classnames';

import { ResidualType, useData } from '@/stores/DataContext';
import { AxesType, useFilters } from '@/stores/FiltersContext';

import RadialChart, { RadialChartPoint } from '@/charts/radial';
import HistogramChart, { HistogramChartPoint } from '@/charts/histogram';

import Tracks from '@/components/Tracks';
import TiepointImage from '@/components/TiepointImage';

import { H2 } from '@/styles/headers.css';
import * as styles from '@/routes/image.css';

export default function Image() {
    const { cameraId } = useParams();
    if (!cameraId) return null;

    const { cameraPointMap, maxResidualLength } = useData();
    const { filterState, guardInitialPoint, guardFinalPoint, roundToPrecision } = useFilters();

    const [residualAngles, setResidualAngles] = useState<RadialChartPoint[]>([]);
    const [residualCounts, setResidualCounts] = useState<HistogramChartPoint[][]>([]);

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
            <Tracks />
        </section>
    );
}
