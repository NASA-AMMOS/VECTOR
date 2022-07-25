import { useRef, useMemo, useEffect } from 'react';
import { Vector2 } from 'three';
import * as Plot from '@observablehq/plot';
import { useData } from '@/DataContext';
import { vars } from '@/utils/theme.css';
import * as styles from '@/components/SlopeChart.css';

function SlopeChart({ activeImage, activeTrack }) {
    const { tiepoints } = useData();

    const plot = useRef(null);

    const activeTiepoints = useMemo(() => tiepoints[activeImage], [activeImage, tiepoints]);

    const baseVector = new Vector2();

    useEffect(() => {
        const initialResiduals = activeTiepoints.map((tiepoint) => {
            const initialResidual = new Vector2(...tiepoint.initialResidual);
            const initialDistance = Math.trunc(baseVector.clone().distanceTo(initialResidual));

            const finalResidual = new Vector2(...tiepoint.finalResidual);
            const finalDistance = Math.trunc(baseVector.clone().distanceTo(finalResidual));

            return {
                group: 'Initial',
                residual: initialDistance,
                tiepoint: tiepoint.index,
                decreased: finalDistance <= initialDistance,
            };
        });

        const finalResiduals = activeTiepoints.map((tiepoint) => {
            const finalResidual = new Vector2(...tiepoint.finalResidual);
            return {
                group: 'Final',
                residual: Math.trunc(baseVector.clone().distanceTo(finalResidual)),
                tiepoint: tiepoint.index,
            };
        });

        const residuals = [...initialResiduals, ...finalResiduals];

        const svg = Plot.plot({
            style: {
                height: '100%',
                background: vars.color.backgroundBlue,
            },
            x: {
                type: 'point',
                axis: 'top',
                label: null,
                domain: ['Initial', 'Final'],
            },
            y: {
                axis: null,
            },
            marks: [
                Plot.line(residuals, {
                    x: 'group',
                    y: 'residual',
                    z: 'tiepoint',
                    stroke: (d) => d.decreased ? vars.color.lightBlue : vars.color.yellow,
                    strokeWidth: 3,
                    opacity: 0.3,
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
                Plot.ruleX(['Initial'], { stroke: 'black', strokeWidth: 3 }),
                Plot.ruleX(['Final'], { stroke: 'black', strokeWidth: 3 }),
            ],
        });
        plot.current.replaceChildren(svg);
    }, [activeTiepoints]);

    return (
        <div ref={plot} className={styles.container}></div>
    );
}

export default SlopeChart;
