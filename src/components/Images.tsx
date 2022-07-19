import SlopeChart from '@/components/SlopeChart';
import { useData } from '@/DataContext';
import * as styles from '@/components/Images.css';

function Images() {
    const { tiepoints, setActiveImage } = useData();

    if (tiepoints && Object.keys(tiepoints).length > 0) {
        return (
            <section className={styles.container}>
                {Object.keys(tiepoints).map((id) => (
                    <div key={id} className={styles.item} onClick={() => setActiveImage(id)}>
                        <img
                            className={styles.image}
                            src={`src/assets/example/${id}.png`}
                            alt={`Image with ID: ${id}`}
                        />
                        <SlopeChart activeImage={id} />
                    </div>
                ))}
            </section>
        );
    }
}

export default Images;
