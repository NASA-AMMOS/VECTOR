import { useMemo, useCallback } from 'react';
import { Vector2 } from 'three';
// @ts-ignore: https://github.com/observablehq/plot/issues/401
import * as Plot from '@observablehq/plot';
import { Tiepoint, useData } from '@/DataContext';
import { vars } from '@/utils/theme.css';
import * as styles from '@/components/SlopeChart.css';

const baseVector = new Vector2();

interface SlopeChartState {
    isRelative: boolean;
    residualMin: number;
    residualMax: number;
};

interface SlopeChartProps {
    state: SlopeChartState;
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

export default function SlopeChart({ state, activeImage, activeTrack, isSmall }: SlopeChartProps) {
    const { tiepoints, imageTiepoints, residualBounds } = useData();

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
            let initialResiduals = activeTiepoints.map((tiepoint) => {
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

            let finalResiduals = activeTiepoints.map((tiepoint) => {
                const finalResidual = new Vector2(...tiepoint.finalResidual);
                return {
                    group: 'Final',
                    residual: Math.trunc(baseVector.clone().distanceTo(finalResidual)),
                    tiepoint: tiepoint.index,
                };
            });

            if (state.residualMin) {
                initialResiduals = initialResiduals.filter((r) => r.residual >= state.residualMin!);
                finalResiduals = finalResiduals.filter((r) => r.residual >= state.residualMin!);
            }

            if (state.residualMax) {
                initialResiduals = initialResiduals.filter((r) => r.residual <= state.residualMax!);
                finalResiduals = finalResiduals.filter((r) => r.residual <= state.residualMax!);
            }

            const residuals = [...initialResiduals, ...finalResiduals];
            let maxResidual;
            if (state.isRelative) {
                maxResidual = Math.max(...residuals.map((r) => r.residual));
            } else {
                maxResidual = residualBounds[0][1];
            }

            if (residuals.length === 0) {
                element.classList.add(styles.empty);
                while (element.lastElementChild) {
                    element.removeChild(element.lastElementChild);
                }
                return;
            } else {
                element.classList.remove(styles.empty);
            }

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
                    domain: [0, maxResidual],
                    inset: 20,
                },
                marks: [
                    Plot.line(residuals, {
                        x: 'group',
                        y: 'residual',
                        z: 'tiepoint',
                        stroke: (d: Residual) => d.decreased ? vars.color.decrease : vars.color.increase,
                        strokeWidth: 10,
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
                    Plot.ruleX(['Initial'], { stroke: vars.color.initialHex, strokeWidth: 10 }),
                    Plot.ruleX(['Final'], { stroke: vars.color.finalHex, strokeWidth: 10 }),
                ],
            });

            element.replaceChildren(svg);
        }
    }, [state, activeTiepoints]);

    return (
        <div ref={plot} className={styles.container}></div>
    );
}
