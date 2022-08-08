import { useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { Tiepoint, useData } from '@/DataContext';
import { vars } from '@/utils/theme.css';
import { Polar } from '@/utils/helpers';
import * as styles from '@/components/RadialChart.css';

interface RadialChartState {
    isInitial: boolean;
    isFinal: boolean;
    isRelative?: boolean;
};

interface RadialChartProps {
    state: RadialChartState;
    activeImage?: string;
    activeTrack?: number;
};

export default function RadialChart({ state, activeImage, activeTrack }: RadialChartProps) {
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
            const residuals = activeTiepoints.map((t) => [{ ...Polar(t.initialResidual), isInitial: true }, { ...Polar(t.finalResidual), isInitial: false }]).flat();

            const initialMin = residuals.filter((r) => r.isInitial).reduce((prev, curr) => prev.radius < curr.radius ? prev : curr);
            const initialMax = residuals.filter((r) => r.isInitial).reduce((prev, curr) => prev.radius > curr.radius ? prev : curr);

            const finalMin = residuals.filter((r) => !r.isInitial).reduce((prev, curr) => prev.radius < curr.radius ? prev : curr);
            const finalMax = residuals.filter((r) => !r.isInitial).reduce((prev, curr) => prev.radius > curr.radius ? prev : curr);

            let width;
            if (state.isRelative) {
                width = Math.max(initialMax.radius, finalMax.radius);
            } else {
                width = residualBounds[1][1];
            }
            width *= 2;

            const height = width;
            const padding = width * 0.25;
            const radius = width * 0.005;

            const svg = d3.create('svg')
                .attr('height', '100%')
                .attr('width', '100%')
                .attr('viewBox', [0, 0, width + padding, height + padding]);

            const parent = svg.append('g')
                    .attr('transform', `translate(${(width + padding) / 2 } ${(height + padding) / 2})`)
            
            parent.selectAll('point')
                .data(residuals.filter((r) => {
                    if (r.isInitial && state.isInitial) {
                        return true;
                    } else if (!r.isInitial && state.isFinal) {
                        return true;
                    }
                    return false;
                }))
                .enter()
                    .append('circle')
                        .attr('cx', (d) => d.radius * Math.cos(d.angle))
                        .attr('cy', (d) => d.radius * Math.sin(d.angle))
                        .attr('r', radius)
                        .attr('fill', (d) => d.isInitial ? vars.color.initial : vars.color.final);

            if (state.isInitial) {
                parent.append('circle')
                    .attr('cx', 0)
                    .attr('cy', 0)
                    .attr('r', initialMin.radius)
                    .attr('stroke', vars.color.initial)
                    .attr('stroke-width', radius)
                    .attr('fill', 'transparent');
                parent.append('circle')
                    .attr('cx', 0)
                    .attr('cy', 0)
                    .attr('r', initialMax.radius)
                    .attr('stroke', vars.color.initial)
                    .attr('stroke-width', radius)
                    .attr('fill', 'transparent');
            }

            if (state.isFinal) {
                parent.append('circle')
                    .attr('cx', 0)
                    .attr('cy', 0)
                    .attr('r', finalMin.radius)
                    .attr('stroke', vars.color.final)
                    .attr('stroke-width', radius)
                    .attr('fill', 'transparent');

                parent.append('circle')
                    .attr('cx', 0)
                    .attr('cy', 0)
                    .attr('r', finalMax.radius)
                    .attr('stroke', vars.color.final)
                    .attr('stroke-width', radius)
                    .attr('fill', 'transparent');
            }

            element.replaceChildren(svg.node() as Node);
        }
    }, [state, activeTiepoints]);

    return (
        <div ref={plot} className={styles.container}></div>
    );
}
