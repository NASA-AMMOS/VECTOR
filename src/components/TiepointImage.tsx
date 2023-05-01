import { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import cn from 'classnames';

import { useData } from '@/stores/DataContext';
import { useFilters } from '@/stores/FiltersContext';

import { theme } from '@/theme.css';
import { H2 } from '@/styles/headers.css';
import * as styles from '@/components/TiepointImage.css';

export default function TiepointImage() {
    const { cameraId } = useParams();

    const { cameraImageMap, cameraTrackMap } = useData();
    const { filterState, guardInitialPoint, guardFinalPoint } = useFilters();

    if (!cameraId || !(cameraId in cameraImageMap)) {
        return null;
    }

    const image = useMemo(() => {
        const newImage = new Image();
        newImage.src = cameraImageMap[cameraId].url;
        return newImage;
    }, [cameraId, cameraImageMap]);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const scaleRef = useRef<number>(1);
    const activeDragRef = useRef<boolean>(false);
    const dragOffsetRef = useRef<[number, number]>([0, 0]);
    const translationRef = useRef<[number, number]>([0, 0]);

    const draw = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to create 2D context for TiepointImage');

        canvas.width = image.width;
        canvas.height = image.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scaleRef.current, scaleRef.current);
        ctx.translate(-(canvas.width / 2), -(canvas.height / 2));

        const translation = translationRef.current;
        ctx.translate(translation[0], translation[1]);

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
                    if (guardInitialPoint(point)) {
                        ctx.beginPath();
                        ctx.strokeStyle = theme.color.initialHex;
                        ctx.lineWidth = 2;
                        ctx.moveTo(point.pixel[0], point.pixel[1]);
                        ctx.lineTo(
                            point.pixel[0] + point.initialResidual[0] * filterState.residualScale,
                            point.pixel[1] + point.initialResidual[1] * filterState.residualScale,
                        );
                        ctx.stroke();
                        isResidualDrawn = true;
                    }

                    // Draw final residual.
                    if (guardFinalPoint(point)) {
                        ctx.beginPath();
                        ctx.strokeStyle = theme.color.finalHex;
                        ctx.lineWidth = 2;
                        ctx.moveTo(point.pixel[0], point.pixel[1]);
                        ctx.lineTo(
                            point.pixel[0] + point.finalResidual[0] * filterState.residualScale,
                            point.pixel[1] + point.finalResidual[1] * filterState.residualScale,
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
    };

    const handleWheel = (event: WheelEvent) => {
        scaleRef.current += event.deltaY * -0.001;
        scaleRef.current = Math.min(Math.max(1, scaleRef.current), 10);
        draw();
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (activeDragRef.current) {
            translationRef.current[0] = event.clientX - dragOffsetRef.current[0];
            translationRef.current[1] = event.clientY - dragOffsetRef.current[1];
            draw();
        }
    };

    const handleMouseDown = (event: MouseEvent) => {
        if (event.button === 1) {
            activeDragRef.current = true;
            dragOffsetRef.current[0] = event.clientX - translationRef.current[0];
            dragOffsetRef.current[1] = event.clientY - translationRef.current[1];
        }
    };

    const clearActiveDrag = () => {
        activeDragRef.current = false;
    };

    const stage = (canvas: HTMLCanvasElement | null) => {
        if (canvas) {
            canvasRef.current = canvas;

            canvas.addEventListener('wheel', handleWheel);

            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mousemove', handleMouseMove);

            canvas.addEventListener('mouseup', clearActiveDrag);
            canvas.addEventListener('mouseover', clearActiveDrag);
            canvas.addEventListener('mouseout', clearActiveDrag);

            draw();
        }
    };

    useEffect(() => {
        return () => {
            if (canvasRef.current) {
                const canvas = canvasRef.current;

                canvas.removeEventListener('wheel', handleWheel);

                canvas.removeEventListener('mousedown', handleMouseDown);
                canvas.removeEventListener('mousemove', handleMouseMove);

                canvas.removeEventListener('mouseup', clearActiveDrag);
                canvas.removeEventListener('mouseover', clearActiveDrag);
                canvas.removeEventListener('mouseout', clearActiveDrag);
            }
        };
    }, []);

    return (
        <section className={styles.container}>
            <h2 className={cn(H2, styles.header)}>Image ID: {cameraId}</h2>
            <div className={styles.image}>
                <canvas ref={stage} className={styles.canvas} />
            </div>
        </section>
    );
}
