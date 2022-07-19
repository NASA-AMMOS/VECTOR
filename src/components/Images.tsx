import SlopeChart from '@/components/SlopeChart';
import { useData } from '@/DataContext';
import * as styles from '@/components/Images.css';

function Images() {
    const { tiepoints, setActiveImage } = useData();

    if (tiepoints && Object.keys(tiepoints).length > 0) {
        return (
            <>
                {Object.keys(tiepoints).map((id) => (
                    <section key={id} className={styles.container} onClick={() => setActiveImage(id)}>
                        <img
                            className={styles.image}
                            src={`src/assets/example/${id}.png`}
                            alt={`Image with ID: ${id}`}
                        />
                        <div className={styles.content}>
                            <p className={styles.text}>
                                Image ID: {id}
                            </p>
                            <p className={styles.text}>
                                Total Tiepoints: {tiepoints[id].length}
                            </p>
                        </div>
                        <SlopeChart activeImage={id} />
                    </section>
                ))}
            </>
        );
    }
}

export default Images;
