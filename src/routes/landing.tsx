import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFilesFromDataTransferItems } from '@placemarkio/flat-drop-files';
import { fileOpen } from 'browser-fs-access';

import { Track, Point, Cameras, useData } from '@/stores/DataContext';

import * as styles from '@/routes/landing.css';

const parser = new DOMParser();

export default function Landing() {
    const navigate = useNavigate();

    const { tracks, setTracks, cameras, setCameras, setImages, vicar, setVICAR } = useData();

    const [files, setFiles] = useState<File[]>([]);

    const parseFiles = async () => {
        for (const file of files) {
            if (file.type === 'text/xml') {
                const xmlString = await file.text();
                const xml = parser.parseFromString(xmlString, 'application/xml');
                if (xml.querySelector('tiepoint_file')) {
                    handleTracks(xml);
                } else {
                    handleNavigation(xml);
                }
            } else if (file.type === 'image/png' || file.type === 'image/jpeg') {
                handleImage(file);
            } else {
                await handleVICAR(file);
            }
        }
    };

    const handleTracks = (xml: XMLDocument) => {
        const tiepoints = xml.querySelectorAll('tie');
        const newTracks: Track[] = [];

        let pointIndex = 0;

        for (const tiepoint of tiepoints.values()) {
            const trackId = tiepoint.querySelector('track')!.getAttribute('id')!;
            const currentTrack = newTracks.find((track) => track.id === trackId);

            if (!currentTrack) {
                const leftKey = Number(tiepoint.getAttribute('left_key'));
                const leftImageName = xml.querySelector(`image[key="${leftKey}"]`)!.getAttribute('unique_id')!;
                const leftPixel = tiepoint.querySelector('left');

                const leftInitialResidual = tiepoint.querySelector('left_init_residual');
                const leftFinalResidual = tiepoint.querySelector('left_final_residual');

                const leftInitialResidualX = Number(leftInitialResidual!.getAttribute('samp'));
                const leftInitialResidualY = Number(leftInitialResidual!.getAttribute('line'));

                const leftFinalResidualX = Number(leftFinalResidual!.getAttribute('samp'));
                const leftFinalResidualY = Number(leftFinalResidual!.getAttribute('line'));

                const pointLeft: Point = {
                    index: pointIndex,
                    imageName: leftImageName,
                    key: leftKey,
                    pixel: [Number(leftPixel!.getAttribute('samp')), Number(leftPixel!.getAttribute('line'))],
                    initialResidual: [leftInitialResidualX, leftInitialResidualY],
                    initialResidualLength: Math.sqrt(
                        leftInitialResidualX * leftInitialResidualX + leftInitialResidualY * leftInitialResidualY,
                    ),
                    finalResidual: [leftFinalResidualX, leftFinalResidualY],
                    finalResidualLength: Math.sqrt(
                        leftFinalResidualX * leftFinalResidualX + leftFinalResidualY * leftFinalResidualY,
                    ),
                };
                pointIndex++;

                const rightKey = Number(tiepoint.getAttribute('right_key'));
                const rightImageName = xml.querySelector(`image[key="${rightKey}"]`)!.getAttribute('unique_id')!;
                const rightPixel = tiepoint.querySelector('right');

                const rightInitialResidual = tiepoint.querySelector('right_init_residual');
                const rightFinalResidual = tiepoint.querySelector('right_final_residual');

                const rightInitialResidualX = Number(rightInitialResidual!.getAttribute('samp'));
                const rightInitialResidualY = Number(rightInitialResidual!.getAttribute('line'));

                const rightFinalResidualX = Number(rightFinalResidual!.getAttribute('samp'));
                const rightFinalResidualY = Number(rightFinalResidual!.getAttribute('line'));

                const pointRight: Point = {
                    index: pointIndex,
                    imageName: rightImageName,
                    key: rightKey,
                    pixel: [Number(rightPixel!.getAttribute('samp')), Number(rightPixel!.getAttribute('line'))],
                    initialResidual: [rightInitialResidualX, rightInitialResidualY],
                    initialResidualLength: Math.sqrt(
                        rightInitialResidualX * rightInitialResidualX + rightInitialResidualY * rightInitialResidualY,
                    ),
                    finalResidual: [rightFinalResidualX, rightFinalResidualY],
                    finalResidualLength: Math.sqrt(
                        rightFinalResidualX * rightFinalResidualX + rightFinalResidualY * rightFinalResidualY,
                    ),
                };
                pointIndex++;

                const initialXYZ = tiepoint.querySelector('init_xyz');
                const initialX = Number(initialXYZ!.getAttribute('x'));
                const initialY = Number(initialXYZ!.getAttribute('y'));
                const initialZ = Number(initialXYZ!.getAttribute('z'));

                const finalXYZ = tiepoint.querySelector('final_xyz');
                const finalX = Number(finalXYZ!.getAttribute('x'));
                const finalY = Number(finalXYZ!.getAttribute('y'));
                const finalZ = Number(finalXYZ!.getAttribute('z'));

                const newTrack: Track = {
                    id: trackId,
                    initialXYZ: [initialX, initialY, initialZ],
                    finalXYZ: [finalX, finalY, finalZ],
                    points: [pointLeft, pointRight],
                };

                newTracks.push(newTrack);
            } else {
                const leftKey = Number(tiepoint.getAttribute('left_key'));
                const rightKey = Number(tiepoint.getAttribute('right_key'));

                if (!currentTrack.points.some((point) => point.key == leftKey)) {
                    const imageName = xml.querySelector(`image[key="${leftKey}"]`)!.getAttribute('unique_id')!;
                    const pixel = tiepoint.querySelector('left');

                    const initialResidual = tiepoint.querySelector('left_init_residual');
                    const finalResidual = tiepoint.querySelector('left_final_residual');

                    const initialResidualX = Number(initialResidual!.getAttribute('samp'));
                    const initialResidualY = Number(initialResidual!.getAttribute('line'));

                    const finalResidualX = Number(finalResidual!.getAttribute('samp'));
                    const finalResidualY = Number(finalResidual!.getAttribute('line'));

                    const point: Point = {
                        imageName,
                        index: pointIndex,
                        key: leftKey,
                        pixel: [Number(pixel!.getAttribute('samp')), Number(pixel!.getAttribute('line'))],
                        initialResidual: [initialResidualX, initialResidualY],
                        initialResidualLength: Math.sqrt(
                            initialResidualX * initialResidualX + initialResidualY * initialResidualY,
                        ),
                        finalResidual: [finalResidualX, finalResidualY],
                        finalResidualLength: Math.sqrt(
                            finalResidualX * finalResidualX + finalResidualY * finalResidualY,
                        ),
                    };
                    pointIndex++;

                    currentTrack.points.push(point);
                }

                if (!currentTrack.points.some((point) => point.key == rightKey)) {
                    const imageName = xml.querySelector(`image[key="${rightKey}"]`)!.getAttribute('unique_id')!;
                    const pixel = tiepoint.querySelector('right');

                    const initialResidual = tiepoint.querySelector('right_init_residual');
                    const finalResidual = tiepoint.querySelector('right_final_residual');

                    const initialResidualX = Number(initialResidual!.getAttribute('samp'));
                    const initialResidualY = Number(initialResidual!.getAttribute('line'));

                    const finalResidualX = Number(finalResidual!.getAttribute('samp'));
                    const finalResidualY = Number(finalResidual!.getAttribute('line'));

                    const pointRight: Point = {
                        imageName,
                        index: pointIndex,
                        key: rightKey,
                        pixel: [Number(pixel!.getAttribute('samp')), Number(pixel!.getAttribute('line'))],
                        initialResidual: [initialResidualX, initialResidualY],
                        initialResidualLength: Math.sqrt(
                            initialResidualX * initialResidualX + initialResidualY * initialResidualY,
                        ),
                        finalResidual: [finalResidualX, finalResidualY],
                        finalResidualLength: Math.sqrt(
                            finalResidualX * finalResidualX + finalResidualY * finalResidualY,
                        ),
                    };
                    pointIndex++;

                    currentTrack.points.push(pointRight);
                }
            }
        }

        setTracks(newTracks);
    };

    const handleNavigation = (xml: XMLDocument) => {
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
    };

    const handleImage = (file: File) => {
        const url = URL.createObjectURL(file);
        setImages((oldImages) => [...oldImages, { name: file.name, url }]);
    };

    const handleVICAR = async (file: File) => {
        const text = await file.text();
        const metadata = text
            .split(/(\s+)/)
            .map((t) => t.trim())
            .filter(Boolean);
        setVICAR((v) => ({ ...v, [file.name]: metadata }));
    };

    const handleClick = async () => {
        const file = await fileOpen();
        setFiles((oldFiles) => oldFiles.filter((f) => f.name !== file.name).concat([file]));
    };

    const handleDrop = async (event: React.DragEvent) => {
        event.preventDefault();
        const newFiles = await getFilesFromDataTransferItems(event.dataTransfer.items);
        const newFilenames = newFiles.map((f) => f.name);
        setFiles((oldFiles) => oldFiles.filter((f) => !newFilenames.includes(f.name)).concat(newFiles));
    };

    const disableEvent = (event: React.DragEvent) => {
        event.preventDefault();
    };

    useEffect(() => {
        if (files.length > 0) {
            parseFiles();
        }
    }, [files]);

    useEffect(() => {
        if (tracks.length > 0 && Object.keys(cameras).length > 0 && Object.keys(vicar).length > 0) {
            navigate('/overview');
        }
    }, [tracks, cameras, vicar]);

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
