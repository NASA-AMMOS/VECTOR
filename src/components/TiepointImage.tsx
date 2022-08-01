import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { Points, Line, useTexture } from '@react-three/drei';
import { useData } from '@/DataContext';
import { theme } from '@/utils/theme.css';
import * as styles from '@/components/TiepointImage.css';

function TiepointImage({ activeImage, images, tiepoints, offsetHeight, setImage, setRenderTarget }) {
    const { gl, camera, size } = useThree();

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
        setRenderTarget(gl.domElement.toDataURL());
    }

    useEffect(() => {
        if (map.image) {
            setImage(map.image);
        }
    }, [map]);

    useEffect(() => {
        initData();
    }, [tiepoints]);

    useEffect(() => {
        if (offsetHeight) {
            fitCamera();
            updateRenderTarget();
        }
    }, [offsetHeight]);

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

function Container() {
    THREE.Object3D.DefaultUp.set(0, 1, 0);

    const { activeImage, images, tiepoints, setRenderTarget } = useData();

    const container = useRef(null);

    const [image, setImage] = useState(null);
    const [offsetHeight, setOffsetHeight] = useState(null);

    useEffect(() => {
        if (image && image.width && image.height) {
            setOffsetHeight(image.height * (container.current.offsetWidth / image.width));
        }
    }, [image]);

    return (
        <section ref={container} className={styles.container}>
            <h2 className={styles.header}>
                Image ID: {activeImage}
            </h2>
            <Canvas orthographic={true} gl={{ preserveDrawingBuffer: true }}>
                <TiepointImage
                    activeImage={activeImage}
                    images={images}
                    tiepoints={tiepoints[activeImage]}
                    offsetHeight={offsetHeight}
                    setImage={setImage}
                    setRenderTarget={setRenderTarget}
                />
            </Canvas>
        </section>
    );
}

export default Container;
