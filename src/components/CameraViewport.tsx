import { useRef, useState, useMemo, useEffect, useLayoutEffect, useReducer } from 'react';
import * as THREE from 'three';
import { Canvas, createPortal, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, Bounds, useContextBridge, useCamera, useBounds } from '@react-three/drei';
import { Tiepoint, DataContext, useData } from '@/DataContext';
import { theme } from '@/utils/theme.css';
import * as styles from '@/components/CameraViewport.css';

const matrix = new THREE.Matrix4();

enum PositionType {
    INITIAL = 'INITIAL',
    FINAL = 'FINAL',
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

    const controls = useRef(null);

    const [planes, setPlanes] = useState([]);
    const [lines, setLines] = useState([]);
    const [initialPoint, setInitialPoint] = useState(null);
    const [finalPoint, setFinalPoint] = useState(null);

    const activeTiepoints = useMemo<Tiepoint[]>(() => tiepoints.filter((t) => t.trackId === activeTrack), [tiepoints, activeTrack]);

    const activeCameras = useMemo(() => {
        const newCameras = [...new Set(activeTiepoints.map((t) => [t.leftId, t.rightId]).flat())];
        return Object.keys(cameras).filter((k) => newCameras.includes(k)).reduce((obj, key) => {
            obj[key] = cameras[key];
            return obj;
        }, {});
    }, [activeTiepoints, cameras]);

    async function initData() {
        const newPlanes = [];
        const newLines = [];

        for (const cameraId of Object.keys(activeCameras)) {
            const camera = activeCameras[cameraId];

            const metadata = getVICARFile(cameraId);

            // Get coordinate system transformation group.
            const frameIndex = metadata.findIndex((v) => v === `REFERENCE_COORD_SYSTEM_NAME='SITE_FRAME'`) + 1;
            const group = metadata.slice(frameIndex - 10, frameIndex + 1);

            const originOffset = new THREE.Vector3(...parseVICARField(group[5]));
            const originRotation = new THREE.Quaternion(
                ...parseVICARField(group[6]).slice(1, 4),
                ...parseVICARField(group[6]).slice(0, 1),
            );

            // Apply coordinate transformation to SITE frame.
            const initialC = new THREE.Vector3(...camera.initial.C).applyQuaternion(originRotation).add(originOffset);
            const initialA = new THREE.Vector3(...camera.initial.A);
            const initialH = new THREE.Vector3(...camera.initial.H);
            const initialHxA = initialH.clone().cross(initialA).normalize().applyQuaternion(originRotation).multiplyScalar(-1);

            newPlanes.push(
                <mesh
                    key={`${cameraId}_initial`}
                    position={initialC}
                    rotation={initialHxA.toArray()}
                    visible={state.initial}
                >
                    <planeGeometry args={[1, 1]} />
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
                    points={[initialC, initialC.clone().add(initialA).multiplyScalar(1.025)]}
                    visible={state.initial}
                />
            );

            const finalC = new THREE.Vector3(...camera.final.C).applyQuaternion(originRotation).add(originOffset);
            const finalA = new THREE.Vector3(...camera.final.A);
            const finalH = new THREE.Vector3(...camera.final.H);
            const finalHxA = finalH.clone().cross(finalA).normalize().applyQuaternion(originRotation).multiplyScalar(-1);

            newPlanes.push(
                <mesh
                    key={`${cameraId}_final`}
                    position={finalC}
                    rotation={finalHxA.toArray()}
                    visible={state.final}
                >
                    <planeGeometry args={[1, 1]} />
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
                    visible={state.final}
                />
            );
        }

        setPlanes(newPlanes);
        setLines(newLines);

        setInitialPoint(
            <mesh position={activeTiepoints[0].initialXYZ} visible={state.initial}>
                <sphereGeometry args={[0.25]} />
                <meshLambertMaterial color={theme.color.initialHex} />
            </mesh>
        );
        setFinalPoint(
            <mesh position={activeTiepoints[0].finalXYZ} visible={state.final}>
                <sphereGeometry args={[0.25]} />
                <meshLambertMaterial color={theme.color.finalHex} />
            </mesh>
        );
    }

    useEffect(() => {
        if (state && activeTiepoints && activeCameras) {
            initData();
        }
    }, [state, activeTiepoints, activeCameras]);

    return (
        <>
            <ambientLight intensity={0.5} />
            <Bounds fit clip observe margin={1.2}>
                <SelectToZoom>
                    {planes}
                    {lines}
                    {initialPoint}
                    {finalPoint}
                </SelectToZoom>
            </Bounds>
            <gridHelper args={[1000, 1000]} rotation={[Math.PI / 2, 0, 0]} />
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
    return (
        <div className={styles.tooltip}>
            <div className={styles.item}>
                <input
                    type="checkbox"
                    id="initial"
                    className={styles.checkbox}
                    checked={state.initial}
                    onChange={() => dispatch({ type: PositionType.INITIAL })}
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
                    onChange={() => dispatch({ type: PositionType.FINAL })}
                />
                <label htmlFor="final" className={styles.label}>
                    Final Position
                </label>
            </div>
        </div>
    );
}

function CameraViewport() {
    // Need to import entire module instead of named module
    // to set proper axis to match SITE frame.
    THREE.Object3D.DefaultUp.set(0, 0, -1);

    const ContextBridge = useContextBridge(DataContext);

    const [state, dispatch] = useReducer(reducer, { initial: false, final: true });

    function reducer(state, action) {
        switch (action.type) {
            case PositionType.INITIAL:
                return { ...state, initial: !state.initial };
            case PositionType.FINAL:
                return { ...state, final: !state.final };
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
