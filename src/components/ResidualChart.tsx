import { useMemo, useCallback } from 'react';
import { Vector2 } from 'three';
// @ts-ignore: https://github.com/observablehq/plot/issues/401
import * as Plot from '@observablehq/plot';
import { Tiepoint, useData } from '@/DataContext';
import { vars } from '@/utils/theme.css';
import { Pixel, Polar } from '@/utils/helpers';
import * as styles from '@/components/ResidualChart.css';

const baseVector = new Vector2();

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

                initialResiduals.push({ distance: initialDistance, angle: initialAngle });
                finalResiduals.push({ distance: finalDistance, angle: finalAngle });
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

            initialResiduals = initialResiduals.map((r) => r.distance);
            finalResiduals = finalResiduals.map((r) => r.distance);

            const residuals = [...initialResiduals, ...finalResiduals];
            let maxResidual;
            if (state.isRelative) {
                maxResidual = Math.max(...residuals);
            } else {
                maxResidual = residualBounds[0][1];
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
                    Plot.rectY(initialResiduals, Plot.binX(
                        { y: 'count' },
                        { fill: state.isInitial ? vars.color.initial : 'transparent', thresholds: 15 }
                    )),
                    Plot.rectY(finalResiduals, Plot.binX(
                        { y: 'count' },
                        { fill: state.isFinal ? vars.color.final : 'transparent', thresholds: 15 }
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
