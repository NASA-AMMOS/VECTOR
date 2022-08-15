import { useReducer } from 'react';

import { Track } from '@/components/Tracks';
import CameraViewport from '@/components/CameraViewport';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import SlopeChart from '@/components/SlopeChart';

import { ContextMenuState } from '@/App';
import { useTools } from '@/stores/ToolsContext';
import { useData } from '@/stores/DataContext';

import * as styles from '@/components/ActiveTrackView.css';

interface ActiveTrackViewProps {
    contextMenu: ContextMenuState;
    setContextMenu: React.Dispatch<ContextMenuState>;
};

export default function ActiveTrackView({ contextMenu, setContextMenu }: ActiveTrackViewProps) {
    const { state } = useTools();

    const { activeImage, activeTrack } = useData();

    return (
        <>
            {activeImage && activeTrack && (
                <section className={styles.container}>
                    <div className={styles.panel}>
                        <h3 className={styles.header}>
                            Track ID: {activeTrack}
                        </h3>
                        <div className={styles.bar}>
                            <Track
                                state={state}
                                contextMenu={contextMenu}
                                setContextMenu={setContextMenu}
                                activeImage={activeImage}
                                activeTrack={activeTrack}
                            />
                        </div>
                        <CameraViewport state={state} />
                    </div>
                    <div className={styles.column}>
                        <div className={styles.item}>
                            <RadialChart
                                state={state}
                                activeImage={activeImage}
                                activeTrack={activeTrack}
                                isEdited
                            />
                        </div>
                        <div className={styles.item}>
                            <ResidualChart
                                state={state}
                                activeImage={activeImage}
                                activeTrack={activeTrack}
                                isEdited
                            />
                        </div>
                        <div className={styles.item}>
                            <SlopeChart
                                state={state}
                                activeImage={activeImage}
                                activeTrack={activeTrack}
                                isEdited
                            />
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
