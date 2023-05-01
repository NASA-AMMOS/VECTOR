import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';

import { Point, ResidualType, useData } from '@/stores/DataContext';
import { useFilters } from '@/stores/FiltersContext';

import SlopeChart, { SlopeChartPoint } from '@/charts/slope';

import { theme } from '@/theme.css';
import { H3 } from '@/styles/headers.css';
import * as styles from '@/components/Track.css';

interface TrackProps {
    trackId: string;
    isGrouped?: boolean;
}

const size = 256;
const offset = 15;

export default function Track({ trackId, isGrouped = false }: TrackProps) {
    const navigate = useNavigate();

    const { tracks, cameraImageMap } = useData();
    const { filterState, guardInitialPoint, guardFinalPoint } = useFilters();

    const track = useMemo(() => tracks.find((t) => t.id === trackId) ?? null, [trackId, tracks]);
    if (!track) {
        return null;
    }

    const [points, setPoints] = useState<SlopeChartPoint[]>([]);

    const offscreenCanvas = useMemo(() => new OffscreenCanvas(size, size), []);

    const handleClick = () => {
        navigate(`/tracks/${trackId}`);
    };

    useEffect(() => {
        setPoints(
            track.points
                .map((point) => [
                    { type: ResidualType.INITIAL, index: point.id, value: point.initialResidualLength },
                    { type: ResidualType.FINAL, index: point.id, value: point.finalResidualLength },
                ])
                .flat(),
        );
    }, [track, filterState]);

    // Since we are using the OffscreenCanvas API... it might be worthwhile
    // to multithread the drawing using Web Workers because there are a large
    // number of points.
    const draw = async (element: HTMLCanvasElement, point: Point) => {
        const ctx = offscreenCanvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to create Offscreen Canvas 2D context');
        }

        // Clear canvas.
        ctx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        ctx.save();

        const image = new Image();
        image.src = cameraImageMap[point.cameraId].url;

        // Need to await image load before drawing to the canvas.
        // Otherwise nothing will get drawn. This should be relatively
        // quick because the ImageLoader preloads all the images and
        // browsers cache request URLs.
        await new Promise((resolve: (value: void) => void) => {
            image.onload = () => {
                resolve();
            };
        });

        ctx.drawImage(
            image,
            // Top-Left Corner
            point.pixel[0] - offset,
            point.pixel[1] - offset,
            // Crop Area
            offset * 2,
            offset * 2,
            // Canvas Location
            0,
            0,
            // Width & Height
            size,
            size,
        );

        const center = size / 2;

        let isResidualDrawn = false;

        // Draw initial residual.
        if (guardInitialPoint(point)) {
            ctx.beginPath();

            ctx.strokeStyle = theme.color.initialHex;
            ctx.lineWidth = 10;

            ctx.moveTo(center, center);
            ctx.lineTo(
                center + point.initialResidual[0] * filterState.residualScale,
                center + point.initialResidual[1] * filterState.residualScale,
            );

            ctx.stroke();
            isResidualDrawn = true;
        }

        // Draw final residual.
        if (guardFinalPoint(point)) {
            ctx.beginPath();

            ctx.strokeStyle = theme.color.finalHex;
            ctx.lineWidth = 10;

            ctx.moveTo(center, center);
            ctx.lineTo(
                center + point.finalResidual[0] * filterState.residualScale,
                center + point.finalResidual[1] * filterState.residualScale,
            );

            ctx.stroke();
            isResidualDrawn = true;
        }

        // Draw pixel as circle.
        if (isResidualDrawn) {
            ctx.beginPath();
            ctx.arc(center, center, 8, 0, Math.PI * 2, true);
            ctx.fill();
        }

        const canvasCTX = element.getContext('2d');
        if (!canvasCTX) {
            throw new Error('Failed to create Canvas 2D context');
        }
        canvasCTX.drawImage(offscreenCanvas, 0, 0);
    };

    return (
        <div key={trackId} className={styles.container} onClick={handleClick}>
            {isGrouped && <h3 className={cn(H3, styles.subheader)}>{trackId}</h3>}
            {isGrouped && (
                <div className={styles.slope}>
                    <SlopeChart data={points} />
                </div>
            )}
            {track.points.map((point) => (
                <canvas
                    ref={(element) => (element ? draw(element, point) : null)}
                    className={styles.canvas}
                    width={size}
                    height={size}
                />
            ))}
        </div>
    );
}
