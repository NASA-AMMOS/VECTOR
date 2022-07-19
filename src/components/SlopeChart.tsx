import { useRef, useMemo, useEffect } from 'react';
import { Vector2 } from 'three';
import * as Plot from '@observablehq/plot';
import { useData } from '@/DataContext';
import * as styles from '@/components/SlopeChart.css';

function SlopeChart({ activeImage }) {
    const { tiepoints } = useData();

    const container = useRef();

    const activeTiepoints = useMemo(() => tiepoints[activeImage], [activeImage, tiepoints]);

    const baseVector = new Vector2();

    useEffect(() => {
        const initialResiduals = activeTiepoints.map((tiepoint) => {
            const initialResidual = new Vector2(...tiepoint.initialResidual);
            return {
                group: 'Initial',
                residual: baseVector.clone().distanceTo(initialResidual),
                tiepoint: tiepoint.index,
            };
        });

        const finalResiduals = activeTiepoints.map((tiepoint) => {
            const finalResidual = new Vector2(...tiepoint.finalResidual);
            return {
                group: 'Final',
                residual: baseVector.clone().distanceTo(finalResidual),
                tiepoint: tiepoint.index,
            };
        });

        const residuals = [...initialResiduals, ...finalResiduals];

        setTimeout(() => {
            const plot = Plot.plot({
                height: container.current.offsetHeight,
                width: container.current.offsetWidth,
                x: {
                    type: 'point',
                    axis: 'top',
                    label: null,
                    reverse: true,
                },
                y: {
                    axis: null,
                    inset: 20,
                },
                marks: [
                    Plot.line(residuals, {
                        x: 'group',
                        y: 'residual',
                        z: 'tiepoint',
                        strokeWidth: 1,
                    }),
                    Plot.text(residuals, Plot.selectFirst({
                        x: 'group',
                        y: 'residual',
                        z: 'tiepoint',
                        dx: -5,
                        text: (d) => d.residual,
                        textAnchor: 'end',
                    })),
                    Plot.text(residuals, Plot.selectLast({
                        x: 'group',
                        y: 'residual',
                        z: 'tiepoint',
                        text: (d) => d.residual,
                        textAnchor: 'start',
                        dx: 5,
                    })),
                ],
            });

            container.current.replaceChildren(plot);
        }, 1000);
    }, [activeTiepoints]);

    return (
        <div ref={container} className={styles.container}></div>
    );
}

export default SlopeChart;
