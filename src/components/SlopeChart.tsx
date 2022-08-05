import { useMemo, useCallback } from 'react';
import { Vector2 } from 'three';
// @ts-ignore: https://github.com/observablehq/plot/issues/401
import * as Plot from '@observablehq/plot';
import { Tiepoint, useData } from '@/DataContext';
import { vars } from '@/utils/theme.css';
import * as styles from '@/components/SlopeChart.css';

const baseVector = new Vector2();

interface SlopeChartProps {
    activeImage?: string;
    activeTrack?: number;
    isSmall?: boolean;
};

interface Residual {
    group: string;
    residual: number;
    tiepoint: number;
    decreased: boolean;
};

export default function SlopeChart({ activeImage, activeTrack, isSmall }: SlopeChartProps) {
    const { tiepoints, imageTiepoints } = useData();

    const activeTiepoints = useMemo<Tiepoint[]>(() => {
        if (activeImage && !activeTrack) {
            return imageTiepoints[activeImage];
        } else if (activeTrack) {
            return tiepoints.filter((t) => t.trackId === Number(activeTrack));
        } else {
            return [];
        }
    }, [tiepoints, imageTiepoints, activeImage]);

    const plot = useCallback((element: HTMLDivElement) => {
        if (activeTiepoints.length > 0 && element) {
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
                        stroke: (d: Residual) => d.decreased ? vars.color.decrease : vars.color.increase,
                        strokeWidth: 3,
                        strokeOpacity: (d: Residual) => d.decreased ? 0.3 : 1,
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
                    Plot.ruleX(['Initial'], { stroke: vars.color.initial, strokeWidth: 3 }),
                    Plot.ruleX(['Final'], { stroke: vars.color.final, strokeWidth: 3 }),
                ],
            });

            element.replaceChildren(svg);
        }
    }, [activeTiepoints]);

    return (
        <div ref={plot} className={styles.container}></div>
    );
}
