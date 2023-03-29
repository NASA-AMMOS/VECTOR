import Tracks from '@/components/Tracks';
import TiepointImage from '@/components/TiepointImage';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';

import { useTools } from '@/stores/ToolsContext';

import * as styles from '@/routes/image.css';
import { useParams } from 'react-router-dom';

export default function Image() {
    const { imageName: activeImage } = useParams();

    const { state } = useTools();

    return (
        <>
            {activeImage && (
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
