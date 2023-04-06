import { useCallback, useEffect, useMemo, useState } from 'react';
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

const height = 400;
const padding = 40;
const offset = 15;

export default function Track({ trackId, isGrouped = false }: TrackProps) {
    const navigate = useNavigate();

    const { tracks, cameraMap } = useData();
    const { filterState } = useFilters();

    const track = useMemo(() => tracks.find((t) => t.id === trackId) ?? null, [trackId, tracks]);
    if (!track) {
        return null;
    }

    const [images, setImages] = useState<{ [key: string]: HTMLImageElement }>({});
    const [points, setPoints] = useState<SlopeChartPoint[]>([]);

    const imageURLs = useMemo(() => {
        const map: { [key: string]: string | null } = {};
        for (const point of track.points) {
            if (!(point.cameraId in map)) {
                map[point.cameraId] = cameraMap[point.cameraId].imageURL;
            }
        }
        return map;
    }, [track, cameraMap]);

    const handleClick = () => {
        navigate(`/tracks/${trackId}`);
    };

    useEffect(() => {
        setPoints(
            track.points
                .map((point) => [
                    { type: ResidualType.INITIAL, index: point.index, value: point.initialResidualLength },
                    { type: ResidualType.FINAL, index: point.index, value: point.finalResidualLength },
                ])
                .flat(),
        );
    }, [track, filterState]);

    const createPoint = (ctx: CanvasRenderingContext2D, point: Point, position: [number, number], count: number) => {
        if (position[0] < count * height + count * padding || position[0] > count * height + count * padding + height)
            return;

        let isResidualDrawn = false;

        // Draw initial residual.
        if (
            filterState.viewInitialResiduals &&
            filterState.minResidualLength <= point.initialResidualLength &&
            filterState.maxResidualLength >= point.initialResidualLength
        ) {
            ctx.beginPath();

            ctx.strokeStyle = theme.color.initialHex;
            ctx.lineWidth = 10;

            ctx.moveTo(...position);
            ctx.lineTo(position[0] + point.initialResidual[0] * 5, position[1] + point.initialResidual[1] * 5);

            ctx.stroke();
            isResidualDrawn = true;
        }

        // Draw final residual.
        if (
            filterState.viewFinalResiduals &&
            filterState.minResidualLength <= point.finalResidualLength &&
            filterState.maxResidualLength >= point.finalResidualLength
        ) {
            ctx.beginPath();

            ctx.strokeStyle = theme.color.finalHex;
            ctx.lineWidth = 10;

            ctx.moveTo(...position);
            ctx.lineTo(position[0] + point.finalResidual[0] * 5, position[1] + point.finalResidual[1] * 5);

            ctx.stroke();
            isResidualDrawn = true;
        }

        // Draw pixel as circle.
        if (isResidualDrawn) {
            ctx.beginPath();
            ctx.arc(position[0], position[1], 8, 0, Math.PI * 2, true);
            ctx.fill();
        }
    };

    useEffect(() => {
        if (imageURLs) {
            const newImages: { [key: string]: HTMLImageElement } = {};
            for (const [name, url] of Object.entries(imageURLs)) {
                if (name && url) {
                    const image = new Image();
                    image.onload = () => {
                        newImages[name] = image;
                        if (Object.keys(newImages).length === Object.keys(imageURLs).length) {
                            setImages(newImages);
                        }
                    };
                    image.src = url;
                } else {
                    throw new Error('Failed to load image in track');
                }
            }
        }
    }, [imageURLs]);

    const stage = useCallback(
        (canvas: HTMLCanvasElement) => {
            if (canvas && Object.keys(images).length > 0) {
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error();

                // Clear canvas.
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.save();

                const points = track.points;

                // Calculate total height from scalable value.
                // Calculate total width from N tiepoints with padding.
                const width = height * points.length + (points.length - 1) * padding;
                canvas.height = height;
                canvas.width = width;

                // Update CSS width based on canvas proportion.
                const heightRatio = canvas.offsetHeight / height;
                canvas.style.width = `${canvas.width * heightRatio}px`;

                // Go through each tiepoint and draw both images related to each tiepoint.
                let count = 0;

                for (const point of points) {
                    const image = images[point.cameraId];

                    ctx.filter = 'contrast(2)';

                    // Crop image correctly to tiepoint location.
                    ctx.drawImage(
                        image,
                        // Top-Left Corner
                        point.pixel[0] - offset,
                        point.pixel[1] - offset,
                        // Crop Area
                        offset * 2,
                        offset * 2,
                        // Canvas Location
                        count * height + count * padding,
                        0,
                        // Width & Height
                        height,
                        height,
                    );

                    // Draw main tiepoint.
                    const imageCenter: [number, number] = [count * height + count * padding + height / 2, height / 2];
                    createPoint(ctx, point, imageCenter, count);

                    count++;
                }
            }
        },
        [track, images, filterState],
    );

    return (
        <div
            key={trackId}
            className={cn(styles.container, {
                [styles.spacer]: isGrouped,
                [styles.expand]: !isGrouped,
            })}
            onClick={handleClick}
        >
            {isGrouped && trackId && (
                <>
                    <h3 className={cn(H3, styles.subheader)}>{trackId}</h3>
                    <div className={styles.slope}>
                        <SlopeChart data={points} />
                    </div>
                </>
            )}
            <canvas ref={stage} className={styles.tiepoints} />;
        </div>
    );
}
