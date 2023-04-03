import * as d3 from 'd3';

import { ResidualType } from '@/stores/DataContext';

import { vars } from '@/theme.css';
import * as styles from '@/charts/chart.css';

export interface HistogramChartPoint {
    x: number;
    type: ResidualType;
}

interface HistogramChartProps {
    data: HistogramChartPoint[][];
    hideAxes?: boolean;
}

export default function HistogramChart({ data, hideAxes }: HistogramChartProps) {
    const plot = (element: HTMLDivElement) => {
        if (element) {
            while (element.lastChild) {
                element.removeChild(element.lastChild);
            }

            if (data.filter((v) => v.length > 0).length < 1) {
                return;
            }

            const margin = {
                top: 20,
                right: 30,
                bottom: 30,
                left: 60,
            };

            const width = 640;
            const height = 400;

            const thresholds = 40;

            const gridOpacity = 0.4;

            const Y0 = data.map((v) => new Array(v.length).fill(1));
            const I = data.map((v) => Array.from(Array(v.length).keys()));

            const bins = data.map((v, index) =>
                d3
                    .bin()
                    .thresholds(thresholds)
                    .value((i) => v[i].x)(I[index]),
            );

            const Y = data.map((_, index) => Array.from(bins[index], (I) => d3.sum(I, (i) => Y0[index][i])));

            const xDomain = [
                Math.min.apply(
                    Math,
                    bins.map((b) => b[0].x0!),
                ),
                Math.max.apply(
                    Math,
                    bins.map((b) => b[b.length - 1].x1!),
                ),
            ];
            const yDomain = [0, Math.max.apply(Math, Y.flat())];

            const xRange = [margin.left, width - margin.right];
            const yRange = [height - margin.bottom, margin.top];

            const xScale = d3.scaleLinear(xDomain, xRange);
            const yScale = d3.scaleLinear(yDomain, yRange);

            const xAxis = d3
                .axisBottom(xScale)
                .ticks(width / 96)
                .tickSize(0);
            const yAxis = d3
                .axisLeft(yScale)
                .ticks(height / 60)
                .tickSize(16);

            const svg = d3
                .create('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('viewBox', [0, 0, width, height])
                .attr('class', styles.svg);

            svg.append('clipPath')
                .attr('id', 'boundingBox')
                .append('rect')
                .attr('x', margin.left)
                .attr('y', margin.top)
                .attr('width', width - margin.left - margin.right)
                .attr('height', height - margin.top - margin.bottom);

            let gX: d3.Selection<SVGGElement, undefined, null, undefined> | null = null;
            if (!hideAxes) {
                gX = svg
                    .append('g')
                    .attr('id', 'xAxis')
                    .attr('transform', `translate(0, ${height - margin.bottom})`)
                    .call(xAxis);

                svg.append('g').attr('transform', `translate(${margin.left}, 0)`).call(yAxis);
            }

            svg.append('g')
                .attr('stroke', vars.color.black)
                .attr('stroke-opacity', gridOpacity)
                .attr('clip-path', 'url(#boundingBox)')
                .append('g')
                .selectAll('line')
                .data(yScale.ticks())
                .join('line')
                .attr('y1', (v) => 0.5 + yScale(v))
                .attr('y2', (v) => 0.5 + yScale(v))
                .attr('x1', margin.left)
                .attr('x2', width - margin.right);

            const rects = bins.map((bin, index) =>
                svg
                    .append('g')
                    .attr('clip-path', 'url(#boundingBox)')
                    .selectAll('rect')
                    .data(bin)
                    .join('rect')
                    .attr('x', (d) => xScale(d.x0!))
                    .attr('y', (_, i) => yScale(Y[index][i]))
                    .attr('width', (d) => Math.max(0, xScale(d.x1!) - xScale(d.x0!)))
                    .attr('height', (_, i) => yScale(0) - yScale(Y[index][i]))
                    .attr('fill', () =>
                        data[index][0].type === ResidualType.INITIAL ? vars.color.initial : vars.color.final,
                    ),
            );

            const zoomed = (event: d3.D3ZoomEvent<SVGSVGElement, undefined>) => {
                const scaledX = event.transform.rescaleX(xScale);

                if (gX) {
                    gX.call(xAxis.scale(scaledX));
                }
                for (const rect of rects) {
                    rect.attr('x', (d) => scaledX(d.x0!)).attr('width', (d) =>
                        Math.max(0, scaledX(d.x1!) - scaledX(d.x0!)),
                    );
                }
            };

            const zoom = d3
                .zoom<SVGSVGElement, undefined>()
                .scaleExtent([1, 16])
                .extent([
                    [margin.left, 0],
                    [width - margin.right, height],
                ])
                .translateExtent([
                    [margin.left, -Infinity],
                    [width - margin.right, Infinity],
                ])
                .on('zoom', zoomed);

            svg.call(zoom);

            element.appendChild(svg.node()!);
        }
    };

    return <div ref={plot} className={styles.container}></div>;
}
