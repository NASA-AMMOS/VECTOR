import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';
import Tracks from '@/components/Tracks';
import TiepointImage, { Scene } from '@/components/TiepointImage';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import { useData } from '@/DataContext';
import * as styles from '@/components/ActiveImageView.css';

function ActiveImageView() {
    THREE.Object3D.DefaultUp.set(0, 1, 0);

    const { activeImage, images, tiepoints, renderTarget, setRenderTarget } = useData();

    const container = useRef(null);
    const stage = useRef(null);
    const views = useRef([]);

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
            <Tracks views={views} />
            <Canvas
                className={styles.canvas}
                orthographic={true}
                onCreated={(state) => state.events.connect(container.current)}
            >
                <View track={stage}>
                    <Scene
                        activeImage={activeImage}
                        images={images}
                        tiepoints={tiepoints[activeImage]}
                        setRenderTarget={setRenderTarget}
                    />
                </View>
                {renderTarget && views?.current.map((view, i) => (
                    <View key={i} track={view}>
                        <mesh>
                            <planeGeometry args={[renderTarget.width, renderTarget.height]} />
                            <meshBasicMaterial map={renderTarget.texture} />
                        </mesh>
                    </View>
                ))}
            </Canvas>
        </section>
    );
}

export default ActiveImageView;
