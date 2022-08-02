import { useRef, useMemo, useEffect } from 'react';
import { Vector2 } from 'three';
import * as Plot from '@observablehq/plot';
import { useData } from '@/DataContext';
import { vars } from '@/utils/theme.css';
import * as styles from '@/components/SlopeChart.css';

function SlopeChart({ activeImage, activeTrack, isSmall }) {
    const { tiepoints } = useData();

    const plot = useRef(null);

    const activeTiepoints = useMemo(() => {
        if (!activeTrack) {
            return tiepoints[activeImage];
        }
        return Object.values(tiepoints).flat().filter((t) => t.trackId === Number(activeTrack));
    }, [activeImage, tiepoints]);

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
                backgroundColor: 'transparent',
            },
            x: {
                type: 'point',
                axis: isSmall ? null : 'top',
                label: null,
                domain: ['Initial', 'Final'],
                clamp: true,
                inset: -300,
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
                    stroke: (d) => d.decreased ? vars.color.decrease : vars.color.increase,
                    strokeWidth: 3,
                }),
                Plot.text(residuals, Plot.selectFirst({
                    x: 'group',
                    y: 'residual',
                    z: 'tiepoint',
                    text: '',
                })),
                Plot.text(residuals, Plot.selectLast({
                    x: 'group',
                    y: 'residual',
                    z: 'tiepoint',
                    text: '',
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
