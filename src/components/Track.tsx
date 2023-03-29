import { useCallback, useEffect, useMemo, useState } from 'react';
import cn from 'classnames';

import SlopeChart from '@/components/SlopeChart';

import { Point, Track as ITrack, useData } from '@/stores/DataContext';
import { Route, useRouter } from '@/stores/RouterContext';
import { ResidualSort } from '@/stores/ToolsContext';

import { theme } from '@/utils/theme.css';
import * as styles from '@/components/Tracks.css';

export interface TrackState {
    isInitial: boolean;
    isFinal: boolean;
    isRelative: boolean;
    residualMin: number | null;
    residualMax: number | null;
    residualSort: ResidualSort;
}

interface StageProps {
    state: TrackState;
    activeTrack: number | null;
}

interface TrackProps {
    state: TrackState;
    activeImage: string | null;
    activeTrack: number | null;
    isGrouped?: boolean;
}

function Stage({ state, activeTrack }: StageProps) {
    const height = 400;
    const padding = 40;
    const offset = 15;

    const { tracks, getImageURL } = useData();

    const [images, setImages] = useState<{ [key: string]: HTMLImageElement }>({});

    const track = useMemo<ITrack>(() => tracks.find((t) => t.id === activeTrack)!, [tracks, activeTrack]);

    const imageURLs = useMemo(() => {
        const result: { [key: string]: string | null } = {};
        for (const point of track.points) {
            if (!(point.imageName in result)) {
                result[point.imageName] = getImageURL(point.imageName);
            }
        }
        return result;
    }, [track, getImageURL]);

    const createPoint = (ctx: CanvasRenderingContext2D, point: Point, position: [number, number], count: number) => {
        if (position[0] < count * height + count * padding || position[0] > count * height + count * padding + height)
            return;

        let isResidualRendered = false;

        // Draw initial residual.
        if (
            state.isInitial &&
            (!state.residualMin || (state.residualMin && state.residualMin <= point.initialResidualLength)) &&
            (!state.residualMax || (state.residualMax && state.residualMax >= point.initialResidualLength))
        ) {
            ctx.beginPath();

            ctx.strokeStyle = theme.color.initialHex;
            ctx.lineWidth = 10;

            ctx.moveTo(...position);
            ctx.lineTo(position[0] + point.initialResidual[0] * 5, position[1] + point.initialResidual[1] * 5);

            ctx.stroke();
            isResidualRendered = true;
        }

        // Draw final residual.
        if (
            state.isFinal &&
            (!state.residualMin || (state.residualMin && state.residualMin <= point.finalResidualLength)) &&
            (!state.residualMax || (state.residualMax && state.residualMax >= point.finalResidualLength))
        ) {
            ctx.beginPath();

            ctx.strokeStyle = theme.color.finalHex;
            ctx.lineWidth = 10;

            ctx.moveTo(...position);
            ctx.lineTo(position[0] + point.finalResidual[0] * 5, position[1] + point.finalResidual[1] * 5);

            ctx.stroke();
            isResidualRendered = true;
        }

        // Draw pixel as circle.
        if (isResidualRendered) {
            ctx.beginPath();
            ctx.arc(...position, 15, 0, Math.PI * 2, true);
            ctx.fill();
        }
    };

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
                    const image = images[point.imageName];

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
        [state, track, images],
    );

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

    return <canvas ref={stage} className={styles.tiepoints} />;
}

export default function Track({ state, activeImage, activeTrack, isGrouped }: TrackProps) {
    const router = useRouter();

    const { setActiveTrack } = useData();

    function handleClick() {
        router.push(Route.TRACK);
        setActiveTrack(activeTrack);
    }

    return (
        <div
            key={activeTrack}
            className={cn(styles.track, {
                [styles.trackSpacing]: isGrouped,
                [styles.trackWidth]: !isGrouped,
            })}
            onClick={handleClick}
        >
            {isGrouped && activeImage && activeTrack && (
                <>
                    <h3 className={styles.subheader}>ID: {activeTrack}</h3>
                    <div className={styles.slope}>
                        <SlopeChart state={state} activeImage={activeImage} activeTrack={activeTrack} isSmall />
                    </div>
                </>
            )}
            <Stage state={state} activeTrack={activeTrack} />
        </div>
    );
}
