import { useState, useEffect } from 'react';
import { getFilesFromDataTransferItems } from '@placemarkio/flat-drop-files';
import { fileOpen } from 'browser-fs-access';

import { Track, Point, Tiepoint, Cameras, useData } from '@/stores/DataContext';

import * as styles from '@/components/Landing.css';

const parser = new DOMParser();

export default function Landing() {
    const { setTracks, setTiepoints, setCameras, setImages, setVICAR, setTiepointsFile } = useData();

    const [files, setFiles] = useState<File[]>([]);

    async function parseFiles() {
        for (const file of files) {
            if (file.type === 'text/xml') {
                const xmlString = await file.text();
                const xml = parser.parseFromString(xmlString, 'application/xml');
                if (xml.querySelector('tiepoint_file')) {
                    setTiepointsFile(xmlString);
                    handleTracks(xml);
                    handleTiepoints(xml);
                } else {
                    handleNavigation(xml);
                }
            } else if (file.type === 'image/png' || file.type === 'image/jpeg') {
                handleImage(file);
            } else {
                await handleVICAR(file);
            }
        }
    }

    function handleTracks(xml: XMLDocument) {
        const tiepoints = xml.querySelectorAll('tie');
        const newTracks: Track[] = [];

        let trackIndex = 0;
        let pointIndex = 0;

        for (const tiepoint of tiepoints.values()) {
            const trackId = Number(tiepoint.querySelector('track')!.getAttribute('id'));
            const currentTrack = newTracks.find((track) => track.trackId === trackId);

            if (!currentTrack) {
                const leftKey = Number(tiepoint.getAttribute('left_key'));
                const leftId = xml.querySelector(`image[key="${leftKey}"]`)!.getAttribute('unique_id');
                const leftPixel = tiepoint.querySelector('left');

                const leftInitialResidual = tiepoint.querySelector('left_init_residual');
                const leftFinalResidual = tiepoint.querySelector('left_final_residual');

                const pointLeft: Point = {
                    index: pointIndex,
                    id: leftId,
                    key: leftKey,
                    pixel: [Number(leftPixel!.getAttribute('samp')), Number(leftPixel!.getAttribute('line'))],
                    initialResidual: [
                        Number(leftInitialResidual!.getAttribute('samp')),
                        Number(leftInitialResidual!.getAttribute('line')),
                    ],
                    finalResidual: [
                        Number(leftFinalResidual!.getAttribute('samp')),
                        Number(leftFinalResidual!.getAttribute('line')),
                    ],
                } as Point;
                pointIndex++;

                const rightKey = Number(tiepoint.getAttribute('right_key'));
                const rightId = xml.querySelector(`image[key="${rightKey}"]`)!.getAttribute('unique_id');
                const rightPixel = tiepoint.querySelector('right');

                const rightInitialResidual = tiepoint.querySelector('right_init_residual');
                const rightFinalResidual = tiepoint.querySelector('right_final_residual');

                const pointRight: Point = {
                    index: pointIndex,
                    id: rightId,
                    key: rightKey,
                    pixel: [Number(rightPixel!.getAttribute('samp')), Number(rightPixel!.getAttribute('line'))],
                    initialResidual: [
                        Number(rightInitialResidual!.getAttribute('samp')),
                        Number(rightInitialResidual!.getAttribute('line')),
                    ],
                    finalResidual: [
                        Number(rightFinalResidual!.getAttribute('samp')),
                        Number(rightFinalResidual!.getAttribute('line')),
                    ],
                } as Point;
                pointIndex++;

                const initialXYZ = tiepoint.querySelector('init_xyz');
                const initialX = Number(initialXYZ!.getAttribute('x'));
                const initialY = Number(initialXYZ!.getAttribute('y'));
                const initialZ = Number(initialXYZ!.getAttribute('z'));

                const finalXYZ = tiepoint.querySelector('final_xyz');
                const finalX = Number(finalXYZ!.getAttribute('x'));
                const finalY = Number(finalXYZ!.getAttribute('y'));
                const finalZ = Number(finalXYZ!.getAttribute('z'));

                newTracks.push({
                    trackId,
                    index: trackIndex,
                    initialXYZ: [initialX, initialY, initialZ],
                    finalXYZ: [finalX, finalY, finalZ],
                    points: [pointLeft, pointRight],
                } as Track);
                trackIndex++;
            } else {
                const leftKey = Number(tiepoint.getAttribute('left_key'));
                const rightKey = Number(tiepoint.getAttribute('right_key'));

                if (!currentTrack.points.some((point) => point.key == leftKey)) {
                    const leftId = xml.querySelector(`image[key="${leftKey}"]`)!.getAttribute('unique_id');
                    const leftPixel = tiepoint.querySelector('left');

                    const leftInitialResidual = tiepoint.querySelector('left_init_residual');
                    const leftFinalResidual = tiepoint.querySelector('left_final_residual');

                    const pointLeft: Point = {
                        index: pointIndex,
                        id: leftId,
                        key: leftKey,
                        pixel: [Number(leftPixel!.getAttribute('samp')), Number(leftPixel!.getAttribute('line'))],
                        initialResidual: [
                            Number(leftInitialResidual!.getAttribute('samp')),
                            Number(leftInitialResidual!.getAttribute('line')),
                        ],
                        finalResidual: [
                            Number(leftFinalResidual!.getAttribute('samp')),
                            Number(leftFinalResidual!.getAttribute('line')),
                        ],
                    } as Point;
                    pointIndex++;

                    currentTrack.points.push(pointLeft);
                }

                if (!currentTrack.points.some((point) => point.key == rightKey)) {
                    const rightId = xml.querySelector(`image[key="${rightKey}"]`)!.getAttribute('unique_id');
                    const rightPixel = tiepoint.querySelector('right');

                    const rightInitialResidual = tiepoint.querySelector('right_init_residual');
                    const rightFinalResidual = tiepoint.querySelector('right_final_residual');

                    const pointRight: Point = {
                        index: pointIndex,
                        id: rightId,
                        key: rightKey,
                        pixel: [Number(rightPixel!.getAttribute('samp')), Number(rightPixel!.getAttribute('line'))],
                        initialResidual: [
                            Number(rightInitialResidual!.getAttribute('samp')),
                            Number(rightInitialResidual!.getAttribute('line')),
                        ],
                        finalResidual: [
                            Number(rightFinalResidual!.getAttribute('samp')),
                            Number(rightFinalResidual!.getAttribute('line')),
                        ],
                    } as Point;
                    pointIndex++;

                    currentTrack.points.push(pointRight);
                }
            }
        }

        setTracks(newTracks);
    }

    function handleTiepoints(xml: XMLDocument) {
        const tiepoints = xml.querySelectorAll('tie');
        const newTiepoints = [];

        for (const [index, tiepoint] of tiepoints.entries()) {
            const leftKey = Number(tiepoint.getAttribute('left_key'));
            const rightKey = Number(tiepoint.getAttribute('right_key'));

            const leftId = xml.querySelector(`image[key="${leftKey}"]`)!.getAttribute('unique_id');
            const rightId = xml.querySelector(`image[key="${rightKey}"]`)!.getAttribute('unique_id');

            const leftPixel = tiepoint.querySelector('left');
            const rightPixel = tiepoint.querySelector('right');

            const trackId = Number(tiepoint.querySelector('track')!.getAttribute('id'));

            const initialXYZ = tiepoint.querySelector('init_xyz');
            const initialX = Number(initialXYZ!.getAttribute('x'));
            const initialY = Number(initialXYZ!.getAttribute('y'));
            const initialZ = Number(initialXYZ!.getAttribute('z'));

            const finalXYZ = tiepoint.querySelector('final_xyz');
            const finalX = Number(finalXYZ!.getAttribute('x'));
            const finalY = Number(finalXYZ!.getAttribute('y'));
            const finalZ = Number(finalXYZ!.getAttribute('z'));

            const leftInitialResidual = tiepoint.querySelector('left_init_residual');
            const rightInitialResidual = tiepoint.querySelector('right_init_residual');

            const leftFinalResidual = tiepoint.querySelector('left_final_residual');
            const rightFinalResidual = tiepoint.querySelector('right_final_residual');

            newTiepoints.push({
                index,
                trackId,
                leftId,
                rightId,
                leftKey,
                rightKey,
                initialXYZ: [initialX, initialY, initialZ],
                finalXYZ: [finalX, finalY, finalZ],
                leftPixel: [Number(leftPixel!.getAttribute('samp')), Number(leftPixel!.getAttribute('line'))],
                rightPixel: [Number(rightPixel!.getAttribute('samp')), Number(rightPixel!.getAttribute('line'))],
                initialResidual: [
                    Number(leftInitialResidual!.getAttribute('samp')) +
                        Number(rightInitialResidual!.getAttribute('samp')),
                    Number(leftInitialResidual!.getAttribute('line')) +
                        Number(rightInitialResidual!.getAttribute('line')),
                ],
                finalResidual: [
                    Number(leftFinalResidual!.getAttribute('samp')) + Number(rightFinalResidual!.getAttribute('samp')),
                    Number(leftFinalResidual!.getAttribute('line')) + Number(rightFinalResidual!.getAttribute('line')),
                ],
            } as Tiepoint);
        }

        setTiepoints(newTiepoints);
    }

    function handleNavigation(xml: XMLDocument) {
        const solutions = xml.querySelectorAll('solution');
        const newCameras: Cameras = {};

        for (const image of solutions) {
            const imageId = image.querySelector('image')!.getAttribute('unique_id')!;

            const initialCamera = image.querySelector('original_camera_model');
            const initialC = initialCamera!.querySelector('parameter[id="C"]')!;
            const initialA = initialCamera!.querySelector('parameter[id="A"]')!;
            const initialH = initialCamera!.querySelector('parameter[id="H"]')!;
            const initialFrame = initialCamera!.querySelector('reference_frame')!;

            const finalCamera = image.querySelector('camera_model');
            const finalC = finalCamera!.querySelector('parameter[id="C"]')!;
            const finalA = finalCamera!.querySelector('parameter[id="A"]')!;
            const finalH = finalCamera!.querySelector('parameter[id="H"]')!;
            const finalFrame = finalCamera!.querySelector('reference_frame')!;

            newCameras[imageId] = {
                initial: {
                    C: [
                        Number(initialC.getAttribute('value1')),
                        Number(initialC.getAttribute('value2')),
                        Number(initialC.getAttribute('value3')),
                    ],
                    A: [
                        Number(initialA.getAttribute('value1')),
                        Number(initialA.getAttribute('value2')),
                        Number(initialA.getAttribute('value3')),
                    ],
                    H: [
                        Number(initialH.getAttribute('value1')),
                        Number(initialH.getAttribute('value2')),
                        Number(initialH.getAttribute('value3')),
                    ],
                    frame: {
                        name: initialFrame.getAttribute('name')!,
                        index: initialFrame.getAttribute('index1')!,
                    },
                },
                final: {
                    C: [
                        Number(finalC.getAttribute('value1')),
                        Number(finalC.getAttribute('value2')),
                        Number(finalC.getAttribute('value3')),
                    ],
                    A: [
                        Number(finalA.getAttribute('value1')),
                        Number(finalA.getAttribute('value2')),
                        Number(finalA.getAttribute('value3')),
                    ],
                    H: [
                        Number(finalH.getAttribute('value1')),
                        Number(finalH.getAttribute('value2')),
                        Number(finalH.getAttribute('value3')),
                    ],
                    frame: {
                        name: finalFrame.getAttribute('name')!,
                        index: finalFrame.getAttribute('index1')!,
                    },
                },
            };
        }

        setCameras(newCameras);
    }

    function handleImage(file: File) {
        const url = URL.createObjectURL(file);
        setImages((oldImages) => [...oldImages, { name: file.name, url }]);
    }

    async function handleVICAR(file: File) {
        const text = await file.text();
        const metadata = text
            .split(/(\s+)/)
            .map((t) => t.trim())
            .filter(Boolean);
        setVICAR((v) => ({ ...v, [file.name]: metadata }));
    }

    async function handleClick() {
        const file = await fileOpen();
        setFiles((oldFiles) => oldFiles.filter((f) => f.name !== file.name).concat([file]));
    }

    async function handleDrop(event: React.DragEvent) {
        event.preventDefault();
        const newFiles = await getFilesFromDataTransferItems(event.dataTransfer.items);
        const newFilenames = newFiles.map((f) => f.name);
        setFiles((oldFiles) => oldFiles.filter((f) => !newFilenames.includes(f.name)).concat(newFiles));
    }

    function disableEvent(event: React.DragEvent) {
        event.preventDefault();
    }

    useEffect(() => {
        if (files.length > 0) {
            parseFiles();
        }
    }, [files]);

    return (
        <main className={styles.container}>
            <div
                className={styles.zone}
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={disableEvent}
                onDragEnter={disableEvent}
            >
                <p>Please upload the tie-point file, navigation file, VICAR folder, and image folder.</p>
            </div>
            <section className={styles.header}>
                <h1 className={styles.title}>VECTOR</h1>
                <p className={styles.body}>
                    Visualization and Editing of Camera Tiepoints, Orientations, and Residuals
                </p>
            </section>
        </main>
    );
}
