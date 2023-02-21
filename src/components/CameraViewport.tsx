import { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, useContextBridge } from '@react-three/drei';

import { ToolsContext, useTools } from '@/stores/ToolsContext';
import { Track, CameraModel, DataContext, useData, Cameras } from '@/stores/DataContext';

import ViewCube from '@/components/ViewCube';

import { theme } from '@/utils/theme.css';
import * as styles from '@/components/CameraViewport.css';

const object3D = new THREE.Object3D();
const planeGeometry = new THREE.PlaneGeometry(0.25, 0.25);

function Scene() {
    const { state } = useTools();

    const { tracks, cameras, mesh, activeTrack, getVICARFile, parseVICARField } = useData();

    const obj = mesh && useLoader(OBJLoader, mesh);

    const sceneCamera = useRef<THREE.Camera>(null!);

    const cameraMeshes = useRef<THREE.Group>(null!);

    // Manually create instanced meshes over react-three-drei Instances
    // container because it cannot handle large datasets.
    const instancedInitialPoints = useRef<THREE.InstancedMesh>(null);
    const instancedFinalPoints = useRef<THREE.InstancedMesh>(null);

    const [text, setText] = useState<JSX.Element[]>([]);

    const activeTracks = useMemo<Track[]>(() => {
        if (!activeTrack) {
            return tracks;
        }
        return tracks.filter((track) => track.trackId === activeTrack);
    }, [tracks, activeTrack]);

    const activeCameras = useMemo(() => {
        const cameraIds = Object.keys(cameras);
        const newCameraIds: string[] = [];
        const newCameras: Cameras = {};

        for (const track of activeTracks) {
            for (const point of track.points) {
                if (!newCameraIds.includes(point.id)) {
                    newCameraIds.push(point.id);
                }
            }
        }

        for (const id of newCameraIds) {
            if (cameraIds.includes(id)) {
                newCameras[id] = cameras[id];
            }
        }

        return newCameras;
    }, [activeTracks, cameras]);

    const initialPoints = useMemo<[number, number, number][]>(() => {
        if (activeTracks.length === 0) {
            return [];
        }
        if (activeTrack) {
            return [activeTracks[0].initialXYZ];
        }
        return activeTracks.map((track) => track.initialXYZ);
    }, [activeTracks]);

    const finalPoints = useMemo<[number, number, number][]>(() => {
        if (activeTracks.length === 0) {
            return [];
        }
        if (activeTrack) {
            return [activeTracks[0].finalXYZ];
        }
        return activeTracks.map((track) => track.finalXYZ);
    }, [activeTracks]);

    async function initMeshes() {
        if (cameraMeshes.current?.children.length > 0) {
            cameraMeshes.current.clear();
        }

        if (!state.isCamera) {
            // Exit early if camera filter is toggled off.
            setText([]);
        } else {
            const newText: JSX.Element[] = [];
            for (const [index, cameraId] of Object.keys(activeCameras).entries()) {
                const camera = activeCameras[cameraId];

                const metadata = getVICARFile(cameraId);

                // Get coordinate system transformation group.
                // const frameIndex = metadata.findIndex((v) => v === `REFERENCE_COORD_SYSTEM_NAME='SITE_FRAME'`) + 1;
                // const group = metadata.slice(frameIndex - 10, frameIndex + 1);

                const originOffset = new THREE.Vector3(...parseVICARField(metadata, 'ORIGIN_OFFSET_VECTOR'));
                const originRotation = new THREE.Quaternion(
                    ...parseVICARField(metadata, 'ORIGIN_ROTATION_QUATERNION').slice(1, 4),
                    ...parseVICARField(metadata, 'ORIGIN_ROTATION_QUATERNION').slice(0, 1),
                );

                // Apply coordinate transformation to SITE frame.
                if (state.isInitial) {
                    renderCamera(
                        index,
                        cameraMeshes,
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
                        cameraMeshes,
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
        const planeMaterial = new THREE.MeshBasicMaterial({ color });
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
            </Text>,
        );
    }

    useEffect(() => {
        if (state && activeTracks && activeCameras) {
            initMeshes();
        }
    }, [state, activeTracks, activeCameras]);

    useEffect(() => {
        if (state.isPoint && state.isInitial && instancedInitialPoints.current) {
            for (let i = 0; i < initialPoints.length; ++i) {
                const point = initialPoints[i];
                object3D.position.set(point[0], point[1], point[2]);
                object3D.updateMatrix();
                instancedInitialPoints.current.setMatrixAt(i, object3D.matrix);
            }
            instancedInitialPoints.current.instanceMatrix.needsUpdate = true;
        } else if (instancedInitialPoints.current) {
            instancedInitialPoints.current.visible = false;
        }
    }, [state]);

    useEffect(() => {
        if (state.isPoint && state.isFinal && instancedFinalPoints.current) {
            for (let i = 0; i < finalPoints.length; ++i) {
                const point = finalPoints[i];
                object3D.position.set(point[0], point[1], point[2]);
                object3D.updateMatrix();
                instancedFinalPoints.current.setMatrixAt(i, object3D.matrix);
            }
            instancedFinalPoints.current.instanceMatrix.needsUpdate = true;
        } else if (instancedFinalPoints.current) {
            instancedFinalPoints.current.visible = false;
        }
    }, [state]);

    return (
        <>
            <color attach="background" args={[theme.color.white]} />
            <PerspectiveCamera makeDefault ref={sceneCamera} />
            <group ref={cameraMeshes} />
            <instancedMesh ref={instancedInitialPoints} args={[undefined, undefined, initialPoints.length]}>
                <sphereGeometry args={[0.05]} />
                <meshBasicMaterial color={theme.color.initialHex} />
            </instancedMesh>
            <instancedMesh ref={instancedFinalPoints} args={[undefined, undefined, finalPoints.length]}>
                <sphereGeometry args={[0.05]} />
                <meshBasicMaterial color={theme.color.finalHex} />
            </instancedMesh>
            {text}
            {mesh && <primitive object={obj} />}
            <OrbitControls camera={sceneCamera.current} target={initialPoints[0]} />
            {/* @ts-ignore: https://github.com/pmndrs/react-three-fiber/issues/925 */}
            <ViewCube />
        </>
    );
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
