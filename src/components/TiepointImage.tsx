import { useState, useMemo, useCallback, useEffect } from 'react';
import { Vector2 } from 'three';

import { Tiepoint, useData } from '@/stores/DataContext';

import { theme } from '@/utils/theme.css';
import * as styles from '@/components/TiepointImage.css';

const baseVector = new Vector2();

interface TiepointImageState {
    isInitial: boolean;
    isFinal: boolean;
    residualMin: number;
    residualMax: number;
    residualScale: number;
};

interface TiepointImageProps {
    state: TiepointImageState;
};

export default function TiepointImage({ state }: TiepointImageProps) {
    const { imageTiepoints, activeImage, getImageURL } = useData();

    const [image, setImage] = useState<HTMLImageElement>(null!);

    const imageURL = useMemo<string | null>(() => activeImage && getImageURL(activeImage), [activeImage, getImageURL]);

    const activeTiepoints = useMemo<Tiepoint[] | never[]>(() => {
        if (activeImage) {
            return imageTiepoints[activeImage];
        }
        return [];
    }, [imageTiepoints, activeImage]);    

    useEffect(() => {
        if (imageURL) {
            const newImage = new Image();
            newImage.onload = () => {
                setImage(newImage);
            };
            newImage.src = imageURL;
        }
    }, [imageURL]);

    const stage = useCallback((canvas: HTMLCanvasElement) => {
        if (canvas && image) {
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error();

            // Clear canvas.
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();

            // Preserve aspect ratio w/ dynamic sizing.
            // This will prevent image distortion.
            const aspectRatio = image.width / image.height;
            canvas.style.width = `${canvas.offsetHeight * aspectRatio}px`;

            // Draw image.
            ctx.drawImage(image, 0, 0);

            // Draw Residuals
            for (const tiepoint of activeTiepoints) {
                const { initialResidual, finalResidual } = tiepoint;

                // Calculate residual distance for filtering.
                const initialDistance = Number(baseVector.distanceTo(new Vector2(...initialResidual)).toFixed(1));
                const finalDistance = Number(baseVector.distanceTo(new Vector2(...finalResidual)).toFixed(1));

                // Check which pixel to use for the active image.
                const pixel = tiepoint.leftId === activeImage ? tiepoint.leftPixel : tiepoint.rightPixel;

                let isResidualRendered = false;

                // Draw initial residual.
                if (
                    state.isInitial &&
                    (!state.residualMin || (state.residualMin && state.residualMin <= initialDistance)) && 
                    (!state.residualMax || (state.residualMax && state.residualMax >= initialDistance))
                ) {
                    ctx.beginPath();
                    ctx.strokeStyle = theme.color.initialHex;
                    ctx.lineWidth = 2;
                    ctx.moveTo(...pixel);
                    ctx.lineTo(...pixel.map((p, i) => (p + initialResidual[i]) * state.residualScale) as [number, number]);
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
                    ctx.lineWidth = 2;
                    ctx.moveTo(...pixel);
                    ctx.lineTo(...pixel.map((p, i) => (p + finalResidual[i]) * state.residualScale) as [number, number]);
                    ctx.stroke();
                    isResidualRendered = true;
                }

                // Draw pixel as circle.
                if (isResidualRendered) {
                    ctx.beginPath();
                    ctx.arc(...pixel, 2.5 * state.residualScale, 0, Math.PI * 2, true);
                    ctx.fill();
                }
            }
        }
    }, [state, image, activeTiepoints]);

    return (
        <section className={styles.container}>
            <h2 className={styles.header}>
                Image ID: {activeImage}
            </h2>
            <canvas
                ref={stage}
                className={styles.stage}
                width={image?.width}
                height={image?.height}
            />
        </section>
    );
}
