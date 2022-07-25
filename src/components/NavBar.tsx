import { fileOpen } from 'browser-fs-access';
import { useData } from '@/DataContext';
import * as styles from '@/components/NavBar.css';

function NavBar() {
    const { activeImage, activeTrack, setTiepoints, setCameras, setActiveImage, setActiveTrack } = useData();

    const parser = new DOMParser();

    function handleBack() {
        if (activeTrack) {
            setActiveTrack(null);
        } else {
            setActiveImage(null);
        }
    }

    async function handleTiepoints() {
        const blob = await fileOpen({ description: 'Tiepoints File' });

        const xmlString = await blob.text();
        const xml = parser.parseFromString(xmlString, 'application/xml');

        const tiepoints = xml.querySelectorAll('tie');
        const newTiepoints = {};

        for (const [index, tiepoint] of tiepoints.entries()) {
            const leftKey = Number(tiepoint.getAttribute('left_key'));
            const rightKey = Number(tiepoint.getAttribute('right_key'));

            const leftId = xml.querySelector(`image[key="${leftKey}"]`).getAttribute('unique_id');
            const rightId = xml.querySelector(`image[key="${rightKey}"]`).getAttribute('unique_id');

            const leftPixel = tiepoint.querySelector('left');
            const rightPixel = tiepoint.querySelector('right');

            const trackId = Number(tiepoint.querySelector('track').getAttribute('id'));

            const initialXYZ = tiepoint.querySelector('init_xyz');
            const initialX = Number(initialXYZ.getAttribute('x'));
            const initialY = Number(initialXYZ.getAttribute('y'));
            const initialZ = Number(initialXYZ.getAttribute('z'));

            const finalXYZ = tiepoint.querySelector('final_xyz');
            const finalX = Number(finalXYZ.getAttribute('x'));
            const finalY = Number(finalXYZ.getAttribute('y'));
            const finalZ = Number(finalXYZ.getAttribute('z'));

            const leftInitialResidual = tiepoint.querySelector('left_init_residual');
            const rightInitialResidual = tiepoint.querySelector('right_init_residual');

            const leftFinalResidual = tiepoint.querySelector('left_final_residual');
            const rightFinalResidual = tiepoint.querySelector('right_final_residual');

            const item = {
                index,
                trackId,
                leftId,
                rightId,
                leftKey,
                rightKey,
                initialXYZ: [initialX, initialY, initialZ],
                finalXYZ: [finalX, finalY, finalZ],
                leftPixel: [
                    Number(leftPixel.getAttribute('samp')),
                    Number(leftPixel.getAttribute('line')),
                ],
                rightPixel: [
                    Number(rightPixel.getAttribute('samp')),
                    Number(rightPixel.getAttribute('line')),
                ],
                initialResidual: [
                    Number(leftInitialResidual.getAttribute('samp')) + Number(rightInitialResidual.getAttribute('samp')),
                    Number(leftInitialResidual.getAttribute('line')) + Number(rightInitialResidual.getAttribute('line')),
                ],
                finalResidual: [
                    Number(leftFinalResidual.getAttribute('samp')) + Number(rightFinalResidual.getAttribute('samp')),
                    Number(leftFinalResidual.getAttribute('line')) + Number(rightFinalResidual.getAttribute('line')),
                ],
            };

            newTiepoints[leftId] = newTiepoints[leftId] ? [...newTiepoints[leftId], item] : [item];
            newTiepoints[rightId] = newTiepoints[rightId] ? [...newTiepoints[rightId], item] : [item];
        }

        setTiepoints(newTiepoints);
    }

    async function handleNavigation() {
        const blob = await fileOpen({ description: 'Navigation File' });

        const xmlString = await blob.text();
        const xml = parser.parseFromString(xmlString, 'application/xml');

        const images = xml.querySelectorAll('solution');
        const newCameras = {};

        for (const image of images) {
            const imageId = image.querySelector('image').getAttribute('unique_id');

            const initialCamera = image.querySelector('original_camera_model');
            const initialC = initialCamera.querySelector('parameter[id="C"]');
            const initialA = initialCamera.querySelector('parameter[id="A"]');
            const initialH = initialCamera.querySelector('parameter[id="H"]');

            const finalCamera = image.querySelector('camera_model');
            const finalC = finalCamera.querySelector('parameter[id="C"]');
            const finalA = finalCamera.querySelector('parameter[id="A"]');
            const finalH = finalCamera.querySelector('parameter[id="H"]');

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
                },
            };
        }

        setCameras(newCameras);
    }

    return (
        <nav className={styles.container}>
            {activeImage && (
                <button className={styles.button} onClick={handleBack}>
                    Back
                </button>
            )}
            {!activeImage && (
                <h1 className={styles.header}>
                    Cool Name
                </h1>
            )}
            <div>
                <button className={styles.button} onClick={handleTiepoints}>
                    Tiepoint File
                </button>
                <button className={styles.button} onClick={handleNavigation}>
                    Navigation File
                </button>
            </div>
        </nav>
    );
}

export default NavBar;
