import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import cn from 'classnames';

import { useData } from '@/stores/DataContext';
import { useFilters } from '@/stores/FiltersContext';

import { theme } from '@/theme.css';
import { H2 } from '@/styles/headers.css';
import * as styles from '@/components/TiepointImage.css';

export default function TiepointImage() {
    const { cameraId } = useParams();

    const { cameraMap: cameraImageMap, cameraTrackMap } = useData();
    const { filterState } = useFilters();

    if (!cameraId || !(cameraId in cameraImageMap)) {
        return null;
    }

    const image = useMemo<HTMLImageElement>(() => {
        const element = new Image();
        element.src = cameraImageMap[cameraId].imageURL;
        return element;
    }, [cameraId]);

    const stage = (canvas: HTMLCanvasElement | null) => {
        if (canvas && image) {
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Failed to create 2D context for TiepointImage');

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();

            // Preserve aspect ratio with dynamic sizing.
            // This will prevent image distortion.
            const aspectRatio = image.width / image.height;
            canvas.style.width = `${canvas.offsetHeight * aspectRatio}px`;

            // Draw image.
            ctx.drawImage(image, 0, 0);

            // Draw Residuals
            const tracks = cameraTrackMap[cameraId];
            for (const track of tracks) {
                for (const point of track.points) {
                    if (point.cameraId === cameraId) {
                        let isResidualDrawn = false;

                        // Draw initial residual.
                        if (
                            filterState.viewInitialResiduals &&
                            filterState.minResidualLength <= point.initialResidualLength &&
                            filterState.maxResidualLength >= point.initialResidualLength
                        ) {
                            ctx.beginPath();
                            ctx.strokeStyle = theme.color.initialHex;
                            ctx.lineWidth = 2;
                            ctx.moveTo(point.pixel[0], point.pixel[1]);
                            ctx.lineTo(
                                point.pixel[0] + point.initialResidual[0],
                                point.pixel[1] + point.initialResidual[1],
                            );
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
                            ctx.lineWidth = 2;
                            ctx.moveTo(point.pixel[0], point.pixel[1]);
                            ctx.lineTo(
                                point.pixel[0] + point.finalResidual[0],
                                point.pixel[1] + point.finalResidual[1],
                            );
                            ctx.stroke();
                            isResidualDrawn = true;
                        }

                        // Draw pixel as circle.
                        if (isResidualDrawn) {
                            ctx.beginPath();
                            ctx.arc(point.pixel[0], point.pixel[1], 2, 0, Math.PI * 2, true);
                            ctx.fill();
                        }
                    }
                }
            }
        }
    };

    return (
        <section className={styles.container}>
            <h2 className={cn(H2, styles.header)}>Image ID: {cameraId}</h2>
            <div className={styles.image}>
                <canvas ref={stage} className={styles.canvas} width={image?.width} height={image?.height} />
            </div>
        </section>
    );
}
