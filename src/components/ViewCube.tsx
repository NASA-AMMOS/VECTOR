import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { createPortal, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, useCamera } from '@react-three/drei';

const matrix = new THREE.Matrix4();

export default function ViewCube() {
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
            <axesHelper ref={axes} args={[25]} position={[size.width / 2 - 30, size.height / 2 - 30, 0]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
        </>,
        virtualScene,
    );
}
