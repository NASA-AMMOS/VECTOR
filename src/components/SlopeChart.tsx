import { useMemo, useCallback } from 'react';
// @ts-ignore: https://github.com/observablehq/plot/issues/401
import * as Plot from '@observablehq/plot';

import { Track, useData } from '@/stores/DataContext';
import { Pixel } from '@/utils/helpers';

import { vars } from '@/utils/theme.css';
import * as styles from '@/components/SlopeChart.css';

interface SlopeChartState {
    isRelative: boolean;
    residualMin: number | null;
    residualMax: number | null;
}

interface SlopeChartProps {
    state: SlopeChartState;
    activeImage?: string;
    activeTrack?: string;
    isSmall?: boolean;
}

interface Residual {
    group: string;
    residual: number;
    tiepoint: number;
    decreased: boolean;
}

export default function SlopeChart({ state, activeImage, activeTrack, isSmall }: SlopeChartProps) {
    const { tracks, imageTracks, residualBounds } = useData();

    const activeTracks = useMemo<Track[]>(() => {
        let newTracks: Track[] = [];

        if (activeImage && !activeTrack) {
            newTracks = imageTracks[activeImage];
        } else if (activeTrack) {
            newTracks = tracks.filter((t) => t.id === activeTrack);
        } else {
            return [];
        }

        return newTracks;
    }, [tracks, imageTracks, activeImage]);

    const plot = useCallback(
        (element: HTMLDivElement) => {
            if (activeTracks.length > 0 && element) {
                let initialResiduals = [];
                let finalResiduals = [];

                for (const track of activeTracks) {
                    for (const point of track.points) {
                        initialResiduals.push({
                            group: 'Initial',
                            residual: point.initialResidualLength,
                            decreased: point.finalResidualLength <= point.initialResidualLength,
                            // Note: Need unique ID per pixel for plot to work
                            tiepoint: point.index,
                        });

                        finalResiduals.push({
                            group: 'Final',
                            residual: point.finalResidualLength,
                            tiepoint: point.index,
                        });
                    }
                }

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
                        fontSize: Pixel(1.8),
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
                            stroke: (d: Residual) => (d.decreased ? vars.color.decrease : vars.color.increase),
                            strokeWidth: 5,
                            strokeOpacity: (d: Residual) => (d.decreased ? 0.3 : 1),
                        }),
                        Plot.ruleX(['Initial'], { stroke: vars.color.initial, strokeWidth: 5 }),
                        Plot.ruleX(['Final'], { stroke: vars.color.final, strokeWidth: 5 }),
                    ],
                });

                element.replaceChildren(svg);
            }
        },
        [state, activeTracks],
    );

    return <div ref={plot} className={styles.container}></div>;
}
