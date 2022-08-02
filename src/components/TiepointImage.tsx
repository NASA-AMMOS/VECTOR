import { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { Points, Point, Line, useTexture } from '@react-three/drei';
import { useData } from '@/DataContext';
import { theme } from '@/utils/theme.css';
import * as styles from '@/components/TiepointImage.css';

export function Scene({ activeImage }) {
    const { camera, size } = useThree();

    const { tiepoints, getImageURL } = useData();

    const imageTex = useTexture(getImageURL(activeImage));
    const discTex = useTexture('/src/assets/disc.png');

    const mesh = useRef();

    const [points, setPoints] = useState([]);
    const [initialResiduals, setInitialResiduals] = useState([]);
    const [finalResiduals, setFinalResiduals] = useState([]);

    const activeTiepoints = useMemo(() => tiepoints[activeImage], [tiepoints, activeImage]);

    function initData() {
        const newPoints = [];
        const newInitialResiduals = [];
        const newFinalResiduals = [];

        for (const [i, tiepoint] of activeTiepoints.entries()) {
            const isLeft = tiepoint.leftId === activeImage;

            const pixel = isLeft ? new THREE.Vector2(...tiepoint.leftPixel) : new THREE.Vector2(...tiepoint.rightPixel);
            pixel.setX(pixel.x - imageTex.image.width / 2);
            pixel.setY(pixel.y - imageTex.image.height / 2);
            newPoints.push(
                <Point
                    key={i}
                    position={[...pixel.toArray(), 1]}
                />
            );

            const initialResidual = new THREE.Vector2(...tiepoint.initialResidual)
            const finalResidual = new THREE.Vector2(...tiepoint.finalResidual)

            newInitialResiduals.push(
                <Line
                    key={i}
                    color={theme.color.initialHex}
                    points={[
                        [...pixel.toArray(), 0],
                        [...initialResidual.add(pixel).toArray(), 0],
                    ]}
                />
            );

            newFinalResiduals.push(
                <Line
                    key={i}
                    color={theme.color.finalHex}
                    points={[
                        [...pixel.toArray(), 0],
                        [...finalResidual.add(pixel).toArray(), 0],
                    ]}
                />
            );
        }

        setPoints(newPoints);
        setInitialResiduals(newInitialResiduals);
        setFinalResiduals(newFinalResiduals);
    }

    function fitCamera() {
        const aabb = new THREE.Box3().setFromObject(mesh.current);
        camera.zoom = Math.min(
            size.width / (aabb.max.x - aabb.min.x),
            size.height / (aabb.max.y - aabb.min.y)
        );
        camera.updateProjectionMatrix();
    }

    useEffect(() => {
        initData();
    }, [activeTiepoints]);

    useEffect(() => {
        if (imageTex) {
            fitCamera();
        }
    }, [imageTex]);

    return (
        <>
            <mesh ref={mesh}>
                <planeGeometry args={[imageTex.image.width, imageTex.image.height]} />
                <meshBasicMaterial map={imageTex} />
            </mesh>
            <Points>
                <pointsMaterial
                    sizeAttenuation={false}
                    size={3}
                    map={discTex}
                    alphaTest={0.5}
                    transparent={true}
                    color={theme.color.black}
                />
                {points}
            </Points>
            {initialResiduals}
            {finalResiduals}
        </>
    );
}

function TiepointImage({ stage }) {
    const { activeImage } = useData();

    return (
        <section className={styles.container}>
            <h2 className={styles.header}>
                Image ID: {activeImage}
            </h2>
            <div ref={stage} className={styles.stage} />
        </section>
    );
}

export default TiepointImage;
