import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import SlopeChart from '@/components/SlopeChart';
import { ActionType, useData } from '@/DataContext';
import * as styles from '@/components/GlobalImageView.css';

function GlobalImageView({ dispatch }) {
    const { imageTiepoints, getImageURL, setActiveImage } = useData();

    function handleClick(id) {
        dispatch(ActionType.EXIT);
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
}

export default GlobalImageView;
