import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vector2 } from 'three';

import { ResidualSortField, ResidualSortDirection, useTools } from '@/stores/ToolsContext';
import { useData } from '@/stores/DataContext';

import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import SlopeChart from '@/components/SlopeChart';

import * as styles from '@/routes/images.css';

const baseVector = new Vector2();
const tempVector = new Vector2();

export default function Images() {
    const navigate = useNavigate();

    const { state } = useTools();

    const { imageTracks, getImageURL } = useData();

    const handleClick = (name: string) => {
        navigate(`/images/${name}`);
    };

    const images = useMemo(() => {
        const newImages = Object.keys(imageTracks);

        newImages.sort((idA, idB) => {
            const tracksA = imageTracks[idA];
            const tracksB = imageTracks[idB];

            if (state.residualSort.field === ResidualSortField.INITIAL) {
                const imageAResiduals = [];
                const imageBResiduals = [];

                for (const track of tracksA) {
                    const points = track.points;
                    for (const point of points) {
                        const residual = point.initialResidual;
                        const distance = baseVector.distanceTo(tempVector.set(residual[0], residual[1]));
                        imageAResiduals.push(Number(distance.toFixed(1)));
                    }
                }

                for (const track of tracksB) {
                    const points = track.points;
                    for (const point of points) {
                        const residual = point.initialResidual;
                        const distance = baseVector.distanceTo(tempVector.set(residual[0], residual[1]));
                        imageBResiduals.push(Number(distance.toFixed(1)));
                    }
                }

                const maxResidualA = Math.max(...imageAResiduals);
                const maxResidualB = Math.max(...imageBResiduals);

                if (
                    (state.residualSort.direction === ResidualSortDirection.INCREASING &&
                        maxResidualA < maxResidualB) ||
                    (state.residualSort.direction === ResidualSortDirection.DECREASING && maxResidualA > maxResidualB)
                ) {
                    return -1;
                }

                return 1;
            } else if (state.residualSort.field === ResidualSortField.FINAL) {
                const imageAResiduals = [];
                const imageBResiduals = [];

                for (const track of tracksA) {
                    const points = track.points;
                    for (const point of points) {
                        const residual = point.finalResidual;
                        const distance = baseVector.distanceTo(tempVector.set(residual[0], residual[1]));
                        imageAResiduals.push(Number(distance.toFixed(1)));
                    }
                }

                for (const track of tracksB) {
                    const points = track.points;
                    for (const point of points) {
                        const residual = point.finalResidual;
                        const distance = baseVector.distanceTo(tempVector.set(residual[0], residual[1]));
                        imageBResiduals.push(Number(distance.toFixed(1)));
                    }
                }

                const maxResidualA = Math.max(...imageAResiduals);
                const maxResidualB = Math.max(...imageBResiduals);

                if (
                    (state.residualSort.direction === ResidualSortDirection.INCREASING &&
                        maxResidualA < maxResidualB) ||
                    (state.residualSort.direction === ResidualSortDirection.DECREASING && maxResidualA > maxResidualB)
                ) {
                    return -1;
                }

                return 1;
            } else if (state.residualSort.field === ResidualSortField.SCLK) {
                if (
                    (state.residualSort.direction === ResidualSortDirection.INCREASING &&
                        idA.localeCompare(idB, undefined, { numeric: true }) < 0) ||
                    (state.residualSort.direction === ResidualSortDirection.DECREASING &&
                        idA.localeCompare(idB, undefined, { numeric: true }) > 0)
                ) {
                    return -1;
                }
                return 1;
            }

            return 0;
        });

        return newImages;
    }, [state, imageTracks]);

    return (
        <section className={styles.container}>
            {images.map((imageName) => (
                <div key={imageName} className={styles.item} onClick={() => handleClick(imageName)}>
                    <div>
                        <h2 className={styles.header}>{imageName}</h2>
                        <img className={styles.image} src={getImageURL(imageName)!} alt={`Image Name: ${imageName}`} />
                    </div>
                    <RadialChart state={state} activeImage={imageName} />
                    <ResidualChart state={state} activeImage={imageName} />
                    <SlopeChart state={state} activeImage={imageName} />
                </div>
            ))}
        </section>
    );
}
