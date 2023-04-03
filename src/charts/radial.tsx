import * as d3 from 'd3';

import { ResidualType } from '@/stores/DataContext';

import { vars } from '@/theme.css';
import * as styles from '@/charts/chart.css';

export interface RadialChartPoint {
    radius: number;
    angle: number;
    type: ResidualType;
}

interface RadialChartProps {
    data: RadialChartPoint[];
    maxRadius: number | null;
}

export default function RadialChart({ data, maxRadius }: RadialChartProps) {
    const plot = (element: HTMLDivElement) => {
        if (element) {
            while (element.lastChild) {
                element.removeChild(element.lastChild);
            }

            if (data.length < 1) {
                return;
            }

            if (!maxRadius) {
                maxRadius = Math.max.apply(
                    Math,
                    data.map((v) => v.radius),
                );
            }

            const radius = 0.75;
            const strokeOpacity = 0.25;
            const strokeWidth = 1;

            const size = maxRadius * (2 + strokeWidth / 10);

            const scale = d3.scaleLinear([0, 1], [0, maxRadius]);

            const outerRings = [
                {
                    radius: Math.max.apply(
                        Math,
                        data.filter((v) => v.type === ResidualType.INITIAL).map((v) => v.radius),
                    ),
                    type: ResidualType.INITIAL,
                },
                {
                    radius: Math.max.apply(
                        Math,
                        data.filter((v) => v.type === ResidualType.FINAL).map((v) => v.radius),
                    ),
                    type: ResidualType.FINAL,
                },
            ].filter((v) => Number.isFinite(v.radius));

            const svg = d3
                .create('svg')
                .attr('width', size * 1.6)
                .attr('height', size)
                .attr('viewBox', [0, 0, size, size])
                .attr('class', styles.svg);

            svg.append('g')
                .attr('transform', `translate(${size / 2}, ${size / 2})`)
                .selectAll('point')
                .data(scale.ticks().slice(1))
                .enter()
                .append('circle')
                .attr('fill', 'none')
                .attr('stroke', vars.color.black)
                .attr('stroke-opacity', strokeOpacity)
                .attr('stroke-width', `${strokeWidth}%`)
                .attr('r', scale);

            svg.append('g')
                .attr('transform', `translate(${size / 2}, ${size / 2})`)
                .selectAll('point')
                .data(data)
                .enter()
                .append('circle')
                .attr('cx', (v) => v.radius * Math.cos(v.angle * (Math.PI / 180)))
                .attr('cy', (v) => v.radius * Math.sin(v.angle * (Math.PI / 180)))
                .attr('r', `${radius}%`)
                .attr('fill', (v) => (v.type === ResidualType.INITIAL ? vars.color.initial : vars.color.final));

            svg.append('g')
                .attr('transform', `translate(${size / 2}, ${size / 2})`)
                .selectAll('point')
                .data(outerRings)
                .enter()
                .append('circle')
                .attr('cx', 0)
                .attr('cy', 0)
                .attr('r', (v) => v.radius)
                .attr('fill', 'none')
                .attr('stroke', (v) => (v.type === ResidualType.INITIAL ? vars.color.initial : vars.color.final))
                .attr('stroke-width', `${strokeWidth}%`);

            element.appendChild(svg.node()!);
        }
    };

    return <div ref={plot} className={styles.container}></div>;
}
