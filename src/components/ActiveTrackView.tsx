import { Track } from '@/components/Tracks';
import CameraViewport from '@/components/CameraViewport';
import RadialChart from '@/components/RadialChart';
import ResidualLength from '@/components/ResidualLength';
import SlopeChart from '@/components/SlopeChart';
import { useData } from '@/DataContext';
import * as styles from '@/components/ActiveTrackView.css';

function ActiveTrackView() {
    const { activeImage, activeTrack } = useData();

    return (
        <section className={styles.grid}>
            <div className={styles.panel}>
                <h3 className={styles.subheader}>
                    Track ID: {activeTrack}
                </h3>
                <div className={styles.bar}>
                    <Track activeImage={activeImage} activeTrack={activeTrack} />
                </div>
                <CameraViewport />
            </div>
            <div className={styles.column}>
                <div className={styles.item}>
                    <RadialChart activeImage={activeImage} />
                </div>
                <div className={styles.item}>
                    <ResidualLength activeImage={activeImage} />
                </div>
                <div className={styles.item}>
                    <SlopeChart activeImage={activeImage} activeTrack={activeTrack} />
                </div>
            </div>
        </section>
    );
}

export default ActiveTrackView;
