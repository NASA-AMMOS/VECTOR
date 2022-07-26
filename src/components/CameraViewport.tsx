import { useMemo, useRef, useState, useEffect } from 'react';
import { Scene, Vector3, Euler, Box3, Matrix4 } from 'three';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, Line, useCamera } from '@react-three/drei';
import { useData } from '@/DataContext';
import { theme } from '@/utils/theme.css';
import * as styles from '@/components/CameraViewport.css';

function ViewCube() {
    const { gl, scene, camera, size } = useThree()
    
    const virtualScene = useMemo(() => new Scene(), [])

    const ref = useRef()
    const virtualCamera = useRef()

    const [hover, set] = useState(null)

    const matrix = new Matrix4()

    useFrame(() => {
        matrix.copy(camera.matrix).invert();
        ref.current.quaternion.setFromRotationMatrix(matrix);
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
                ref={ref}
                raycast={useCamera(virtualCamera)}
                position={[size.width / 2 - 80, size.height / 2 - 80, 0]}
                onPointerOut={(e) => set(null)}
                onPointerMove={(e) => set(Math.floor(e.faceIndex / 2))}
            >
                {[...Array(6)].map((_, index) => (
                    <meshLambertMaterial attachArray="material" key={index} color={hover === index ? 'hotpink' : 'white'} />
                ))}
                <boxBufferGeometry attach="geometry" args={[60, 60, 60]} />
            </mesh>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
        </>
    , virtualScene);
}

function Cameras({ tiepoints, cameras }) {
    const { scene, camera } = useThree();

    const controls = useRef(null);

    const [boxes, setBoxes] = useState([]);
    const [lines, setLines] = useState([]);
    const [initialPoint, setInitialPoint] = useState(null);
    const [finalPoint, setFinalPoint] = useState(null);

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

        for (const cameraId of Object.keys(cameras)) {
            const camera = cameras[cameraId];

            const initialC = new Vector3(camera.initial.C[0], -camera.initial.C[2], camera.initial.C[1]);
            const initialA = new Vector3(camera.initial.A[0], -camera.initial.A[2], camera.initial.A[1]);
            const initialH = new Vector3(camera.initial.H[0], -camera.initial.H[2], camera.initial.H[1]);

            const initialHxA = new Euler().setFromVector3(initialH.clone().cross(initialA).normalize());

            newBoxes.push(
                <mesh
                    key={`${cameraId}_initial`}
                    position={initialC}
                    rotation={initialHxA}
                    userData={{ cameraId, initial: true }}
                    visible={false}
                >
                    <boxGeometry args={[0.1, 0.1, 0.1]} />
                    <meshLambertMaterial color={theme.color.initial} opacity={0.5} transparent={true} />
                </mesh>
            );

            newLines.push(
                <Line
                    key={`${cameraId}_initial`}
                    color={theme.color.initial}
                    points={[initialC, initialC.clone().add(initialA)]}
                    userData={{ cameraId, initial: true }}
                    visible={false}
                />
            );

            const finalC = new Vector3(camera.final.C[0], -camera.final.C[2], camera.final.C[1]);
            const finalA = new Vector3(camera.final.A[0], -camera.final.A[2], camera.final.A[1]);
            const finalH = new Vector3(camera.final.H[0], -camera.final.H[2], camera.final.H[1]);

            const finalHxA = new Euler().setFromVector3(finalH.clone().cross(finalA).normalize());

            newBoxes.push(
                <mesh
                    key={`${cameraId}_final`}
                    position={finalC}
                    rotation={finalHxA}
                    userData={{ cameraId, initial: false }}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                >
                    <boxGeometry args={[0.1, 0.1, 0.1]} />
                    <meshLambertMaterial color={theme.color.final} />
                </mesh>
            );

            newLines.push(
                <Line
                    key={`${cameraId}_final`}
                    color={theme.color.final}
                    points={[finalC, finalC.clone().add(finalA)]}
                    userData={{ cameraId, initial: false }}
                />
            );
        }

        setBoxes(newBoxes);
        setLines(newLines);

        // const initialXYZ = tiepoints[0].initialXYZ;
        // setInitialPoint(
        //     <mesh position={[initialXYZ[0], -initialXYZ[2], initialXYZ[1]]}>
        //         <sphereGeometry args={[0.5]} />
        //         <meshBasicMaterial color={theme.color.initial} />
        //     </mesh>
        // );

        // const finalXYZ = tiepoints[0].finalXYZ;
        // setFinalPoint(
        //     <mesh position={[finalXYZ[0], -finalXYZ[2], finalXYZ[1]]}>
        //         <sphereGeometry args={[0.5]} />
        //         <meshBasicMaterial color={theme.color.final} />
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
            <OrbitControls ref={controls} screenSpacePanning />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
            {boxes.length > 0 && boxes}
            {lines.length > 0 && lines}
            {initialPoint}
            {finalPoint}
            <ViewCube />
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
            <color attach="background" args={['white']} />
            <Cameras
                tiepoints={activeTiepoints}
                cameras={activeCameras}
            />
        </Canvas>
    );
}

export default CameraViewport;
