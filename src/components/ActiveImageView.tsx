import View from '@/components/View';
import Tracks from '@/components/Tracks';
import TiepointImage from '@/components/TiepointImage';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import { DataContext, useData } from '@/DataContext';
import * as styles from '@/components/ActiveImageView.css';

function ActiveImageView() {
    const { activeImage, activeTrack } = useData();

    if (activeImage && !activeTrack) {
        return (
            <section className={styles.grid}>
                <div className={styles.column}>
                    <TiepointImage />
                    <div className={styles.block}>
                        <div className={styles.item}>
                            <RadialChart activeImage={activeImage} />
                        </div>
                        <div className={styles.item}>
                            <ResidualChart activeImage={activeImage} />
                        </div>
                    </div>
                </div>
                <Tracks />
            </section>
        );
    }
}

export default ActiveImageView;
