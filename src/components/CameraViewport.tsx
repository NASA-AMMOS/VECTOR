import { useRef, useMemo, useEffect, useCallback, useReducer } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { useTools } from '@/stores/ToolsContext';
import { Track, CameraModel, useData } from '@/stores/DataContext';

import { theme } from '@/utils/theme.css';

// Set proper axis to match SITE frame.
THREE.Object3D.DefaultUp.set(0, 0, -1);

const object3D = new THREE.Object3D();

const sphereGeometry = new THREE.SphereGeometry(0.05);
const planeGeometry = new THREE.PlaneGeometry(0.5, 0.5);

const initialMaterial = new THREE.MeshBasicMaterial({ color: theme.color.initialHex, side: THREE.DoubleSide });
const finalMaterial = new THREE.MeshBasicMaterial({ color: theme.color.finalHex, side: THREE.DoubleSide });

const initialLineMaterial = new THREE.LineBasicMaterial({ color: theme.color.initialHex });
const finalLineMaterial = new THREE.LineBasicMaterial({ color: theme.color.finalHex });

export default function CameraViewport() {
    const { state } = useTools();

    const { tracks, cameras, activeTrack, getVICARFile, parseVICARField } = useData();

    const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);

    const rAFRef = useRef<number | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const initialPoints = useRef<THREE.InstancedMesh | null>(null);
    const finalPoints = useRef<THREE.InstancedMesh | null>(null);

    const initialCameras = useRef<THREE.InstancedMesh | null>(null);
    const finalCameras = useRef<THREE.InstancedMesh | null>(null);

    const activeTracks = useMemo<Track[]>(() => {
        if (!activeTrack) {
            return tracks;
        }
        return tracks.filter((track) => track.trackId === activeTrack);
    }, [tracks, activeTrack]);

    const animate = () => {
        rAFRef.current = requestAnimationFrame(animate);

        if (rendererRef.current && controlsRef.current && cameraRef.current) {
            controlsRef.current.update();
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
    };

    const initPoints = () => {
        if (!initialPoints.current) {
            initialPoints.current = new THREE.InstancedMesh(sphereGeometry, initialMaterial, activeTracks.length);
            sceneRef.current.add(initialPoints.current);
        }

        if (!finalPoints.current) {
            finalPoints.current = new THREE.InstancedMesh(sphereGeometry, finalMaterial, activeTracks.length);
            sceneRef.current.add(finalPoints.current);
        }

        let xAverage = 0;
        let yAverage = 0;
        let zAverage = 0;
        for (const [i, track] of activeTracks.entries()) {
            const initialPoint = track.initialXYZ;
            const finalPoint = track.finalXYZ;

            xAverage += initialPoint[0];
            yAverage += initialPoint[1];
            zAverage += initialPoint[2];

            object3D.position.set(initialPoint[0], initialPoint[1], initialPoint[2]);
            object3D.updateMatrix();
            initialPoints.current.setMatrixAt(i, object3D.matrix);

            object3D.position.set(finalPoint[0], finalPoint[1], finalPoint[2]);
            object3D.updateMatrix();
            finalPoints.current.setMatrixAt(i, object3D.matrix);
        }

        // Add a minor offset to prevent division by one.
        // If you divide by one, the average will be the same as the camera target,
        // which will produce unexpected results with the controls.
        xAverage /= activeTracks.length === 1 ? 0.99 : activeTracks.length;
        yAverage /= activeTracks.length === 1 ? 0.99 : activeTracks.length;
        zAverage /= activeTracks.length === 1 ? 0.99 : activeTracks.length;

        if (cameraRef.current && controlsRef.current) {
            cameraRef.current.position.set(xAverage, yAverage, zAverage);

            controlsRef.current.target.set(...activeTracks[0].initialXYZ);
            controlsRef.current.update();
        }

        initialPoints.current.instanceMatrix.needsUpdate = true;
        finalPoints.current.instanceMatrix.needsUpdate = true;
    };

    const initCameras = () => {
        const cameraIds: string[] = [];
        for (const track of activeTracks) {
            for (const point of track.points) {
                if (point.id in cameras && !cameraIds.includes(point.id)) {
                    cameraIds.push(point.id);
                }
            }
        }

        if (!initialCameras.current) {
            initialCameras.current = new THREE.InstancedMesh(planeGeometry, initialMaterial, cameraIds.length);
            sceneRef.current.add(initialCameras.current);
        }

        if (!finalCameras.current) {
            finalCameras.current = new THREE.InstancedMesh(planeGeometry, finalMaterial, cameraIds.length);
            sceneRef.current.add(finalCameras.current);
        }

        for (const [i, id] of cameraIds.entries()) {
            const camera = cameras[id];

            const metadata = getVICARFile(id);

            // Get coordinate system transformation group.
            // const frameIndex = metadata.findIndex((v) => v === `REFERENCE_COORD_SYSTEM_NAME='SITE_FRAME'`) + 1;
            // const group = metadata.slice(frameIndex - 10, frameIndex + 1);

            const originOffset = new THREE.Vector3(...parseVICARField(metadata, 'ORIGIN_OFFSET_VECTOR'));
            const originRotation = new THREE.Quaternion(
                ...parseVICARField(metadata, 'ORIGIN_ROTATION_QUATERNION').slice(1, 4),
                ...parseVICARField(metadata, 'ORIGIN_ROTATION_QUATERNION').slice(0, 1),
            );

            // Apply coordinate transformation to SITE frame.
            initCamera(i, camera.initial, originOffset, originRotation, true);
            initCamera(i, camera.final, originOffset, originRotation, false);
        }
    };

    const initCamera = (
        i: number,
        model: CameraModel,
        originOffset: THREE.Vector3,
        originRotation: THREE.Quaternion,
        isInitial: boolean,
    ) => {
        const C = new THREE.Vector3(...model.C).applyQuaternion(originRotation).add(originOffset);
        const A = new THREE.Vector3(...model.A);
        const H = new THREE.Vector3(...model.H);

        A.applyQuaternion(originRotation);

        // Render camera plane.
        object3D.position.copy(C);
        object3D.lookAt(C.clone().add(A.clone().multiplyScalar(-1)));
        object3D.updateMatrix();

        const instancedMesh = isInitial ? initialCameras.current : finalCameras.current;
        if (!instancedMesh) throw new Error('Instanced camera meshes are undefined');

        instancedMesh.setMatrixAt(i, object3D.matrix);

        // Render camera look direction.
        const points = [C, C.clone().add(A)];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = isInitial ? initialLineMaterial : finalLineMaterial;
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.userData.isLine = true;
        line.userData.isInitial = isInitial;
        sceneRef.current.add(line);
    };

    const handleResize = () => {
        if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;

        const canvas = canvasRef.current;
        if (!canvas.parentElement) return;

        const rect = canvas.parentElement.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        canvas.width = width;
        canvas.height = height;

        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();

        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const initCanvas = useCallback((canvas: HTMLCanvasElement) => {
        canvasRef.current = canvas;

        if (!canvas || !canvas.parentElement) {
            if (rAFRef.current) cancelAnimationFrame(rAFRef.current);

            if (initialPoints.current) initialPoints.current.dispose();
            if (finalPoints.current) finalPoints.current.dispose();

            if (initialCameras.current) initialCameras.current.dispose();
            if (finalCameras.current) finalCameras.current.dispose();

            for (const child of sceneRef.current.children) {
                if (child instanceof THREE.Line) {
                    sceneRef.current.remove(child);
                    child.geometry.dispose();
                }
            }

            return;
        }

        const rect = canvas.parentElement.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        canvas.width = width;
        canvas.height = height;

        if (!cameraRef.current) {
            cameraRef.current = new THREE.PerspectiveCamera(45.0, width / height, 0.1, 1000);
        }

        if (!rendererRef.current) {
            rendererRef.current = new THREE.WebGLRenderer({ canvas });
        }
        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(Math.min(2, window.devicePixelRatio));
        rendererRef.current.setClearColor(theme.color.background);

        if (!controlsRef.current) {
            controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        }

        initPoints();
        initCameras();

        rAFRef.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        if (state.isPoint && state.isInitial && initialPoints.current) {
            initialPoints.current.visible = true;
        } else if (initialPoints.current) {
            initialPoints.current.visible = false;
        }

        if (state.isPoint && state.isFinal && finalPoints.current) {
            finalPoints.current.visible = true;
        } else if (finalPoints.current) {
            finalPoints.current.visible = false;
        }

        if (state.isCamera && state.isInitial && initialCameras.current) {
            initialCameras.current.visible = true;
            sceneRef.current.traverse((object) => {
                const userData = object.userData;
                if (userData.isLine && userData.isInitial) {
                    object.visible = true;
                }
            });
        } else if (initialCameras.current) {
            initialCameras.current.visible = false;
            sceneRef.current.traverse((object) => {
                const userData = object.userData;
                if (userData.isLine && userData.isInitial) {
                    object.visible = false;
                }
            });
        }

        if (state.isCamera && state.isFinal && finalCameras.current) {
            finalCameras.current.visible = true;
            sceneRef.current.traverse((object) => {
                const userData = object.userData;
                if (userData.isLine && !userData.isInitial) {
                    object.visible = true;
                }
            });
        } else if (finalCameras.current) {
            finalCameras.current.visible = false;
            sceneRef.current.traverse((object) => {
                const userData = object.userData;
                if (userData.isLine && !userData.isInitial) {
                    object.visible = false;
                }
            });
        }
    }, [state]);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <canvas ref={initCanvas} />;
}
