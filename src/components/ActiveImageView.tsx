import Tracks from '@/components/Tracks';
import TiepointImage from '@/components/TiepointImage';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';

import { useTools } from '@/stores/ToolsContext';
import { useData } from '@/stores/DataContext';

import * as styles from '@/components/ActiveImageView.css';

export default function ActiveImageView() {
    const { state } = useTools();

    const { activeImage, activeTrack } = useData();

    return (
        <>
            {activeImage && !activeTrack && (
                <section className={styles.container}>
                    <div className={styles.column}>
                        <TiepointImage state={state} />
                        <div className={styles.block}>
                            <div className={styles.item}>
                                <RadialChart state={state} activeImage={activeImage} />
                            </div>
                            <div className={styles.item}>
                                <ResidualChart state={state} activeImage={activeImage} />
                            </div>
                        </div>
                    </div>
                    <Tracks state={state} />
                </section>
            )}
        </>
    );
}
