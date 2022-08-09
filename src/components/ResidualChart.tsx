import { useMemo, useCallback } from 'react';
import { Vector2 } from 'three';
// @ts-ignore: https://github.com/observablehq/plot/issues/401
import * as Plot from '@observablehq/plot';
import { Tiepoint, useData } from '@/DataContext';
import { vars } from '@/utils/theme.css';
import { Pixel, Polar } from '@/utils/helpers';
import * as styles from '@/components/ResidualChart.css';

const baseVector = new Vector2();

interface Residual {
    distance: number;
    angle: number;
    isInitial: boolean;
};

interface ResidualChartState {
    isInitial: boolean;
    isFinal: boolean;
    isRelative?: boolean;
    residualMin?: number;
    residualMax?: number;
    residualAngleMin?: number;
    residualAngleMax?: number;
};

interface ResidualChartProps {
    state: ResidualChartState;
    activeImage?: string;
    activeTrack?: number;
};

export default function ResidualChart({ state, activeImage, activeTrack }: ResidualChartProps) {
    const { tiepoints, imageTiepoints, residualBounds } = useData();

    const activeTiepoints = useMemo<Tiepoint[]>(() => {
        if (!activeImage && !activeTrack) {
            return tiepoints;
        } else if (activeImage && !activeTrack) {
            return imageTiepoints[activeImage];
        } else if (activeTrack) {
            return tiepoints.filter((t) => t.trackId === Number(activeTrack));
        } else {
            return [];
        }
    }, [tiepoints, imageTiepoints, activeImage]);

    const plot = useCallback((element: HTMLDivElement) => {
        if ((state.isInitial || state.isFinal) && activeTiepoints.length > 0 && element) {
            let initialResiduals = [];
            let finalResiduals = [];

            for (const tiepoint of activeTiepoints) {
                const initialResidual = new Vector2(...tiepoint.initialResidual);
                const finalResidual = new Vector2(...tiepoint.finalResidual);

                const initialDistance = Number(baseVector.distanceTo(initialResidual).toFixed(1));
                const finalDistance = Number(baseVector.distanceTo(finalResidual).toFixed(1));

                const initialAngle = Polar(tiepoint.initialResidual).angle;
                const finalAngle = Polar(tiepoint.finalResidual).angle;

                initialResiduals.push({ distance: initialDistance, angle: initialAngle, isInitial: true });
                finalResiduals.push({ distance: finalDistance, angle: finalAngle, isInitial: false });
            }

            // Calculate axes bounds before filtering.
            let maxResidual;
            if (state.isRelative) {
                maxResidual = Math.max(...[
                    ...initialResiduals.map((r) => r.distance),
                    ...finalResiduals.map((r) => r.distance)
                ]);
            } else {
                maxResidual = residualBounds[0][1];
            }

            if (state.residualMin) {
                initialResiduals = initialResiduals.filter((r) => r.distance >= state.residualMin!);
                finalResiduals = finalResiduals.filter((r) => r.distance >= state.residualMin!);
            }

            if (state.residualMax) {
                initialResiduals = initialResiduals.filter((r) => r.distance <= state.residualMax!);
                finalResiduals = finalResiduals.filter((r) => r.distance <= state.residualMax!);
            }

            if (state.residualAngleMin) {
                initialResiduals = initialResiduals.filter((r) => r.angle >= state.residualAngleMin!);
                finalResiduals = finalResiduals.filter((r) => r.angle >= state.residualAngleMin!);
            }

            if (state.residualAngleMax) {
                initialResiduals = initialResiduals.filter((r) => r.angle <= state.residualAngleMax!);
                finalResiduals = finalResiduals.filter((r) => r.angle <= state.residualAngleMax!);
            }

            const residuals = [];

            if (state.isInitial) {
                residuals.push(...initialResiduals);
            }

            if (state.isFinal) {
                residuals.push(...finalResiduals);   
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
                    fontSize: Pixel(1.5),
                    backgroundColor: 'transparent',
                },
                x: {
                    label: null,
                    ticks: 5,
                    domain: [0, maxResidual],
                    nice: true,
                },
                y: {
                    axis: null,
                },
                marks: [
                    Plot.rectY(residuals, Plot.binX(
                        {
                            y: 'count'
                        },
                        {
                            x: 'distance',
                            domain: [0, maxResidual],
                            fill: (d: Residual) => d.isInitial ? vars.color.initial : vars.color.final,
                            thresholds: 15,
                        },
                    )),
                    Plot.ruleY([0]),
                ],
            });

            element.replaceChildren(svg);
        }
    }, [state, activeTiepoints]);

    return (
        <div ref={plot} className={styles.container}></div>
    );
}
