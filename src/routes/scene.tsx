import { useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';

import { ResidualType, useData } from '@/stores/DataContext';
import { useFilters } from '@/stores/FiltersContext';

import LineChart, { LineChartPoint } from '@/charts/line';
import ScatterChart, { ScatterChartPoint } from '@/charts/scatter';

import CameraViewport from '@/components/CameraViewport';

import * as styles from '@/routes/scene.css';

export default function Scene() {
    const { points } = useData();
    const { filterState, guardInitialPoint, guardFinalPoint } = useFilters();

    const [residualCounts, setResidualCounts] = useState<LineChartPoint[]>([]);
    const [residualAngles, setResidualAngles] = useState<ScatterChartPoint[]>([]);

    const dispatch = useMemo(() => d3.dispatch('zoom'), []);
    const xDomain = useMemo<[number, number]>(
        () => [
            0,
            Math.max.apply(
                Math,
                residualCounts.map((v) => v.x),
            ),
        ],
        [residualCounts],
    );

    useEffect(() => {
        const newCounts: LineChartPoint[] = [];
        const newAngles: ScatterChartPoint[] = [];

        for (const point of points) {
            if (guardInitialPoint(point)) {
                const x = Math.round(point.initialResidualLength);

                const count = newCounts.find((v) => v.x === x && v.z === ResidualType.INITIAL);
                const angle = newAngles.find((v) => v.x === x && v.z === ResidualType.INITIAL);

                if (count) {
                    count.y += 1;
                } else {
                    newCounts.push({
                        x,
                        y: 1,
                        z: ResidualType.INITIAL,
                    });
                }

                if (!angle) {
                    newAngles.push({
                        x,
                        y: Math.round(point.initialResidualAngle),
                        z: ResidualType.INITIAL,
                    });
                }
            }

            if (guardFinalPoint(point)) {
                const x = Math.round(point.finalResidualLength);

                const count = newCounts.find((v) => v.x === x && v.z === ResidualType.FINAL);
                const angle = newAngles.find((v) => v.x === x && v.z === ResidualType.FINAL);

                if (count) {
                    count.y += 1;
                } else {
                    newCounts.push({
                        x,
                        y: 1,
                        z: ResidualType.FINAL,
                    });
                }

                if (!angle) {
                    newAngles.push({
                        x,
                        y: Math.round(point.finalResidualAngle),
                        z: ResidualType.FINAL,
                    });
                }
            }
        }

        setResidualCounts(newCounts);
        setResidualAngles(newAngles);
    }, [points, filterState]);

    return (
        <section className={styles.container}>
            <section className={styles.canvas}>
                <CameraViewport />
            </section>
            <section className={styles.charts}>
                <div className={styles.item}>
                    <h2 className={styles.header}>Residual Length vs. Pixels</h2>
                    <LineChart data={residualCounts} xDomain={xDomain} dispatch={dispatch} dispatchName="count" />
                </div>
                <div className={styles.item}>
                    <h2 className={styles.header}>Residual Angle vs. Pixels</h2>
                    <ScatterChart data={residualAngles} xDomain={xDomain} dispatch={dispatch} dispatchName="angle" />
                </div>
            </section>
        </section>
    );
}
