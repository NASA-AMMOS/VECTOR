import { useParams } from 'react-router-dom';

import { useTools } from '@/stores/ToolsContext';

import Track from '@/components/Track';
import CameraViewport from '@/components/CameraViewport';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import SlopeChart from '@/components/SlopeChart';

import * as styles from '@/routes/track.css';

export default function TrackView() {
    const { trackId: activeTrack } = useParams();

    const { state } = useTools();

    return (
        <>
            {activeTrack && (
                <section className={styles.container}>
                    <div className={styles.panel}>
                        <h3 className={styles.header}>Track ID: {activeTrack}</h3>
                        <div className={styles.bar}>
                            <Track state={state} activeTrack={activeTrack} />
                        </div>
                        <div className={styles.canvas}>
                            <CameraViewport />
                        </div>
                    </div>
                    <div className={styles.column}>
                        <RadialChart state={state} activeTrack={activeTrack} />
                        <ResidualChart state={state} activeTrack={activeTrack} />
                        <SlopeChart state={state} activeTrack={activeTrack} />
                    </div>
                </section>
            )}
        </>
    );
}
