import * as d3 from 'd3';

import { ResidualType } from '@/stores/DataContext';

import { vars } from '@/theme.css';
import * as styles from '@/charts/chart.css';

export interface SlopeChartPoint {
    type: ResidualType;
    index: string;
    value: number;
}

interface SlopeChartProps {
    data: SlopeChartPoint[];
    yDomain?: [number, number] | null;
}

export default function SlopeChart({ data, yDomain }: SlopeChartProps) {
    const plot = (element: HTMLDivElement) => {
        if (element) {
            while (element.lastChild) {
                element.removeChild(element.lastChild);
            }

            if (data.length < 1) {
                return;
            }

            const margin = {
                top: 20,
                right: 30,
                bottom: 30,
                left: 40,
            };

            const width = 640;
            const height = 400;

            const strokeWidth = 2;

            const X = data.map((v) => v.type);
            const Y = data.map((v) => v.value);
            const Z = data.map((v) => v.index);
            const D = data.map((v, i) => !Number.isNaN(Y[i]));

            const xDomain = new d3.InternSet(X);
            if (!yDomain) {
                yDomain = [Math.min.apply(Math, Y), Math.max.apply(Math, Y)];
            }
            const zDomain = new d3.InternSet(Z);

            const xRange = [margin.left, width - margin.right];
            const yRange = [height - margin.bottom, margin.top];

            const I = Array.from(Array(X.length).keys()).filter((i) => xDomain.has(X[i]) && zDomain.has(Z[i]));

            const xScale = d3.scalePoint(xDomain, xRange);
            const yScale = d3.scaleLinear(yDomain, yRange);

            const line = d3
                .line<number>()
                .defined((i) => D[i])
                .curve(d3.curveBasis)
                .x((i) => xScale(X[i])!)
                .y((i) => yScale(Y[i]));

            const svg = d3
                .create('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('viewBox', [0, 0, width, height])
                .attr('class', styles.svg);

            svg.append('g')
                .attr('transform', `translate(${margin.left}, 0)`)
                .call(d3.axisLeft(yScale).tickSizeOuter(0))
                .call((g) => g.selectAll('.tick').remove())
                .call((g) =>
                    g
                        .selectAll('path')
                        .attr('stroke', vars.color.initial)
                        .attr('stroke-width', strokeWidth * 4),
                );

            svg.append('g')
                .attr('transform', `translate(${width - margin.right}, 0)`)
                .call(d3.axisRight(yScale).tickSizeOuter(0))
                .call((g) => g.selectAll('.tick').remove())
                .call((g) =>
                    g
                        .selectAll('path')
                        .attr('stroke', vars.color.final)
                        .attr('stroke-width', strokeWidth * 4),
                );

            svg.append('g')
                .attr('fill', 'none')
                .attr('stroke-width', strokeWidth)
                .selectAll('path')
                .data(d3.group(I, (i) => Z[i]))
                .join('path')
                .attr('stroke', ([_, I]) => (Y[I[0]] >= Y[I[1]] ? vars.color.decrease : vars.color.increase))
                .attr('d', ([_, I]) => line(I));

            element.appendChild(svg.node()!);
        }
    };

    return <div ref={plot} className={styles.container}></div>;
}
