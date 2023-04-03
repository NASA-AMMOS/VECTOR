import * as d3 from 'd3';

import { ResidualType } from '@/stores/DataContext';

import { vars } from '@/theme.css';
import * as styles from '@/charts/chart.css';

export interface ScatterChartPoint {
    x: number;
    y: number;
    z: ResidualType;
}

interface ScatterChartProps {
    data: ScatterChartPoint[];
    xDomain?: [number, number];
    dispatch?: d3.Dispatch<object>;
    dispatchName?: string;
}

export default function ScatterChart({ data, xDomain, dispatch, dispatchName }: ScatterChartProps) {
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

            const opacity = 0.75;
            const radius = 3;
            const gridOpacity = 0.15;

            const X = data.map((v) => v.x);
            const Y = data.map((v) => v.y);
            const Z = data.map((v) => v.z);
            const I = Array.from(Array(X.length).keys()).filter((i) => !Number.isNaN(X[i]) && !Number.isNaN(Y[i]));

            if (!xDomain) {
                xDomain = [0, Math.max.apply(Math, X)];
            }
            const yDomain = [0, Math.max.apply(Math, Y)];

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
                .attr('id', 'clipBox')
                .append('rect')
                .attr('x', margin.left)
                .attr('y', margin.top)
                .attr('width', width - margin.left - margin.right)
                .attr('height', height - margin.top - margin.bottom);

            const gX = svg
                .append('g')
                .attr('transform', `translate(0, ${height - margin.bottom})`)
                .call(xAxis);

            svg.append('g').attr('transform', `translate(${margin.left}, 0)`).call(yAxis);

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

            const circle = svg
                .append('g')
                .selectAll('circle')
                .data(I)
                .join('circle')
                .attr('cx', (i) => xScale(X[i]))
                .attr('cy', (i) => yScale(Y[i]))
                .attr('fill', (i) => (Z[i] === ResidualType.INITIAL ? vars.color.initial : vars.color.final))
                .attr('clip-path', 'url(#boundingBox)')
                .attr('opacity', opacity)
                .attr('r', radius);

            const zoomed = (event: d3.D3ZoomEvent<SVGSVGElement, undefined>) => {
                const scaledX = event.transform.rescaleX(xScale);

                gX.call(xAxis.scale(scaledX));
                circle.attr('cx', (i: number) => scaledX(X[i]));

                if (dispatch) {
                    dispatch.call('zoom', undefined, { scaledX });
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

            if (dispatch && dispatchName) {
                dispatch.on(`zoom.${dispatchName}`, (data) => {
                    if (data && data.scaledX) {
                        const scaledX = data.scaledX;

                        gX.call(xAxis.scale(scaledX));
                        circle.attr('cx', (i: number) => scaledX(X[i]));
                    }
                });
            }

            element.appendChild(svg.node()!);
        }
    };

    return <div ref={plot} className={styles.container}></div>;
}
