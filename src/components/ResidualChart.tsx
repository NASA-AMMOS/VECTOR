import { useMemo, useCallback } from 'react';
import { Vector2 } from 'three';
// @ts-ignore: https://github.com/observablehq/plot/issues/401
import * as Plot from '@observablehq/plot';

import { Track, useData } from '@/stores/DataContext';
import { Pixel, Polar } from '@/utils/helpers';

import { vars } from '@/utils/theme.css';
import * as styles from '@/components/ResidualChart.css';

interface Residual {
    distance: number;
    angle: number;
    isInitial: boolean;
}

interface ResidualChartState {
    isInitial: boolean;
    isFinal: boolean;
    isRelative?: boolean;
    residualMin?: number | null;
    residualMax?: number | null;
    residualAngleMin?: number | null;
    residualAngleMax?: number | null;
}

interface ResidualChartProps {
    state: ResidualChartState;
    activeImage?: string;
    activeTrack?: number;
    isEdited?: boolean;
}

export default function ResidualChart({ state, activeImage, activeTrack, isEdited }: ResidualChartProps) {
    const { tracks, imageTracks, residualBounds, editedTracks } = useData();

    const activeTracks = useMemo<Track[]>(() => {
        let newTracks: Track[] = [];

        if (!activeImage && !activeTrack) {
            newTracks = tracks;
        } else if (activeImage && !activeTrack) {
            newTracks = imageTracks[activeImage];
        } else if (activeTrack) {
            newTracks = tracks.filter((t) => t.trackId === Number(activeTrack));
        } else {
            return [];
        }

        if (isEdited) {
            return newTracks;
        }

        return newTracks.filter((track) => !editedTracks.includes(track.trackId));
    }, [tracks, imageTracks, editedTracks, activeImage]);

    const plot = useCallback(
        (element: HTMLDivElement) => {
            if (activeTracks.length > 0 && element) {
                let initialResiduals = [];
                let finalResiduals = [];

                for (const track of activeTracks) {
                    for (const point of track.points) {
                        initialResiduals.push({
                            distance: point.initialResidualLength,
                            angle: Polar(point.initialResidual).angle,
                            isInitial: true,
                        });
                        finalResiduals.push({
                            distance: point.finalResidualLength,
                            angle: Polar(point.finalResidual).angle,
                            isInitial: false,
                        });
                    }
                }

                // Calculate axes bounds before filtering.
                let maxResidual;
                if (state.isRelative) {
                    maxResidual = Math.max(
                        ...[...initialResiduals.map((r) => r.distance), ...finalResiduals.map((r) => r.distance)],
                    );
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
                        fontSize: Pixel(1),
                        backgroundColor: 'transparent',
                    },
                    x: {
                        label: 'Pixels (px)',
                        labelOffset: Pixel(3),
                        ticks: 5,
                        domain: [0, maxResidual],
                        nice: true,
                    },
                    y: {
                        label: 'Count',
                        ticks: 5,
                        nice: true,
                    },
                    marks: [
                        Plot.rectY(
                            residuals,
                            Plot.binX(
                                {
                                    y: 'count',
                                },
                                {
                                    x: 'distance',
                                    fill: vars.color.initial,
                                    domain: [0, maxResidual],
                                    thresholds: 15,
                                    filter: (d: Residual) => d.isInitial,
                                },
                            ),
                        ),
                        Plot.rectY(
                            residuals,
                            Plot.binX(
                                {
                                    y: 'count',
                                },
                                {
                                    x: 'distance',
                                    fill: vars.color.final,
                                    domain: [0, maxResidual],
                                    thresholds: 15,
                                    filter: (d: Residual) => !d.isInitial,
                                },
                            ),
                        ),
                        Plot.ruleX([0]),
                        Plot.ruleY([0]),
                        Plot.text(residuals, {
                            x: 'distance',
                            y: 'count',
                            text: (d: Residual) => d.distance,
                        }),
                    ],
                });

                element.replaceChildren(svg);
            }
        },
        [state, activeTracks],
    );

    return <div ref={plot} className={styles.container}></div>;
}
