import { useRef, useState, useMemo, useEffect, useLayoutEffect, useReducer } from 'react';
import { fileOpen } from 'browser-fs-access';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Canvas, createPortal, useLoader, useFrame, useThree, extend } from '@react-three/fiber';
import {
    OrbitControls,
    PerspectiveCamera,
    OrthographicCamera,
    Instances,
    Instance,
    Text,
    useContextBridge,
    useCamera,
    useBounds,
} from '@react-three/drei';

import { ToolsContext, useTools } from '@/stores/ToolsContext';
import { Tiepoint, Camera, CameraModel, DataContext, useData } from '@/stores/DataContext';

import { theme } from '@/utils/theme.css';
import * as styles from '@/components/CameraViewport.css';

const matrix = new THREE.Matrix4();
const planeGeometry = new THREE.PlaneGeometry(0.25, 0.25);

function ViewCube() {
    const { gl, scene, camera, size } = useThree();

    const mesh = useRef<THREE.Mesh>(null);
    const axes = useRef<THREE.AxesHelper>(null);
    const virtualCamera = useRef<THREE.Camera>(null);

    const virtualScene = useMemo(() => new THREE.Scene(), []);

    useFrame(() => {
        matrix.copy(camera.matrix).invert();
        mesh.current?.quaternion.setFromRotationMatrix(matrix);
        axes.current?.quaternion.setFromRotationMatrix(matrix);
        gl.autoClear = true;
        gl.render(scene, camera);
        gl.autoClear = false;
        gl.clearDepth();
        gl.render(virtualScene, virtualCamera.current!);
    }, 1);

    return createPortal(
        <>
            <OrthographicCamera ref={virtualCamera} makeDefault={false} position={[0, 0, 100]} />
            <mesh
                ref={mesh}
                raycast={useCamera(virtualCamera as React.MutableRefObject<THREE.Camera>)}
                position={[size.width / 2 - 30, size.height / 2 - 30, 0]}
            >
                <meshLambertMaterial color="white" />
                <boxBufferGeometry args={[10, 10, 10]} />
            </mesh>
            <axesHelper
                ref={axes}
                args={[25]}
                position={[size.width / 2 - 30, size.height / 2 - 30, 0]}
            />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
        </>
    , virtualScene);
}

function Scene() {
    const { state } = useTools();

    const { tiepoints, cameras, vicar, mesh, activeImage, activeTrack, getVICARFile, parseVICARField } = useData();

    const { scene } = useThree();

    const obj = mesh && useLoader(OBJLoader, mesh);

    const virtualCamera = useRef<THREE.Camera>(null!);

    const meshes = useRef<THREE.Group>(null!);

    const [text, setText] = useState<JSX.Element[]>([]);

    const activeTiepoints = useMemo<Tiepoint[]>(() => {
        if (!activeTrack) {
            return tiepoints;
        }
        return tiepoints.filter((t) => t.trackId === activeTrack);
    }, [tiepoints, activeTrack]);

    const activeCameras = useMemo(() => {
        const newCameras = [...new Set(activeTiepoints.map((t) => [t.leftId, t.rightId]).flat())];
        return Object.keys(cameras)
            .filter((k) => newCameras.includes(k))
            .reduce<Record<string, Camera>>((obj, key) => {
                obj[key] = cameras[key];
                return obj;
            }, {});
    }, [activeTiepoints, cameras]);

    const initialPoints = useMemo<[number, number, number][]>(() => {
        if (activeTiepoints.length === 0) {
            return [];
        }
        if (activeTrack) {
            return [activeTiepoints[0].initialXYZ];
        }
        return activeTiepoints.map((t) => t.initialXYZ);
    }, [activeTiepoints]);

    const finalPoints = useMemo<[number, number, number][]>(() => {
        if (activeTiepoints.length === 0) {
            return [];
        }
        if (activeTrack) {
            return [activeTiepoints[0].finalXYZ];
        }
        return activeTiepoints.map((t) => t.finalXYZ);
    }, [activeTiepoints]);

    async function initData() {
        if (meshes.current?.children.length > 0) {
            meshes.current.clear();
        }

        // Exit early if camera filter is toggled off.
        if (!state.isCamera) {
            setText([]);
            return;
        }

        const newText: JSX.Element[] = [];
        for (const [index, cameraId] of Object.keys(activeCameras).entries()) {
            const camera = activeCameras[cameraId];

            const metadata = getVICARFile(cameraId);

            // Get coordinate system transformation group.
            const frameIndex = metadata.findIndex((v) => v === `REFERENCE_COORD_SYSTEM_NAME='SITE_FRAME'`) + 1;
            const group = metadata.slice(frameIndex - 10, frameIndex + 1);

            const originOffset = new THREE.Vector3(...parseVICARField(metadata, 'ORIGIN_OFFSET_VECTOR'));
            const originRotation = new THREE.Quaternion(
                ...parseVICARField(metadata, 'ORIGIN_ROTATION_QUATERNION').slice(1, 4),
                ...parseVICARField(metadata, 'ORIGIN_ROTATION_QUATERNION').slice(0, 1),
            );

            // Apply coordinate transformation to SITE frame.
            if (state.isInitial) {
                renderCamera(
                    index,
                    meshes,
                    camera.initial,
                    originOffset,
                    originRotation,
                    theme.color.initialHex,
                    newText,
                    true,
                );
            }

            if (state.isFinal) {
                renderCamera(
                    index,
                    meshes,
                    camera.final,
                    originOffset,
                    originRotation,
                    theme.color.finalHex,
                    newText,
                    false,
                );
            }
        }

        setText(newText);
    }

    function renderCamera(
        index: number,
        group: React.MutableRefObject<THREE.Group>,
        model: CameraModel,
        originOffset: THREE.Vector3,
        originRotation: THREE.Quaternion,
        color: string,
        newText: JSX.Element[],
        isInitial: boolean,
    ) {
        const C = new THREE.Vector3(...model.C).applyQuaternion(originRotation).add(originOffset);
        const A = new THREE.Vector3(...model.A);
        const H = new THREE.Vector3(...model.H);

        // For future reference: https://jpl.slack.com/archives/C03LP87K0LC/p1660602191939569
        // const HxA = H.clone().cross(A).applyQuaternion(originRotation).normalize();

        A.applyQuaternion(originRotation);

        // Render camera plane.
        const planeMaterial = new THREE.MeshLambertMaterial({ color });
        planeMaterial.side = THREE.DoubleSide;

        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.copy(C);
        plane.lookAt(C.clone().add(A.clone().multiplyScalar(-1)));
        // plane.rotation.setFromVector3(HxA);
        group.current.add(plane);

        // Render camera look direction.
        const lineMaterial = new THREE.LineBasicMaterial({ color });

        const points = [C, C.clone().add(A)];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        group.current.add(line);

        // Render camera ID.
        newText.push(
            <Text
                key={`${index}_${isInitial ? 'initial' : 'final'}`}
                position={C}
                rotation={plane.rotation}
                color={theme.color.white}
                anchorX="center"
                fontSize={0.2}
                depthOffset={-1}
            >
                {index + 1}
            </Text>
        );
    }

    useEffect(() => {
        if (state && activeTiepoints && activeCameras) {
            initData();
        }
    }, [state, activeTiepoints, activeCameras]);

    return (
        <>
            <ambientLight />
            <color attach="background" args={[theme.color.white]} />
            <PerspectiveCamera makeDefault ref={virtualCamera} position={[0, 0, initialPoints[0][2] - 10]} />
            <group ref={meshes} />
            <Instances>
                <sphereGeometry args={[0.05]} />
                <meshLambertMaterial color={theme.color.initialHex} />
                {state.isPoint && state.isInitial && initialPoints.map((p, i) => (
                    <Instance key={i} position={p} />
                ))}
            </Instances>
            <Instances>
                <sphereGeometry args={[0.05]} />
                <meshLambertMaterial color={theme.color.finalHex} />
                {state.isPoint && state.isFinal && finalPoints.map((p, i) => (
                    <Instance key={i} position={p} />
                ))}
            </Instances>
            {text}
            {mesh && <primitive object={obj} />}
            <gridHelper args={[1000, 1000]} rotation={[Math.PI / 2, 0, 0]} />
            <OrbitControls camera={virtualCamera.current} target={initialPoints[0]} />
            {/* @ts-ignore: https://github.com/pmndrs/react-three-fiber/issues/925 */}
            <ViewCube />
        </>
    )
}

export default function CameraViewport() {
    // Need to import entire module instead of named module
    // to set proper axis to match SITE frame.
    THREE.Object3D.DefaultUp.set(0, 0, -1);

    const DataContextBridge = useContextBridge(DataContext);
    const ToolsContextBridge = useContextBridge(ToolsContext);

    return (
        <Canvas className={styles.container}>
            <DataContextBridge>
                <ToolsContextBridge>
                    <Scene />
                </ToolsContextBridge>
            </DataContextBridge>
        </Canvas>
    );
}
