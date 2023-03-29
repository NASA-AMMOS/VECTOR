import { useMemo, useCallback } from 'react';
import * as d3 from 'd3';

import { Track, useData } from '@/stores/DataContext';
import { Polar } from '@/utils/helpers';

import { vars } from '@/utils/theme.css';
import * as styles from '@/components/RadialChart.css';

interface RadialChartState {
    isInitial: boolean;
    isFinal: boolean;
    isRelative?: boolean;
    residualMin?: number | null;
    residualMax?: number | null;
    residualAngleMin?: number | null;
    residualAngleMax?: number | null;
}

interface RadialChartProps {
    state: RadialChartState;
    activeImage?: string;
    activeTrack?: string;
}

export default function RadialChart({ state, activeImage, activeTrack }: RadialChartProps) {
    const { tracks, imageTracks, residualBounds } = useData();

    const activeTracks = useMemo<Track[]>(() => {
        let newTracks: Track[] = [];

        if (!activeImage && !activeTrack) {
            newTracks = tracks;
        } else if (activeImage && !activeTrack) {
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
                let residuals = [];

                for (const track of activeTracks) {
                    for (const point of track.points) {
                        residuals.push(
                            {
                                ...Polar(point.initialResidual),
                                distance: point.initialResidualLength,
                                isInitial: true,
                            },
                            {
                                ...Polar(point.finalResidual),
                                distance: point.finalResidualLength,
                                isInitial: false,
                            },
                        );
                    }
                }

                const initialMin = residuals
                    .filter((r) => r.isInitial)
                    .reduce((prev, curr) => (prev.radius < curr.radius ? prev : curr));
                const initialMax = residuals
                    .filter((r) => r.isInitial)
                    .reduce((prev, curr) => (prev.radius > curr.radius ? prev : curr));

                const finalMin = residuals
                    .filter((r) => !r.isInitial)
                    .reduce((prev, curr) => (prev.radius < curr.radius ? prev : curr));
                const finalMax = residuals
                    .filter((r) => !r.isInitial)
                    .reduce((prev, curr) => (prev.radius > curr.radius ? prev : curr));

                let width;
                if (state.isRelative) {
                    width = Math.max(initialMax.radius, finalMax.radius);
                } else {
                    width = residualBounds[1][1];
                }
                width *= 2;

                const height = width;
                const padding = width * 0.1;
                const radius = width * 0.01;

                // Filter residuals after calculating circular bounds
                if (state.residualMin) {
                    residuals = residuals.filter((r) => r.distance >= state.residualMin!);
                }

                if (state.residualMax) {
                    residuals = residuals.filter((r) => r.distance <= state.residualMax!);
                }

                if (state.residualAngleMin) {
                    residuals = residuals.filter((r) => r.angle >= state.residualAngleMin!);
                }

                if (state.residualAngleMax) {
                    residuals = residuals.filter((r) => r.angle <= state.residualAngleMax!);
                }

                const svg = d3
                    .create('svg')
                    .attr('height', '100%')
                    .attr('width', '100%')
                    .attr('viewBox', [0, 0, width + padding, height + padding]);

                const parent = svg
                    .append('g')
                    .attr('transform', `translate(${(width + padding) / 2} ${(height + padding) / 2})`);

                let residualCount = 0;
                parent
                    .selectAll('point')
                    .data(
                        residuals.filter((r) => {
                            if (r.isInitial && state.isInitial) {
                                residualCount++;
                                return true;
                            } else if (!r.isInitial && state.isFinal) {
                                residualCount++;
                                return true;
                            }
                            return false;
                        }),
                    )
                    .enter()
                    .append('circle')
                    .attr('cx', (d) => d.radius * Math.cos(d.angle))
                    .attr('cy', (d) => d.radius * Math.sin(d.angle))
                    .attr('r', radius)
                    .attr('fill', (d) => (d.isInitial ? vars.color.initial : vars.color.final));

                if (residualCount === 0) {
                    element.classList.add(styles.empty);
                    while (element.lastElementChild) {
                        element.removeChild(element.lastElementChild);
                    }
                    return;
                } else {
                    element.classList.remove(styles.empty);
                }

                if (state.isInitial) {
                    parent
                        .append('circle')
                        .attr('cx', 0)
                        .attr('cy', 0)
                        .attr('r', initialMin.radius)
                        .attr('stroke', vars.color.initial)
                        .attr('stroke-width', radius)
                        .attr('fill', 'transparent');
                    parent
                        .append('circle')
                        .attr('cx', 0)
                        .attr('cy', 0)
                        .attr('r', initialMax.radius)
                        .attr('stroke', vars.color.initial)
                        .attr('stroke-width', radius)
                        .attr('fill', 'transparent');
                }

                if (state.isFinal) {
                    parent
                        .append('circle')
                        .attr('cx', 0)
                        .attr('cy', 0)
                        .attr('r', finalMin.radius)
                        .attr('stroke', vars.color.final)
                        .attr('stroke-width', radius)
                        .attr('fill', 'transparent');

                    parent
                        .append('circle')
                        .attr('cx', 0)
                        .attr('cy', 0)
                        .attr('r', finalMax.radius)
                        .attr('stroke', vars.color.final)
                        .attr('stroke-width', radius)
                        .attr('fill', 'transparent');
                }

                element.replaceChildren(svg.node() as Node);
            }
        },
        [state, activeTracks],
    );

    return <div ref={plot} className={styles.container}></div>;
}
