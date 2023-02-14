import { useCallback, useEffect, useMemo, useState } from 'react';
import { Vector2 } from 'three';
import cn from 'classnames';

import SlopeChart from '@/components/SlopeChart';

import { ContextMenuState } from '@/App';
import { Tiepoint, Track as ITrack, useData } from '@/stores/DataContext';
import { Route, useRouter } from '@/stores/RouterContext';
import { ResidualSort } from '@/stores/ToolsContext';

import { theme } from '@/utils/theme.css';
import * as styles from '@/components/Tracks.css';

const baseVector = new Vector2();

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
    contextMenu: ContextMenuState;
    setContextMenu: React.Dispatch<ContextMenuState>;
    activeImage: string | null;
    activeTrack: number | null;
    isGrouped?: boolean;
}

function Stage({ state, activeTrack }: StageProps) {
    const height = 400;
    const padding = 40;
    const offset = 15;

    const { tracks, getImageURL } = useData();

    const [images, setImages] = useState<[string, HTMLImageElement][]>([]);

    const track = useMemo<ITrack>(() => tracks.find((t) => t.trackId === activeTrack)!, [tracks, activeTrack]);

    const imageURLs = useMemo(() => {
        // Convert Array to Set to remove duplicates and back to Array for manipulation.
        const imageIds = [...new Set(track.points.map((p) => p.id).flat())];
        return imageIds.map((id) => [id, getImageURL(id)]);
    }, [track, getImageURL]);

    const stage = useCallback(
        (canvas: HTMLCanvasElement) => {
            if (canvas && images.length > 0) {
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error();

                // Clear canvas.
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.save();

                // Calculate image tiepoints without duplicates.
                const imageResiduals = track.points
                    .map((p) => [
                        {
                            id: p.id,
                            pixel: p.pixel,
                            initialResidual: p.initialResidual,
                            finalResidual: p.finalResidual,
                        },
                    ])
                    .flat();

                // Calculate total height from scalable value.
                // Calculate total width from N tiepoints with padding.
                const width = height * imageResiduals.length + (imageResiduals.length - 1) * padding;
                canvas.height = height;
                canvas.width = width;

                // Update CSS width based on canvas proportion.
                const heightRatio = canvas.offsetHeight / height;
                canvas.style.width = `${canvas.width * heightRatio}px`;

                // Go through each tiepoint and draw both images related to each tiepoint.
                let count = 0;

                for (const residual of imageResiduals) {
                    const { id, pixel, initialResidual, finalResidual } = residual;

                    // Find the correct image for this tiepoint.
                    const image = images.find((i) => i[0] === id)![1];

                    // Get nearest tiepoints based on offset per image.
                    const nearbyTiepoints: Tiepoint[] = [];
                    // TODO: Handle nearby tiepoints in visualization.
                    // const nearbyTiepoints = imageTiepoints[id].filter((t) => {
                    //     const p = t.leftId === id ? t.leftPixel : t.rightPixel;
                    //     if (
                    //         Math.abs(p[0] - pixel[0]) > offset ||
                    //         Math.abs(p[1] - pixel[1]) > offset ||
                    //         (p[0] == pixel[0] && p[1] == pixel[1])
                    //     ) {
                    //         return false;
                    //     }
                    //     return true;
                    // });

                    ctx.filter = 'contrast(2)';

                    // Crop image correctly to tiepoint location.
                    ctx.drawImage(
                        image,
                        // Top-Left Corner
                        ...(pixel.map((p) => p - offset) as [number, number]),
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
                    let imageCenter: [number, number] = [count * height + count * padding + height / 2, height / 2];
                    drawTiepoint(ctx, imageCenter, count, initialResidual, finalResidual);

                    // Draw relevant tiepoints
                    for (const t of nearbyTiepoints) {
                        const p = t.leftId === id ? t.leftPixel : t.rightPixel;
                        const xOffset = pixel[0] - p[0];
                        const yOffset = pixel[1] - p[1];

                        // Calculate relative offset.
                        imageCenter[0] -= xOffset;
                        imageCenter[1] -= yOffset;
                        drawTiepoint(ctx, imageCenter, count, t.initialResidual, t.finalResidual, true);
                    }
                    count++;
                }
            }
        },
        [state, track, images],
    );

    function drawTiepoint(
        ctx: CanvasRenderingContext2D,
        position: [number, number],
        count: number,
        initialResidual: [number, number],
        finalResidual: [number, number],
        isSibling?: boolean,
    ) {
        if (position[0] < count * height + count * padding || position[0] > count * height + count * padding + height)
            return;

        // Set opacity lower for sibling tiepoints in the image.
        if (isSibling) {
            ctx.globalAlpha = 0.3;
        } else {
            ctx.globalAlpha = 1;
        }

        // Calculate residual distance for filtering.
        const initialDistance = Number(baseVector.distanceTo(new Vector2(...initialResidual)).toFixed(1));
        const finalDistance = Number(baseVector.distanceTo(new Vector2(...finalResidual)).toFixed(1));

        let isResidualRendered = false;

        // Draw initial residual.
        if (
            state.isInitial &&
            (!state.residualMin || (state.residualMin && state.residualMin <= initialDistance)) &&
            (!state.residualMax || (state.residualMax && state.residualMax >= initialDistance))
        ) {
            ctx.beginPath();

            ctx.strokeStyle = theme.color.initialHex;
            ctx.lineWidth = 10;

            ctx.moveTo(...position);
            ctx.lineTo(
                ...(position.map((p, i) => {
                    let dist = (p + initialResidual[i]) * 5;
                    // TODO: Check why this was added originally.
                    // if (dist > count * height + count * padding + height) {
                    //     dist = count * height + count * padding + height;
                    // }
                    return dist;
                }) as [number, number]),
            );

            ctx.stroke();
            isResidualRendered = true;
        }

        // Draw final residual.
        if (
            state.isFinal &&
            (!state.residualMin || (state.residualMin && state.residualMin <= finalDistance)) &&
            (!state.residualMax || (state.residualMax && state.residualMax >= finalDistance))
        ) {
            ctx.beginPath();

            ctx.strokeStyle = theme.color.finalHex;
            ctx.lineWidth = 10;

            ctx.moveTo(...position);
            ctx.lineTo(
                ...(position.map((p, i) => {
                    let dist = (p + finalResidual[i]) * 5;
                    // TODO: Check why this was added originally.
                    // if (dist > (count * height) + (count * padding) + height) {
                    //     dist = (count * height) + (count * padding) + height;
                    // }
                    return dist;
                }) as [number, number]),
            );

            ctx.stroke();
            isResidualRendered = true;
        }

        // Draw pixel as circle.
        if (isResidualRendered) {
            ctx.beginPath();
            ctx.arc(...position, 15, 0, Math.PI * 2, true);
            ctx.fill();
        }

        // Reset alpha.
        ctx.globalAlpha = 1;
    }

    useEffect(() => {
        if (imageURLs) {
            const newImages: [string, HTMLImageElement][] = [];
            for (const [id, imageURL] of imageURLs) {
                if (id && imageURL) {
                    const newImage = new Image();
                    newImage.onload = () => {
                        newImages.push([id, newImage]);
                        if (newImages.length === imageURLs.length) {
                            setImages(newImages);
                        }
                    };
                    newImage.src = imageURL;
                } else {
                    throw new Error();
                }
            }
        }
    }, [imageURLs]);

    return <canvas ref={stage} className={styles.tiepoints} />;
}

export default function Track({ state, contextMenu, setContextMenu, activeImage, activeTrack, isGrouped }: TrackProps) {
    const router = useRouter();

    const { editedTracks, setActiveTrack } = useData();

    function handleClick() {
        router.push(Route.TRACK);
        setActiveTrack(activeTrack);
    }

    function handleContextMenu(event: React.MouseEvent<HTMLDivElement>) {
        if (setContextMenu) {
            event.preventDefault();
            const newState = { isTiepoint: false, x: event.pageX, y: event.pageY, data: activeTrack };
            if (contextMenu?.isEnabled) {
                setContextMenu({ ...newState, isEnabled: false, isTrack: false });
            } else {
                setContextMenu({ ...newState, isEnabled: true, isTrack: true });
            }
        }
    }

    return (
        <div
            key={activeTrack}
            className={cn(styles.track, {
                [styles.trackSpacing]: isGrouped,
                [styles.trackWidth]: !isGrouped,
                [styles.trackEdited]: activeTrack && editedTracks.includes(activeTrack),
            })}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
        >
            {isGrouped && activeImage && activeTrack && (
                <>
                    <h3 className={styles.subheader}>ID: {activeTrack}</h3>
                    <div className={styles.slope}>
                        <SlopeChart
                            state={state}
                            activeImage={activeImage}
                            activeTrack={activeTrack}
                            isSmall
                            isEdited
                        />
                    </div>
                </>
            )}
            <Stage state={state} activeTrack={activeTrack} />
        </div>
    );
}
