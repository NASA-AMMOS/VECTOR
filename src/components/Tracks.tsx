import { useState, useMemo, useCallback, useEffect } from 'react';
import cn from 'classnames';
import SlopeChart from '@/components/SlopeChart';
import { PageAction, PageType } from '@/App';
import { Tiepoint, useData } from '@/DataContext';
import { theme } from '@/utils/theme.css';
import * as styles from '@/components/Tracks.css';

interface TrackState {
    isRelative: boolean;
    residualMin: number;
    residualMax: number;
};

interface StageProps {
    activeTrack: number | null;
};

interface TrackProps {
    state: TrackState;
    route: React.Dispatch<PageAction>;
    activeImage: string | null;
    activeTrack: number | null;
    isGrouped?: boolean;
};

interface TracksProps {
    state: TrackState;
    route: React.Dispatch<PageAction>;
};

function Stage({ activeTrack }: StageProps) {
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

            // Calculate total height from scalable value.
            // Calculate total width from n tiepoints with padding.
            const width = height * (activeTiepoints.length * 2) + (activeTiepoints.length * 2 - 1) * padding;
            canvas.height = height;
            canvas.width = width;

            // Update CSS width based on canvas proportion.
            const heightRatio = canvas.offsetHeight / height;
            canvas.style.width = `${canvas.width * heightRatio}px`;

            // Go through each tiepoint and draw both images related to each tiepoint.
            let count = 0;
            for (const tiepoint of activeTiepoints) {
                const { leftId, rightId, leftPixel, rightPixel, initialResidual, finalResidual } = tiepoint;

                // Find the correct images for this tiepoint.
                let leftImage = images.find((image) => image[0] === leftId)![1];
                const rightImage = images.find((image) => image[0] === rightId)![1];

                // Get nearest tiepoints based on offset per image.
                const leftImageTiepoints = imageTiepoints[leftId].filter((t) => {
                    const pixel = tiepoint.leftId === leftId ? tiepoint.leftPixel : tiepoint.rightPixel;
                    if (pixel[0] - leftPixel[0] > offset || pixel[1] - leftPixel[1] > offset) {
                        return false;
                    }
                    return true;
                });
                const rightImageTiepoints = imageTiepoints[rightId].filter((t) => {
                    const pixel = tiepoint.leftId === rightId ? tiepoint.leftPixel : tiepoint.rightPixel;
                    if (pixel[0] - rightPixel[0] > offset || pixel[1] - rightPixel[1] > offset) {
                        return false;
                    }
                    return true;
                });

                // Crop image correctly to tiepoint location.
                ctx.drawImage(leftImage,
                    ...leftPixel.map((p) => p - offset) as [number, number], // Top-Left Corner
                    offset * 2, offset * 2,                                  // Crop Area
                    (count * height) + (count * padding), 0,                 // Canvas Location
                    height, height                                           // Width & Height
                );

                // Draw main tiepoint.
                let imageCenter: [number, number] = [(count * height) + (count * padding) + (height / 2), height / 2];
                drawTiepoint(ctx, imageCenter, count, initialResidual, finalResidual);

                // Draw relevant tiepoints
                for (const leftTiepoint of leftImageTiepoints) {
                    const pixel = leftTiepoint.leftId === leftId ? leftTiepoint.leftPixel : leftTiepoint.rightPixel;
                    const xOffset = leftPixel[0] - pixel[0];
                    const yOffset = leftPixel[1] - pixel[1];
                    imageCenter[0] -= xOffset;
                    imageCenter[1] -= yOffset;
                    drawTiepoint(ctx, imageCenter, count, leftTiepoint.initialResidual, leftTiepoint.finalResidual);
                }
                count++;

                // Draw sibling image.
                ctx.drawImage(rightImage,
                    ...rightPixel.map((p) => p - offset) as [number, number], // Top-Left Corner
                    offset * 2, offset * 2,                                   // Crop Area
                    (count * height) + (count * padding), 0,                  // Canvas Location
                    height, height                                            // Width & Height
                );
                imageCenter = [(count * height) + (count * padding) + (height / 2), height / 2];
                drawTiepoint(ctx, imageCenter, count, initialResidual, finalResidual);
                for (const rightTiepoint of rightImageTiepoints) {
                    const pixel = rightTiepoint.rightId === rightId ? rightTiepoint.leftPixel : rightTiepoint.rightPixel;
                    const xOffset = rightPixel[0] - pixel[0];
                    const yOffset = rightPixel[1] - pixel[1];
                    imageCenter[0] -= xOffset;
                    imageCenter[1] -= yOffset;
                    drawTiepoint(ctx, imageCenter, count, rightTiepoint.initialResidual, rightTiepoint.finalResidual);
                }
                count++;
            }
        }
    }, [activeTiepoints, images]);

    function drawTiepoint(
        ctx: CanvasRenderingContext2D,
        position: [number, number],
        count: number,
        initialResidual: [number, number],
        finalResidual: [number, number]
    ) {
        if (
            position[0] < (count * height) + (count * padding) ||
            position[0] > (count * height) + (count * padding) + height
        ) return;

        // Draw pixel as circle.
        ctx.beginPath();
        ctx.arc(...position, 15, 0, Math.PI * 2, true);
        ctx.fill();

        // Draw initial residual.
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

        // Draw final residual.
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

export function Track({ state, route, activeImage, activeTrack, isGrouped }: TrackProps) {
    const { setActiveTrack } = useData();

    function handleClick() {
        route({ type: PageType.TRACK });
        setActiveTrack(activeTrack);
    }

    return (
        <div
            key={activeTrack}
            className={cn(styles.track, { [styles.trackSpacing]: isGrouped, [styles.trackWidth]: !isGrouped })}
            onClick={handleClick}
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
                        />
                    </div>
                </>
            )}
            <Stage activeTrack={activeTrack} />
        </div>
    )
}

export default function Tracks({ state, route }: TracksProps) {
    const { imageTiepoints, activeImage } = useData();

    const activeTracks = useMemo<number[]>(() => {
        if (Object.keys(imageTiepoints).length === 0 || !activeImage) {
            return [];
        } else {
            return [...new Set(imageTiepoints[activeImage].map((t) => t.trackId))];
        }
    }, [imageTiepoints, activeImage]);

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>
                Tracks
            </h2>
            {activeTracks.map((trackId) => (
                <Track
                    key={trackId}
                    state={state}
                    route={route}
                    activeImage={activeImage}
                    activeTrack={trackId}
                    isGrouped
                />
            ))}
        </div>
    );
}
