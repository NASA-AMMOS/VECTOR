import RadialChart from '@/components/RadialChart';
import ResidualLength from '@/components/ResidualLength';
import SlopeChart from '@/components/SlopeChart';
import { useData } from '@/DataContext';
import * as styles from '@/components/GlobalImageView.css';

function GlobalImageView() {
    const { tiepoints, setActiveImage } = useData();

    if (tiepoints && Object.keys(tiepoints).length > 0) {
        return (
            <section className={styles.container}>
                {Object.keys(tiepoints).map((id) => (
                    <div key={id} className={styles.item} onClick={() => setActiveImage(id)}>
                        <div>
                            <h2 className={styles.header}>
                                Image ID: {id}
                            </h2>
                            <img
                                className={styles.image}
                                src={`src/assets/example/${id}.png`}
                                alt={`Image with ID: ${id}`}
                            />
                        </div>
                        <RadialChart activeImage={id} />
                        <ResidualLength activeImage={id} />
                        <SlopeChart activeImage={id} />
                    </div>
                ))}
            </section>
        );
    } else {
        // Return empty div to keep layout with navbar.
        return (
            <div className={styles.container}></div>
        )
    }
}

export default GlobalImageView;
