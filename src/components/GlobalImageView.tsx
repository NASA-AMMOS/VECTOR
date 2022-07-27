import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import SlopeChart from '@/components/SlopeChart';
import { useData } from '@/DataContext';
import * as styles from '@/components/GlobalImageView.css';

function GlobalImageView() {
    const { images, tiepoints, setActiveImage } = useData();

    function getImageURL(id) {
        const [_, fileId] = id.split('_');
        const image = images.find((image) => image.name.includes(fileId));
        return image.url;
    }

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
                                src={getImageURL(id)}
                                alt={`Image with ID: ${id}`}
                            />
                        </div>
                        <RadialChart activeImage={id} />
                        <ResidualChart activeImage={id} />
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
