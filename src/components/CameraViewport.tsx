import { useRef, useState, useMemo, useEffect, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, useContextBridge, useCamera } from '@react-three/drei';
import { DataContext, useData } from '@/DataContext';
import { theme } from '@/utils/theme.css';
import * as styles from '@/components/CameraViewport.css';

const matrix = new THREE.Matrix4();

function Line({ points, userData, color, visible }) {
    const ref = useRef<THREE.Line>();

    useLayoutEffect(() => {
        ref.current.geometry.setFromPoints(points);
    }, [points]);

    return (
        <line ref={ref} userData={userData} visible={visible}>
            <bufferGeometry />
            <lineBasicMaterial color={color} />
        </line>
    );
}

function ViewCube() {
    const { gl, scene, camera, size } = useThree();

    const mesh = useRef();
    const axes = useRef();
    const virtualCamera = useRef();

    const virtualScene = useMemo(() => new THREE.Scene(), []);

    useFrame(() => {
        matrix.copy(camera.matrix).invert();
        mesh.current.quaternion.setFromRotationMatrix(matrix);
        axes.current.quaternion.setFromRotationMatrix(matrix);
        gl.autoClear = true;
        gl.render(scene, camera);
        gl.autoClear = false;
        gl.clearDepth();
        gl.render(virtualScene, virtualCamera.current);
    }, 1);

    return createPortal(
        <>
            <OrthographicCamera ref={virtualCamera} makeDefault={false} position={[0, 0, 100]} />
            <mesh
                ref={mesh}
                raycast={useCamera(virtualCamera)}
                position={[size.width / 2 - 50, size.height / 2 - 50, 0]}
            >
                <meshLambertMaterial color="white" />
                <boxBufferGeometry args={[20, 20, 20]} />
            </mesh>
            <axesHelper
                ref={axes}
                args={[50, 50, 50]}
                position={[size.width / 2 - 50, size.height / 2 - 50, 0]}
            />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
        </>
    , virtualScene);
}

function Scene() {
    const { scene, camera } = useThree();

    const { tiepoints, cameras, vicar, activeImage, activeTrack, getVICARFile } = useData();

    const controls = useRef(null);

    const [boxes, setBoxes] = useState([]);
    const [lines, setLines] = useState([]);
    const [initialPoint, setInitialPoint] = useState(null);
    const [finalPoint, setFinalPoint] = useState(null);

    const activeTiepoints = useMemo(() => tiepoints[activeImage].filter((t) => t.trackId === activeTrack), [activeImage, activeTrack, tiepoints]);

    const activeCameras = useMemo(() => {
        const newCameras = [...new Set(activeTiepoints.map((t) => [t.leftId, t.rightId]).flat())];
        return Object.keys(cameras).filter((k) => newCameras.includes(k)).reduce((obj, key) => {
            obj[key] = cameras[key];
            return obj;
        }, {});
    }, [activeTiepoints, cameras]);

    const parser = new DOMParser();

    function handlePointerOver(event) {
        const cameraId = event.object.userData.cameraId;
        scene.traverse((object) => {
            if (object.userData.cameraId === cameraId && object.userData.initial) {
                object.visible = true;
            }
        });
    }

    function handlePointerOut(event) {
        scene.traverse((object) => {
            if (object.userData.initial) {
                object.visible = false;
            }
        });
    }

    async function initData() {
        const newBoxes = [];
        const newLines = [];

        for (const cameraId of Object.keys(activeCameras)) {
            const camera = activeCameras[cameraId];

            const metadata = getVICARFile(cameraId);
            const frameIndex = metadata.findIndex((v) => v === `REFERENCE_COORD_SYSTEM_NAME='SITE_FRAME'`);
            const originOffset = metadata[frameIndex - 4].split('=')[1].replace(/\(|\)/g, '').split(',').map(Number);

            const initialC = new THREE.Vector3(...camera.initial.C);
            const initialA = new THREE.Vector3(...camera.initial.A);
            const initialH = new THREE.Vector3(...camera.initial.H);

            const initialHxA = new THREE.Euler().setFromVector3(initialH.clone().cross(initialA).normalize());

            newBoxes.push(
                <mesh
                    key={`${cameraId}_initial`}
                    position={initialC}
                    rotation={initialHxA}
                    userData={{ cameraId, initial: true }}
                    visible={false}
                >
                    <planeGeometry args={[0.1, 0.1]} />
                    <meshLambertMaterial
                        color={theme.color.initialHex}
                        opacity={theme.color.initialOpacity}
                        transparent={true}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            );

            newLines.push(
                <Line
                    key={`${cameraId}_initial`}
                    color={theme.color.initialHex}
                    points={[initialC, initialC.clone().add(initialA)]}
                    userData={{ cameraId, initial: true }}
                    visible={false}
                />
            );

            const finalC = new THREE.Vector3(...camera.final.C);
            const finalA = new THREE.Vector3(...camera.final.A);
            const finalH = new THREE.Vector3(...camera.final.H);

            const finalHxA = new THREE.Euler().setFromVector3(finalH.clone().cross(finalA).normalize());

            newBoxes.push(
                <mesh
                    key={`${cameraId}_final`}
                    position={finalC}
                    rotation={finalHxA}
                    userData={{ cameraId, initial: false }}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                >
                    <planeGeometry args={[0.1, 0.1]} />
                    <meshLambertMaterial
                        color={theme.color.finalHex}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            );

            newLines.push(
                <Line
                    key={`${cameraId}_final`}
                    color={theme.color.finalHex}
                    points={[finalC, finalC.clone().add(finalA)]}
                    userData={{ cameraId, initial: false }}
                />
            );
        }

        setBoxes(newBoxes);
        setLines(newLines);

        setInitialPoint(
            <mesh position={activeTiepoints[0].initialXYZ}>
                <sphereGeometry args={[0.1]} />
                <meshBasicMaterial color={theme.color.initialHex} />
            </mesh>
        );

        setFinalPoint(
            <mesh position={activeTiepoints[0].finalXYZ}>
                <sphereGeometry args={[0.1]} />
                <meshBasicMaterial color={theme.color.finalHex} />
            </mesh>
        );
    }

    function fitCamera() {
        const offset = 1.5;

        const meshes = [];
        scene.traverse((object) => object.isMesh && !object.isLine2 && meshes.push(object));

        const center = new THREE.Vector3();
        const size = new THREE.Vector3();

        const aabb = new THREE.Box3();
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
        if (activeTiepoints && activeCameras) {
            initData();
        }
    }, [activeTiepoints, activeCameras]);

    useEffect(() => {
        if (boxes.length > 0) {
            fitCamera();
        }
    }, [boxes]);

    return (
        <>
            <OrbitControls ref={controls} screenSpacePanning />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.1} />
            {boxes}
            {lines}
            {/*{initialPoint}
            {finalPoint}*/}
            <ViewCube />
        </>
    )
}

function CameraViewport() {
    // Need to import entire module instead of named module
    // to set proper axis to match SITE frame.
    THREE.Object3D.DefaultUp.set(0, 0, -1);

    const ContextBridge = useContextBridge(DataContext);

    return (
        <Canvas className={styles.container}>
            <ContextBridge>
                <Scene />
            </ContextBridge>
        </Canvas>
    )
}

export default CameraViewport;
