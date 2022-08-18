import { useState, useMemo, useCallback, useEffect } from 'react';
import { Vector2 } from 'three';
import cn from 'classnames';

import SlopeChart from '@/components/SlopeChart';

import { ContextMenuState } from '@/App';
import { Route, useRouter } from '@/stores/RouterContext';
import { Tiepoint, useData } from '@/stores/DataContext';
import { ResidualSort, ResidualSortField, ResidualSortDirection } from '@/stores/ToolsContext';

import { theme } from '@/utils/theme.css';
import * as styles from '@/components/Tracks.css';

const baseVector = new Vector2();

interface TrackState {
    isInitial: boolean;
    isFinal: boolean;
    isRelative: boolean;
    residualMin: number | null;
    residualMax: number | null;
    residualSort: ResidualSort;
};

interface StageProps {
    state: TrackState;
    activeTrack: number | null;
};

interface TrackProps {
    state: TrackState;
    contextMenu: ContextMenuState;
    setContextMenu: React.Dispatch<ContextMenuState>;
    activeImage: string | null;
    activeTrack: number | null;
    isGrouped?: boolean;
};

interface TracksProps {
    state: TrackState;
    contextMenu: ContextMenuState;
    setContextMenu: React.Dispatch<ContextMenuState>;
};

function Stage({ state, activeTrack }: StageProps) {
    const height = 400;
    const padding = 40;
    const offset = 10;

    const { tiepoints, imageTiepoints, getImageURL } = useData();

    const [images, setImages] = useState<[string, HTMLImageElement][]>([]);

    const activeTiepoints = useMemo<Tiepoint[]>(() => tiepoints.filter((t) => t.trackId === activeTrack), [tiepoints, activeTrack]);

    const imageURLs = useMemo(() => {
        // Convert Array to Set to remove duplicates and back to Array for manipulation.
        const imageIds = [...new Set(activeTiepoints.map((t) => [t.leftId, t.rightId]).flat())];
        return imageIds.map((id) => [id, getImageURL(id)]);
    }, [activeTiepoints, getImageURL]);

    const stage = useCallback((canvas: HTMLCanvasElement) => {
        if (canvas && activeTiepoints.length > 0 && images.length > 0) {
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error();

            // Clear canvas.
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();

            // Calculate image tiepoints without duplicates.
            const imageResiduals = activeTiepoints.map((t) => [
                {
                    id: t.leftId,
                    pixel: t.leftPixel,
                    initialResidual: t.initialResidual,
                    finalResidual: t.finalResidual,
                },
                {
                    id: t.rightId,
                    pixel: t.rightPixel,
                    initialResidual: t.initialResidual,
                    finalResidual: t.finalResidual,
                },
            ]).flat().filter((r, index, self) => index === self.findIndex((v) => r.id === v.id));

            // Calculate total height from scalable value.
            // Calculate total width from n tiepoints with padding.
            const width = height * (imageResiduals.length) + (imageResiduals.length - 1) * padding;
            canvas.height = height;
            canvas.width = width;

            // Update CSS width based on canvas proportion.
            const heightRatio = canvas.offsetHeight / height;
            canvas.style.width = `${canvas.width * heightRatio}px`;

            // Go through each tiepoint and draw both images related to each tiepoint.
            let count = 0;

            for (const residual of imageResiduals) {
                const { id, pixel, initialResidual, finalResidual } = residual;
                console.log(id, pixel, initialResidual, finalResidual)

                // Find the correct image for this tiepoint.
                const image = images.find((i) => i[0] === id)![1];

                // Get nearest tiepoints based on offset per image.
                const nearbyTiepoints = imageTiepoints[id].filter((t) => {
                    const p = t.leftId === id ? t.leftPixel : t.rightPixel;
                    if (p[0] - pixel[0] > offset || p[1] - pixel[1] > offset) {
                        return false;
                    }
                    return true;
                });

                // Crop image correctly to tiepoint location.
                ctx.drawImage(image,
                    ...pixel.map((p) => p - offset) as [number, number], // Top-Left Corner
                    offset * 2, offset * 2,                              // Crop Area
                    (count * height) + (count * padding), 0,             // Canvas Location
                    height, height                                       // Width & Height
                );

                // Draw main tiepoint.
                let imageCenter: [number, number] = [(count * height) + (count * padding) + (height / 2), height / 2];
                drawTiepoint(ctx, imageCenter, count, initialResidual, finalResidual);

                // Draw relevant tiepoints
                for (const t of nearbyTiepoints) {
                    const p = t.leftId === id ? t.leftPixel : t.rightPixel;
                    const xOffset = pixel[0] - p[0];
                    const yOffset = pixel[1] - p[1];
                    imageCenter[0] -= xOffset;
                    imageCenter[1] -= yOffset;
                    drawTiepoint(ctx, imageCenter, count, t.initialResidual, t.finalResidual, true);
                }
                count++;
            }
        }
    }, [state, activeTiepoints, images]);

    function drawTiepoint(
        ctx: CanvasRenderingContext2D,
        position: [number, number],
        count: number,
        initialResidual: [number, number],
        finalResidual: [number, number],
        isSibling?: boolean,
    ) {
        if (
            position[0] < (count * height) + (count * padding) ||
            position[0] > (count * height) + (count * padding) + height
        ) return;

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
            ctx.lineWidth = 5;
            ctx.moveTo(...position);
            ctx.lineTo(...position.map((p, i) => {
                let dist = (p + initialResidual[i]) * 1.5;
                if (dist > (count * height) + (count * padding) + height) {
                    dist = (count * height) + (count * padding) + height;
                }
                return dist;
            }) as [number, number]);
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
            ctx.lineWidth = 5;
            ctx.moveTo(...position);
            ctx.lineTo(...position.map((p, i) => {
                let dist = (p + finalResidual[i]) * 1.5;
                if (dist > (count * height) + (count * padding) + height) {
                    dist = (count * height) + (count * padding) + height;
                }
                return dist;
            }) as [number, number]);
            ctx.stroke();
            isResidualRendered = true;
        }

        // Draw pixel as circle.
        if (isResidualRendered) {
            ctx.beginPath();
            ctx.arc(...position, 15, 0, Math.PI * 2, true);
            ctx.fill();
        }
    }

    useEffect(() => {
        if (imageURLs) {;
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

    return (
        <canvas
            ref={stage}
            className={styles.tiepoints}
        />
    );
}

export function Track({ state, contextMenu, setContextMenu, activeImage, activeTrack, isGrouped }: TrackProps) {
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
                    <h3 className={styles.subheader}>
                        ID: {activeTrack}
                    </h3>
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
            <Stage
                state={state}
                activeTrack={activeTrack}
            />
        </div>
    )
}

export default function Tracks({ state, contextMenu, setContextMenu }: TracksProps) {
    const { tiepoints, imageTiepoints, activeImage } = useData();

    const activeTracks = useMemo<number[]>(() => {
        if (Object.keys(imageTiepoints).length === 0 || !activeImage) {
            return [];
        }

        const trackIds = [...new Set(imageTiepoints[activeImage].map((t) => t.trackId))].sort((a, b) => {
            const tiepointsA = tiepoints.filter((t) => t.trackId === a);
            const tiepointsB = tiepoints.filter((t) => t.trackId === b);

            if (state.residualSort.field === ResidualSortField.INITIAL) {
                const maxResidualA = Math.max(...tiepointsA.map((t) => Number(baseVector.distanceTo(new Vector2(...t.initialResidual)).toFixed(1))));
                const maxResidualB = Math.max(...tiepointsB.map((t) => Number(baseVector.distanceTo(new Vector2(...t.initialResidual)).toFixed(1))));
                if (
                    (state.residualSort.direction === ResidualSortDirection.INCREASING && maxResidualA < maxResidualB) ||
                    (state.residualSort.direction === ResidualSortDirection.DECREASING && maxResidualA > maxResidualB)
                ) {
                    return -1;
                }
                return 1;
            } else if (state.residualSort.field === ResidualSortField.FINAL) {
                const maxResidualA = Math.max(...tiepointsA.map((t) => Number(baseVector.distanceTo(new Vector2(...t.finalResidual)).toFixed(1))));
                const maxResidualB = Math.max(...tiepointsB.map((t) => Number(baseVector.distanceTo(new Vector2(...t.finalResidual)).toFixed(1))));
                if (
                    (state.residualSort.direction === ResidualSortDirection.INCREASING && maxResidualA < maxResidualB) ||
                    (state.residualSort.direction === ResidualSortDirection.DECREASING && maxResidualA > maxResidualB)
                ) {
                    return -1;
                }
                return 1;
            }

            return 0;
        });

        return trackIds;
    }, [state, imageTiepoints, activeImage]);

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>
                Tracks
            </h2>
            {activeTracks.map((trackId) => (
                <Track
                    key={trackId}
                    state={state}
                    contextMenu={contextMenu}
                    setContextMenu={setContextMenu}
                    activeImage={activeImage}
                    activeTrack={trackId}
                    isGrouped
                />
            ))}
        </div>
    );
}
