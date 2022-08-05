import Tracks from '@/components/Tracks';
import TiepointImage from '@/components/TiepointImage';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import { PageAction } from '@/App';
import { DataContext, useData } from '@/DataContext';
import * as styles from '@/components/ActiveImageView.css';

interface ActiveImageViewProps {
    dispatch: React.Dispatch<PageAction>;
};

export default function ActiveImageView({ dispatch }: ActiveImageViewProps) {
    const { activeImage, activeTrack } = useData();

    return (
        <>
            {activeImage && !activeTrack && (
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
                    <Tracks dispatch={dispatch} />
                </section>
            )}
        </>
    );
}
