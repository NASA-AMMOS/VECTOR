import { useRef, useMemo, useReducer, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { useContextBridge } from '@react-three/drei';
import View from '@/components/View';
import Tracks from '@/components/Tracks';
import TiepointImage, { Scene } from '@/components/TiepointImage';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import { DataContext, useData } from '@/DataContext';
import * as styles from '@/components/ActiveImageView.css';

function ActiveImageView() {
    THREE.Object3D.DefaultUp.set(0, 1, 0);

    const ContextBridge = useContextBridge(DataContext);

    const { tiepoints, activeImage } = useData();

    const container = useRef(null);
    const stage = useRef(null);
    const tracks = useRef(null);
    const views = useRef([]);

    const activeTracks = useMemo(() => tiepoints[activeImage].map((t) => t.trackId), [tiepoints, activeImage]);

    const [ready, toggle] = useReducer(() => true, false);

    useEffect(() => {
        toggle();
    }, []);

    return (
        <section ref={container} className={styles.grid}>
            <div className={styles.column}>
                <TiepointImage stage={stage} />
                <div className={styles.block}>
                    <div className={styles.item}>
                        <RadialChart activeImage={activeImage} />
                    </div>
                    <div className={styles.item}>
                        <ResidualChart activeImage={activeImage} />
                    </div>
                </div>
            </div>
            <Tracks ref={tracks} activeTracks={activeTracks} views={views} />
            <Canvas
                className={styles.canvas}
                orthographic={true}
                onCreated={(state) => state.events.connect(container.current)}
            >
                <ContextBridge>
                    <View track={stage}>
                        <Scene activeImage={activeImage} />
                    </View>
                    {ready && views.current.map(({ ref, scene }, i) => (
                        <View key={i} parent={tracks} track={ref}>
                            {scene}
                        </View>
                    ))}
                </ContextBridge>
            </Canvas>
        </section>
    );
}

export default ActiveImageView;
