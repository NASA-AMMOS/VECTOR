import { fileOpen } from 'browser-fs-access';
import { useData } from '@/DataContext';
import * as styles from '@/components/NavBar.css';

function NavBar() {
    const { tiepoints, setTiepoints } = useData();

    const parser = new DOMParser();

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

    return (
        <nav className={styles.container}>
            <h1>
                Cool Name
            </h1>
            <div>
                <button className={styles.button} onClick={handleTiepoints}>
                    Tiepoint File
                </button>
                <button className={styles.button}>
                    Navigation File
                </button>
            </div>
        </nav>
    );
}

export default NavBar;
