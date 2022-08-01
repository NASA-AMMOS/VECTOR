import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { Points, Line, useTexture } from '@react-three/drei';
import { useData } from '@/DataContext';
import { theme } from '@/utils/theme.css';
import * as styles from '@/components/TiepointImage.css';

export function Scene({ activeImage, images, tiepoints, setRenderTarget }) {
    const { gl, scene, camera, size } = useThree();

    const map = useLoader(THREE.TextureLoader, getImageURL(activeImage));
    const sprite = useTexture('/src/assets/disc.png');

    const mesh = useRef();

    const [points, setPoints] = useState(Float32Array.from([]));
    const [initialResiduals, setInitialResiduals] = useState([]);
    const [finalResiduals, setFinalResiduals] = useState([]);

    const baseVector = new THREE.Vector2();

    function getImageURL(id) {
        const [_, fileId] = id.split('_');
        const image = images.find((image) => image.name.includes(fileId));
        return image.url;
    }

    function initData() {
        const newPoints = [];
        const newInitialResiduals = [];
        const newFinalResiduals = [];

        for (const [i, tiepoint] of tiepoints.entries()) {
            const isLeft = tiepoint.leftId === activeImage;

            const pixel = isLeft ? new THREE.Vector2(...tiepoint.leftPixel) : new THREE.Vector2(...tiepoint.rightPixel);
            pixel.setX(pixel.x - map.image.width / 2);
            pixel.setY(pixel.y - map.image.height / 2);

            if (isLeft) {
                newPoints.push(...pixel.toArray(), 1);
            } else {
                newPoints.push(...pixel.toArray(), 1);
            }

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

        setPoints(Float32Array.from(newPoints));
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

    function updateRenderTarget() {
        const newTarget = new THREE.WebGLRenderTarget(size.width, size.height);
        gl.setRenderTarget(newTarget);
        gl.render(scene, camera);
        setRenderTarget(newTarget);
        gl.setRenderTarget(null);
    }

    useEffect(() => {
        initData();
    }, [tiepoints]);

    useEffect(() => {
        fitCamera();
        // TODO: Update render target when initial render is finished,
        // not on an arbitrary delay.
        setTimeout(() => {
            updateRenderTarget();
        }, 500);
    }, []);

    return (
        <>
            <mesh ref={mesh}>
                <planeGeometry args={[map.image.width, map.image.height]} />
                <meshBasicMaterial map={map} />
            </mesh>
            {points.length > 0 && (
                <Points positions={points}>
                    <pointsMaterial
                        sizeAttenuation={false}
                        size={3}
                        map={sprite}
                        alphaTest={0.5}
                        transparent={true}
                        color={theme.color.background}
                    />
                </Points>
            )}
            {initialResiduals.length > 0 && initialResiduals}
            {finalResiduals.length > 0 && finalResiduals}
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
