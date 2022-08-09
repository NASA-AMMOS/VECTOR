import { useRef, useState, useMemo, useEffect, useLayoutEffect, useReducer } from 'react';
import { fileOpen } from 'browser-fs-access';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { ThreeEvent, Canvas, createPortal, useLoader, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, Bounds, useContextBridge, useCamera, useBounds } from '@react-three/drei';
import { Tiepoint, Camera, CameraModel, DataContext, useData } from '@/DataContext';
import { theme } from '@/utils/theme.css';
import * as styles from '@/components/CameraViewport.css';

const matrix = new THREE.Matrix4();
const planeGeometry = new THREE.PlaneGeometry();

enum ToolType {
    INITIAL = 'INITIAL',
    FINAL = 'FINAL',
    MESH = 'MESH',
};

interface State {
    initial: boolean;
    final: boolean;
    mesh: string | null;
};

interface Action {
    type: ToolType;
    data: string | null;
};

interface SelectToZoomProps {
    children: React.ReactNode[];
};

interface SceneProps {
    state: State;
};

interface TooltipProps {
    state: State;
    dispatch: React.Dispatch<Action>;
};

const initialState: State = { initial: false, final: true, mesh: null };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case ToolType.INITIAL:
            return { ...state, initial: !state.initial };
        case ToolType.FINAL:
            return { ...state, final: !state.final };
        case ToolType.MESH:
            return { ...state, mesh: action.data };
        default:
            return state;
    }
}

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
                <boxBufferGeometry args={[20, 20, 20]} />
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

// This component will wrap children in a group with a click handler.
// Clicking any object will refresh and fit bounds.
function SelectToZoom({ children }: SelectToZoomProps) {
    const api = useBounds();

    function handleClick(event: ThreeEvent<MouseEvent>) {
        event.stopPropagation();
        if (event.delta <= 2) {
            api.refresh(event.object).fit();
        }
    }

    function handlePointerMissed(event: MouseEvent) {
        if (event.button === 0) {
            api.refresh().fit();
        }
    }

    return (
        <group
            onClick={handleClick}
            onPointerMissed={handlePointerMissed}
        >
            {children}
        </group>
    );
}

function Scene({ state }: SceneProps) {
    const { tiepoints, cameras, vicar, activeImage, activeTrack, getVICARFile, parseVICARField } = useData();

    const { scene } = useThree();

    const mesh = state.mesh && useLoader(OBJLoader, state.mesh);

    const controls = useRef(null);
    const meshes = useRef<THREE.Group>(null!);

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

    const [initialXYZ, finalXYZ] = useMemo<[number, number, number][]>(() => {
        if (activeTiepoints.length === 0) {
            return [[0, 0, 0], [0, 0, 0]];
        }
        const tiepoint = activeTiepoints[0];
        return [tiepoint.initialXYZ, tiepoint.finalXYZ];
    }, [activeTiepoints]);

    async function initData() {
        if (meshes.current?.children.length > 0) {
            meshes.current.clear();
        }

        for (const cameraId of Object.keys(activeCameras)) {
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
            if (state.initial) {
                renderCamera(
                    cameraId,
                    meshes,
                    camera.initial,
                    originOffset,
                    originRotation,
                    theme.color.initialHex,
                );
            }

            if (state.final) {
                renderCamera(
                    cameraId,
                    meshes,
                    camera.final,
                    originOffset,
                    originRotation,
                    theme.color.finalHex,
                );
            }
        }
    }

    function renderCamera(
        id: string,
        group: React.MutableRefObject<THREE.Group>,
        model: CameraModel,
        originOffset: THREE.Vector3,
        originRotation: THREE.Quaternion,
        color: string,
    ) {
        const C = new THREE.Vector3(...model.C).applyQuaternion(originRotation).add(originOffset);
        const A = new THREE.Vector3(...model.A);
        const H = new THREE.Vector3(...model.H);
        const HxA = H.clone().cross(A).applyQuaternion(originRotation).normalize();

        A.applyQuaternion(originRotation);

        const planeMaterial = new THREE.MeshLambertMaterial({ color });
        planeMaterial.wireframe = true;

        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.copy(C);
        plane.rotation.setFromVector3(HxA);
        group.current.add(plane);

        const lineMaterial = new THREE.LineBasicMaterial({ color });

        const points = [C, C.clone().add(A)];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        group.current.add(line);
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
            <Bounds fit clip observe margin={1.2}>
                <SelectToZoom>
                    <group ref={meshes} />
                    {activeTrack && initialXYZ && (
                        <mesh position={initialXYZ} visible={state.initial}>
                            <sphereGeometry args={[0.05]} />
                            <meshLambertMaterial color={theme.color.initialHex} />
                        </mesh>
                    )}
                    {activeTrack && finalXYZ && (
                        <mesh position={finalXYZ} visible={state.final}>
                            <sphereGeometry args={[0.05]} />
                            <meshLambertMaterial color={theme.color.finalHex} />
                        </mesh>
                    )}
                    {state.mesh && <primitive object={mesh} />}
                </SelectToZoom>
            </Bounds>
            <gridHelper args={[1000, 1000]} position={[0, 0, finalXYZ[2]]} rotation={[Math.PI / 2, 0, 0]} />
            <OrbitControls
                ref={controls}
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 1.75}
                makeDefault
                screenSpacePanning
            />
            {/* @ts-ignore: https://github.com/pmndrs/react-three-fiber/issues/925 */}
            <ViewCube />
        </>
    )
}

function Tooltip({ state, dispatch }: TooltipProps) {
    async function handleFileInput(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        const file = await fileOpen({ extensions: ['.obj'] });
        dispatch({ type: ToolType.MESH, data: URL.createObjectURL(file) });
    }

    return (
        <div className={styles.tooltip}>
            <div className={styles.item}>
                <button className={styles.input} onClick={handleFileInput}>
                    Upload Mesh
                </button>
            </div>
            <div className={styles.item}>
                <input
                    type="checkbox"
                    id="initial"
                    className={styles.checkbox}
                    checked={state.initial}
                    onChange={() => dispatch({ type: ToolType.INITIAL, data: null })}
                />
                <label htmlFor="initial" className={styles.label}>
                    Initial Position
                </label>
            </div>
            <div className={styles.item}>
                <input
                    type="checkbox"
                    id="final"
                    className={styles.checkbox}
                    checked={state.final}
                    onChange={() => dispatch({ type: ToolType.FINAL, data: null })}
                />
                <label htmlFor="final" className={styles.label}>
                    Final Position
                </label>
            </div>
            {state.mesh && (
                <div className={styles.item}>
                    <input
                        type="checkbox"
                        id="mesh"
                        className={styles.checkbox}
                        checked={!!(state.mesh)}
                        onChange={() => dispatch({ type: ToolType.MESH, data: null })}
                    />
                    <label htmlFor="mesh" className={styles.label}>
                        Mesh
                    </label>
                </div>
            )}
        </div>
    );
}

export default function CameraViewport() {
    // Need to import entire module instead of named module
    // to set proper axis to match SITE frame.
    THREE.Object3D.DefaultUp.set(0, 0, -1);

    const ContextBridge = useContextBridge(DataContext);

    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <section className={styles.container}>
            <Tooltip state={state} dispatch={dispatch} />
            <Canvas className={styles.canvas}>
                <ContextBridge>
                    <Scene state={state} />
                </ContextBridge>
            </Canvas>
        </section>
    )
}
