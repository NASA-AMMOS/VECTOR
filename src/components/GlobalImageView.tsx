import { useReducer } from 'react';

import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import SlopeChart from '@/components/SlopeChart';

import { Route, useRouter } from '@/stores/RouterContext';
import { useTools } from '@/stores/ToolsContext';
import { useData } from '@/stores/DataContext';

import * as styles from '@/components/GlobalImageView.css';

export default function GlobalImageView() {
    const router = useRouter();

    const { state } = useTools();

    const { imageTiepoints, getImageURL, setActiveImage } = useData();

    function handleClick(id: string) {
        router.push(Route.IMAGE);
        setActiveImage(id);
    }

    return (
        <section className={styles.container}>
            {Object.keys(imageTiepoints).map((id) => (
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
