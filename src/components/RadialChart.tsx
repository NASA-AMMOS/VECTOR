import { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useData } from '@/DataContext';
import { vars } from '@/utils/theme.css';
import { Polar } from '@/utils/helpers';
import * as styles from '@/components/RadialChart.css';

function RadialChart({ activeImage, activeTrack }) {
    const { tiepoints } = useData();

    const activeTiepoints = useMemo(() => {
        const newTiepoints = tiepoints[activeImage];
        if (!activeTrack) {
            return newTiepoints;
        }
        return newTiepoints.filter((t) => t.trackId === Number(activeTrack));
    }, [activeImage, tiepoints]);

    const plot = useRef(null);

    useEffect(() => {
        const residuals = activeTiepoints.map((t) => [{ ...Polar(t.initialResidual), initial: true }, { ...Polar(t.finalResidual), initial: false }]).flat();

        const initialMin = residuals.filter((r) => r.initial).reduce((prev, curr) => prev.radius < curr.radius ? prev : curr);
        const initialMax = residuals.filter((r) => r.initial).reduce((prev, curr) => prev.radius > curr.radius ? prev : curr);

        const finalMin = residuals.filter((r) => !r.initial).reduce((prev, curr) => prev.radius < curr.radius ? prev : curr);
        const finalMax = residuals.filter((r) => !r.initial).reduce((prev, curr) => prev.radius > curr.radius ? prev : curr);

        const width = 8000;
        const height = 8000;
        const radius = Math.min(width, height) / 2 - 30;

        const svg = d3.create('svg')
            .attr('height', '100%')
            .attr('width', '100%')
            .attr('viewBox', [0, 0, width, height]);

        const parent = svg.append('g')
                .attr('transform', `translate(${width / 2} ${height / 2})`)
        
        parent.selectAll('point')
            .data(residuals)
            .enter()
                .append('circle')
                    .attr('cx', (d) => d.radius * Math.cos(d.angle))
                    .attr('cy', (d) => d.radius * Math.sin(d.angle))
                    .attr('r', 50)
                    .attr('fill', (d) => d.initial ? vars.color.initial : vars.color.final);

        parent.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', initialMin.radius)
            .attr('stroke', vars.color.initial)
            .attr('stroke-width', 50)
            .attr('fill', 'transparent');

        parent.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', initialMax.radius)
            .attr('stroke', vars.color.initial)
            .attr('stroke-width', 50)
            .attr('fill', 'transparent');

        parent.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', finalMin.radius)
            .attr('stroke', vars.color.final)
            .attr('stroke-width', 50)
            .attr('fill', 'transparent');

        parent.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', finalMax.radius)
            .attr('stroke', vars.color.final)
            .attr('stroke-width', 50)
            .attr('fill', 'transparent');

        plot.current.replaceChildren(svg.node());
    }, [activeTiepoints]);

    return (
        <div ref={plot} className={styles.container}></div>
    );
}

export default RadialChart;
