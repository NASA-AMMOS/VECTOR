import { useState, useMemo, useCallback, useEffect } from 'react';
import cn from 'classnames';
import SlopeChart from '@/components/SlopeChart';
import { PageType, Tiepoint, useData } from '@/DataContext';
import { theme } from '@/utils/theme.css';
import * as styles from '@/components/Tracks.css';

function Stage({ activeTrack }) {
    const height = 400;
    const padding = 40;
    const offset = 10;

    const { tiepoints, imageTiepoints, getImageURL } = useData();

    const [images, setImages] = useState<HTMLImageElement[]>([]);

    const activeTiepoints = useMemo<Tiepoint[]>(() => tiepoints.filter((t) => t.trackId === activeTrack), [tiepoints, activeTrack]);

    const imageURLs = useMemo(() => {
        // Convert Array to Set to remove duplicates and back to Array for manipulation.
        const imageIds = [...new Set(activeTiepoints.map((t) => [t.leftId, t.rightId]).flat())];
        return imageIds.map((id) => [id, getImageURL(id)]);
    }, [activeTiepoints, getImageURL]);

    const stage = useCallback((canvas) => {
        if (canvas && activeTiepoints.length > 0 && images.length > 0) {
            const ctx = canvas.getContext('2d');

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
                const leftImage = images.find((image) => image[0] === leftId)[1];
                const rightImage = images.find((image) => image[0] === rightId)[1];

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
                    ...leftPixel.map((p) => p - offset),     // Top-Left Corner
                    offset * 2, offset * 2,                  // Crop Area
                    (count * height) + (count * padding), 0, // Canvas Location
                    height, height                           // Width & Height
                );

                // Draw main tiepoint.
                let imageCenter = [(count * height) + (count * padding) + (height / 2), height / 2];
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
                    ...rightPixel.map((p) => p - offset),    // Top-Left Corner
                    offset * 2, offset * 2,                  // Crop Area
                    (count * height) + (count * padding), 0, // Canvas Location
                    height, height                           // Width & Height
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

    function drawTiepoint(ctx, position, count, initialResidual, finalResidual) {
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
        }));
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
        }));
        ctx.stroke();
    }

    useEffect(() => {
        if (imageURLs) {;
            const newImages = [];
            for (const [id, imageURL] of imageURLs) {
                const newImage = new Image();
                newImage.onload = () => {
                    newImages.push([id, newImage]);
                    if (newImages.length === imageURLs.length) {
                        setImages(newImages);
                    }
                };
                newImage.src = imageURL;
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

export function Track({ dispatch, activeImage, activeTrack, isGrouped }) {
    const { setActiveTrack } = useData();

    function handleClick() {
        dispatch({ type: PageType.TRACK });
        setActiveTrack(activeTrack);
    }

    return (
        <div
            key={activeTrack}
            className={cn(styles.track, { [styles.trackSpacing]: isGrouped, [styles.trackWidth]: !isGrouped })}
            onClick={handleClick}
        >
            {isGrouped && (
                <>
                    <h3 className={styles.subheader}>
                        ID: {activeTrack}
                    </h3>
                    <div className={styles.slope}>
                        <SlopeChart
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

function Tracks({ dispatch }) {
    const { imageTiepoints, activeImage } = useData();

    const activeTracks = useMemo(() => {
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
                    dispatch={dispatch}
                    activeImage={activeImage}
                    activeTrack={trackId}
                    isGrouped
                />
            ))}
        </div>
    );
}

export default Tracks;
