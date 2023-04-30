import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';

import { FormatType } from '@/format/Format';
import JPLFormat from '@/format/JPLFormat';
import VECTORFormat from '@/format/VECTORFormat';

import { LoaderType } from '@/loaders/Loader';
import XMLLoader from '@/loaders/XMLLoader';
import ImageLoader from '@/loaders/ImageLoader';

import { useData } from '@/stores/DataContext';

import Checkbox from '@/components/Checkbox';

import * as styles from '@/routes/landing.css';
import { Body, H2 } from '@/styles/headers.css';

export default function Landing() {
    const navigate = useNavigate();

    const { tracks, setTracks, cameras, setCameras, images, setImages } = useData();

    const [validImages, setValidImages] = useState(false);

    const validateFiles = async (files: File[]) => {
        await Promise.all(
            files.map(async (file) => {
                switch (file.type) {
                    case 'text/xml':
                        const xml = await XMLLoader.load(file);

                        const format = XMLLoader.inferFormat(xml);
                        const type = XMLLoader.inferType(xml, format);

                        let fileFormat;
                        switch (format) {
                            case FormatType.JPL:
                                fileFormat = JPLFormat;
                                break;

                            case FormatType.VECTOR:
                                fileFormat = VECTORFormat;
                                break;

                            default:
                                throw new Error(`Unsupported XML Format: ${format}`);
                        }

                        switch (type) {
                            case LoaderType.TRACKS:
                                const tracks = await fileFormat.processTracks(xml);
                                setTracks(tracks);
                                break;

                            case LoaderType.CAMERAS:
                                const cameras = await fileFormat.processCameras(xml);
                                setCameras(cameras);
                                break;

                            default:
                                throw new Error(`Unsupported Loader Type: ${type}`);
                        }

                        break;

                    case 'image/png':
                    case 'image/jpeg':
                        const image = await ImageLoader.load(file);
                        setImages((prevState) => ({ ...prevState, [file.name]: image }));
                        break;

                    default:
                        throw new Error(`Unsupported File Type: ${file.type}`);
                }
            }),
        );
    };

    const handleDirectory = async (entry: any): Promise<any> => {
        if (entry.kind === 'file') {
            const file = entry.getFile();
            if (file !== null) {
                return file;
            }
        } else if (entry.kind === 'directory') {
            const files = [];
            for await (const handle of entry.values()) {
                const file = await handleDirectory(handle);
                files.push(file);
            }
            return files;
        }
    };

    const handleClick = async () => {
        // @ts-ignore
        const handles = await window.showOpenFilePicker({ multiple: true });
        const files: File[] = await Promise.all(handles.map((handle: any) => handle.getFile()));
        validateFiles(files);
    };

    const handleDrop = async (event: React.DragEvent) => {
        event.preventDefault();

        const fileHandles = await Promise.all(
            Array.from(event.dataTransfer.items)
                // @ts-ignore
                .map((item) => item.getAsFileSystemHandle()),
        );

        const files: File[] = (
            await Promise.all(
                fileHandles.map((handle) => {
                    if (handle.kind === 'directory') {
                        return handleDirectory(handle);
                    } else {
                        return handle.getFile();
                    }
                }),
            )
        ).flat();

        await validateFiles(files);
    };

    const route = () => {
        navigate('/scene');
    };

    const disableEvent = (event: React.DragEvent) => {
        event.preventDefault();
    };

    useEffect(() => {
        if (cameras.length < 1) return;

        const cameraImages = cameras
            .map((c) => c.imageName)
            .filter((i) => i in images)
            .filter(Boolean);
        if (cameraImages.length === cameras.length) {
            setValidImages(true);
        }
    }, [cameras, images]);

    return (
        <main className={styles.container}>
            <div className={styles.content}>
                <div
                    className={styles.zone}
                    onClick={handleClick}
                    onDrop={handleDrop}
                    onDragOver={disableEvent}
                    onDragEnter={disableEvent}
                >
                    <p className={H2}>Upload Here</p>
                </div>
                <div className={styles.details}>
                    <div className={styles.indicators}>
                        <Checkbox className={styles.indicator} name="Track XML" checked={tracks.length > 0} disabled>
                            Track File
                        </Checkbox>
                        <Checkbox className={styles.indicator} name="Camera XML" checked={cameras.length > 0} disabled>
                            Camera File
                        </Checkbox>
                        <Checkbox className={styles.indicator} name="Images" checked={validImages} disabled>
                            Images
                        </Checkbox>
                    </div>
                    <button
                        className={cn(styles.button, Body)}
                        disabled={!(tracks.length > 0 && cameras.length > 0 && validImages)}
                        onClick={route}
                    >
                        Continue
                    </button>
                </div>
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
