import { useMemo } from 'react';
import { Vector2 } from 'three';

import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import SlopeChart from '@/components/SlopeChart';

import { Route, useRouter } from '@/stores/RouterContext';
import { ResidualSortField, ResidualSortDirection, useTools } from '@/stores/ToolsContext';
import { useData } from '@/stores/DataContext';

import * as styles from '@/components/GlobalImageView.css';

const baseVector = new Vector2();

export default function GlobalImageView() {
    const router = useRouter();

    const { state } = useTools();

    const { imageTiepoints, getImageURL, setActiveImage } = useData();

    function handleClick(id: string) {
        router.push(Route.IMAGE);
        setActiveImage(id);
    }

    const images = useMemo(() => {
        const newImages = Object.entries(imageTiepoints).sort((a, b) => {
            const [imageIdA, tiepointsA] = a;
            const [imageIdB, tiepointsB] = b;

            if (state.residualSort.field === ResidualSortField.INITIAL) {
                const maxResidualA = Math.max(...tiepointsA.map((t) => Number(baseVector.distanceTo(new Vector2(...t.initialResidual)).toFixed(1))));
                const maxResidualB = Math.max(...tiepointsB.map((t) => Number(baseVector.distanceTo(new Vector2(...t.initialResidual)).toFixed(1))));
                if (
                    (state.residualSort.direction === ResidualSortDirection.INCREASING && maxResidualA < maxResidualB) ||
                    (state.residualSort.direction === ResidualSortDirection.DECREASING && maxResidualA > maxResidualB)
                ) {
                    return -1;
                }
                return 1;
            } else if (state.residualSort.field === ResidualSortField.FINAL) {
                const maxResidualA = Math.max(...tiepointsA.map((t) => Number(baseVector.distanceTo(new Vector2(...t.finalResidual)).toFixed(1))));
                const maxResidualB = Math.max(...tiepointsB.map((t) => Number(baseVector.distanceTo(new Vector2(...t.finalResidual)).toFixed(1))));
                if (
                    (state.residualSort.direction === ResidualSortDirection.INCREASING && maxResidualA < maxResidualB) ||
                    (state.residualSort.direction === ResidualSortDirection.DECREASING && maxResidualA > maxResidualB)
                ) {
                    return -1;
                }
                return 1;
            }

            return 0;
        });
        return newImages.map((i) => i[0]);
    }, [state, imageTiepoints]);

    return (
        <section className={styles.container}>
            {images.map((id) => (
                <div key={id} className={styles.item} onClick={() => handleClick(id)}>
                    <div>
                        <h2 className={styles.header}>
                            Image ID: {id}
                        </h2>
                        <img
                            className={styles.image}
                            src={getImageURL(id)!}
                            alt={`Image with ID: ${id}`}
                        />
                    </div>
                    <RadialChart
                        state={state}
                        activeImage={id}
                    />
                    <ResidualChart
                        state={state}
                        activeImage={id}
                    />
                    <SlopeChart
                        state={state}
                        activeImage={id}
                    />
                </div>
            ))}
        </section>
    );
}
