import { useRef, useState, useMemo, useEffect, useLayoutEffect, useReducer } from 'react';
import { fileOpen } from 'browser-fs-access';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { Canvas, createPortal, useLoader, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, Bounds, useContextBridge, useCamera, useBounds } from '@react-three/drei';
import { Tiepoint, DataContext, useData } from '@/DataContext';
import { theme } from '@/utils/theme.css';
import * as styles from '@/components/CameraViewport.css';

const matrix = new THREE.Matrix4();

enum ToolType {
    INITIAL = 'INITIAL',
    FINAL = 'FINAL',
    MESH = 'MESH',
};

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
                position={[size.width / 2 - 30, size.height / 2 - 30, 0]}
            >
                <meshLambertMaterial color="white" />
                <boxBufferGeometry args={[20, 20, 20]} />
            </mesh>
            <axesHelper
                ref={axes}
                args={[25, 25, 25]}
                position={[size.width / 2 - 30, size.height / 2 - 30, 0]}
            />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
        </>
    , virtualScene);
}

// This component will wrap children in a group with a click handler.
// Clicking any object will refresh and fit bounds.
function SelectToZoom({ children }) {
    const api = useBounds();

    function handleClick(event) {
        event.stopPropagation();
        if (event.delta <= 2) {
            api.refresh(event.object).fit();
        }
    }

    function handlePointerMissed() {
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

function Scene({ state }) {
    const { tiepoints, cameras, vicar, activeImage, activeTrack, getVICARFile, parseVICARField } = useData();

    const mesh = state.mesh && useLoader(OBJLoader, state.mesh);

    const controls = useRef(null);

    const [planes, setPlanes] = useState([]);
    const [lines, setLines] = useState([]);
    const [initialPoint, setInitialPoint] = useState(null);
    const [finalPoint, setFinalPoint] = useState(null);

    const activeTiepoints = useMemo<Tiepoint[]>(() => {
        if (!activeTrack) {
            return tiepoints;
        }
        return tiepoints.filter((t) => t.trackId === activeTrack);
    }, [tiepoints, activeTrack]);

    const activeCameras = useMemo(() => {
        const newCameras = [...new Set(activeTiepoints.map((t) => [t.leftId, t.rightId]).flat())];
        return Object.keys(cameras).filter((k) => newCameras.includes(k)).reduce((obj, key) => {
            obj[key] = cameras[key];
            return obj;
        }, {});
    }, [activeTiepoints, cameras]);

    const [initialXYZ, finalXYZ] = useMemo(() => {
        if (activeTiepoints.length === 0) {
            return [[], []];
        }
        const tiepoint = activeTiepoints[0];
        return [tiepoint.initialXYZ, tiepoint.finalXYZ];
    }, [activeTiepoints]);

    async function initData() {
        const newPlanes = [];
        const newLines = [];

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
            const initialCamera = renderCamera(
                cameraId,
                camera.initial,
                originOffset,
                originRotation,
                theme.color.initialHex,
                state.initial
            );
            newPlanes.push(initialCamera[0]);
            newLines.push(initialCamera[1]);

            const finalCamera = renderCamera(
                cameraId,
                camera.final,
                originOffset,
                originRotation,
                theme.color.finalHex,
                state.final
            );
            newPlanes.push(finalCamera[0]);
            newLines.push(finalCamera[1]);
        }

        setPlanes(newPlanes);
        setLines(newLines);

        if (activeTrack) {
            setInitialPoint(
                <mesh position={initialXYZ} visible={state.initial}>
                    <sphereGeometry args={[0.05]} />
                    <meshLambertMaterial color={theme.color.initialHex} />
                </mesh>
            );
            setFinalPoint(
                <mesh position={finalXYZ} visible={state.final}>
                    <sphereGeometry args={[0.05]} />
                    <meshLambertMaterial color={theme.color.finalHex} />
                </mesh>
            );
        }
    }

    function renderCamera(id ,camera, originOffset, originRotation, color, visible) {
        const C = new THREE.Vector3(...camera.C).applyQuaternion(originRotation).add(originOffset);
        const A = new THREE.Vector3(...camera.A);
        const H = new THREE.Vector3(...camera.H);
        const HxA = H.clone().cross(A).applyQuaternion(originRotation).normalize();

        A.applyQuaternion(originRotation);

        const plane = (
            <mesh
                key={`${id}_${color}`}
                position={C}
                rotation={HxA.toArray()}
                visible={visible}
            >
                <planeGeometry />
                <meshLambertMaterial color={color} wireframe />
            </mesh>
        );

        const line = (
            <Line
                key={`${id}_${color}`}
                color={color}
                points={[C, C.clone().add(A)]}
                visible={visible}
            />
        );

        return [plane, line];
    }

    useEffect(() => {
        if (state && activeTiepoints && activeCameras) {
            initData();
        }
    }, [state, activeTiepoints, activeCameras]);

    return (
        <>
            <ambientLight />
            <Bounds fit clip observe margin={1.2}>
                <SelectToZoom>
                    {planes}
                    {lines}
                    {initialPoint}
                    {finalPoint}
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
            <ViewCube />
        </>
    )
}

function Tooltip({ state, dispatch }) {
    async function handleFileInput(event) {
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
                    onChange={() => dispatch({ type: ToolType.INITIAL })}
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
                    onChange={() => dispatch({ type: ToolType.FINAL })}
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
                        onChange={() => dispatch({ type: ToolType.MESH })}
                    />
                    <label htmlFor="mesh" className={styles.label}>
                        Mesh
                    </label>
                </div>
            )}
        </div>
    );
}

function CameraViewport() {
    // Need to import entire module instead of named module
    // to set proper axis to match SITE frame.
    THREE.Object3D.DefaultUp.set(0, 0, -1);

    const ContextBridge = useContextBridge(DataContext);

    const [state, dispatch] = useReducer(reducer, { initial: false, final: true, mesh: null });

    function reducer(state, action) {
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

export default CameraViewport;
