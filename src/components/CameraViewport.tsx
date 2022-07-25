import { useMemo, useRef, useState, useEffect } from 'react';
import { Vector3, Euler, Box3 } from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { useData } from '@/DataContext';
import * as styles from '@/components/CameraViewport.css';

function Cameras({ tiepoints, cameras }) {
    const { scene, camera } = useThree();

    const controls = useRef(null);

    const [boxes, setBoxes] = useState([]);
    const [lines, setLines] = useState([]);
    const [initialPoint, setInitialPoint] = useState(null);
    const [finalPoint, setFinalPoint] = useState(null);

    const parser = new DOMParser();

    async function initData() {
        const newBoxes = [];
        const newLines = [];

        for (const cameraId of Object.keys(cameras)) {
            const camera = cameras[cameraId];

            const initialC = new Vector3(camera.initial.C[0], -camera.initial.C[2], camera.initial.C[1]);
            const initialA = new Vector3(camera.initial.A[0], -camera.initial.A[2], camera.initial.A[1]);
            const initialH = new Vector3(camera.initial.H[0], -camera.initial.H[2], camera.initial.H[1]);

            const initialHxA = new Euler().setFromVector3(initialH.clone().cross(initialA).normalize());

            newBoxes.push(
                <mesh key={`${cameraId}_initial`} position={initialC} rotation={initialHxA}>
                    <boxGeometry args={[0.1, 0.1, 0.1]} />
                    <meshBasicMaterial wireframe color={0xBDC3C7} />
                </mesh>
            );

            newLines.push(
                <Line
                    key={`${cameraId}_initial`}
                    color={0xBDC3C7}
                    points={[initialC, initialC.clone().add(initialA)]}
                />
            );

            const finalC = new Vector3(camera.final.C[0], -camera.final.C[2], camera.final.C[1]);
            const finalA = new Vector3(camera.final.A[0], -camera.final.A[2], camera.final.A[1]);
            const finalH = new Vector3(camera.final.H[0], -camera.final.H[2], camera.final.H[1]);

            const finalHxA = new Euler().setFromVector3(finalH.clone().cross(finalA).normalize());

            newBoxes.push(
                <mesh key={`${cameraId}_final`} position={finalC} rotation={finalHxA}>
                    <boxGeometry args={[0.1, 0.1, 0.1]} />
                    <meshBasicMaterial wireframe color={0x000000} />
                </mesh>
            );

            newLines.push(
                <Line
                    key={`${cameraId}_final`}
                    color={0x000000}
                    points={[finalC, finalC.clone().add(finalA)]}
                />
            );
        }

        setBoxes(newBoxes);
        setLines(newLines);

        // const initialXYZ = tiepoints[0].initialXYZ;
        // setInitialPoint(
        //     <mesh position={[initialXYZ[0], -initialXYZ[2], initialXYZ[1]]}>
        //         <sphereGeometry args={[0.5]} />
        //         <meshBasicMaterial color={0xBDC3C7} />
        //     </mesh>
        // );

        // const finalXYZ = tiepoints[0].finalXYZ;
        // setFinalPoint(
        //     <mesh position={[finalXYZ[0], -finalXYZ[2], finalXYZ[1]]}>
        //         <sphereGeometry args={[0.5]} />
        //         <meshBasicMaterial color={0x000000} />
        //     </mesh>
        // );
    }

    function fitCamera() {
        const offset = 1.5;

        const meshes = [];
        scene.traverse((object) => object.isMesh && !object.isLine2 && meshes.push(object));

        const center = new Vector3();
        const size = new Vector3();

        const aabb = new Box3();
        aabb.makeEmpty();

        for (const mesh of meshes) {
            aabb.expandByObject(mesh);
        }

        aabb.getCenter(center);
        aabb.getSize(size);

        const maxSize = Math.max(size.x, size.y, size.z);
        const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
        const fitWidthDistance = fitHeightDistance / camera.aspect;
        const distance = offset * Math.max(fitHeightDistance, fitWidthDistance);

        const direction = controls.current.target.clone()
            .sub(camera.position)
            .normalize()
            .multiplyScalar(distance);

        controls.current.maxDistance = distance * 10;
        controls.current.target.copy(center);

        camera.near = distance / 100;
        camera.far = distance * 100;
        camera.updateProjectionMatrix();

        camera.position.copy(controls.current.target).sub(direction);

        controls.current.update();
    }

    useEffect(() => {
        if (tiepoints && cameras) {
            initData();
        }
    }, [tiepoints, cameras]);

    useEffect(() => {
        if (boxes.length > 0) {
            fitCamera();
        }
    }, [boxes]);

    return (
        <>
            <OrbitControls ref={controls} />
            {boxes.length > 0 && boxes}
            {lines.length > 0 && lines}
            {initialPoint}
            {finalPoint}
        </>
    )
}

function CameraViewport() {
    const { tiepoints, cameras, activeImage, activeTrack } = useData();

    const activeTiepoints = useMemo(() => tiepoints[activeImage].filter((t) => t.trackId === activeTrack), [activeImage, activeTrack, tiepoints]);

    const activeCameras = useMemo(() => {
        const newCameras = [...new Set(activeTiepoints.map((t) => [t.leftId, t.rightId]).flat())];
        return Object.keys(cameras).filter((k) => newCameras.includes(k)).reduce((obj, key) => {
            obj[key] = cameras[key];
            return obj;
        }, {});
    }, [activeTiepoints, cameras]);

    return (
        <Canvas className={styles.container}>
            <Cameras
                tiepoints={activeTiepoints}
                cameras={activeCameras}
            />
        </Canvas>
    );
}

export default CameraViewport;
