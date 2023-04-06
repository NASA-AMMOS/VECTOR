import { useRef, useMemo, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Track, Camera, useData } from '@/stores/DataContext';
import { useFilters } from '@/stores/FiltersContext';

import CameraModel from '@/models/Camera';
import Vec3Utils, { Vec3 } from '@/models/Vec3';
import { Quat } from '@/models/Quat';

import { theme } from '@/theme.css';

// Set proper axis to match SITE frame.
THREE.Object3D.DefaultUp.set(0, 0, -1);

const tempVector = new THREE.Vector3();
const object3D = new THREE.Object3D();

const sphereGeometry = new THREE.SphereGeometry(0.05);
const planeGeometry = new THREE.PlaneGeometry(0.5, 0.5);

const initialMaterial = new THREE.MeshBasicMaterial({ color: theme.color.initialHex, side: THREE.DoubleSide });
const finalMaterial = new THREE.MeshBasicMaterial({ color: theme.color.finalHex, side: THREE.DoubleSide });

const initialLineMaterial = new THREE.LineBasicMaterial({ color: theme.color.initialHex });
const finalLineMaterial = new THREE.LineBasicMaterial({ color: theme.color.finalHex });

export default function CameraViewport() {
    const { trackId: activeTrack } = useParams();

    const { filterState } = useFilters();

    const { tracks, cameraMap: cameraImageMap, getVICARFile, parseVICARField } = useData();

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
        return tracks.filter((track) => track.id === activeTrack);
    }, [tracks, activeTrack]);

    const animate = () => {
        if (rendererRef.current && controlsRef.current && cameraRef.current) {
            controlsRef.current.update();
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        }

        rAFRef.current = requestAnimationFrame(animate);
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
        const cameras: { [key: string]: Camera } = {};
        for (const track of activeTracks) {
            for (const point of track.points) {
                if (!(point.cameraId in cameras)) {
                    cameras[point.cameraId] = cameraImageMap[point.cameraId];
                }
            }
        }

        if (!initialCameras.current) {
            initialCameras.current = new THREE.InstancedMesh(
                planeGeometry,
                initialMaterial,
                Object.keys(cameras).length,
            );
            sceneRef.current.add(initialCameras.current);
        }

        if (!finalCameras.current) {
            finalCameras.current = new THREE.InstancedMesh(planeGeometry, finalMaterial, Object.keys(cameras).length);
            sceneRef.current.add(finalCameras.current);
        }

        for (const [i, camera] of Object.values(cameras).entries()) {
            const metadata = getVICARFile(camera.id);

            const originOffset = parseVICARField(metadata, 'ORIGIN_OFFSET_VECTOR') as Vec3;
            const originRotation = [
                ...parseVICARField(metadata, 'ORIGIN_ROTATION_QUATERNION').slice(1, 4),
                ...parseVICARField(metadata, 'ORIGIN_ROTATION_QUATERNION').slice(0, 1),
            ] as Quat;

            // Apply coordinate transformation to SITE frame.
            initCamera(i, camera, camera.initial, originOffset, originRotation, true);
            initCamera(i, camera, camera.final, originOffset, originRotation, false);
        }
    };

    const initCamera = (
        i: number,
        camera: Camera,
        cameraModel: CameraModel,
        originOffset: Vec3,
        originRotation: Quat,
        isInitial: boolean,
    ) => {
        const center = Vec3Utils.add(Vec3Utils.applyQuat(cameraModel.getCenter(), originRotation), originOffset);
        object3D.position.fromArray(center);

        const ray = cameraModel.getForwardVector(camera.imageWidth, camera.imageHeight);
        object3D.lookAt(tempVector.fromArray(Vec3Utils.add(center, ray[1])));

        const instancedMesh = isInitial ? initialCameras.current : finalCameras.current;
        if (!instancedMesh) throw new Error('Instanced camera meshes are undefined');

        object3D.updateMatrix();
        instancedMesh.setMatrixAt(i, object3D.matrix);

        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3().fromArray(center),
            new THREE.Vector3().copy(tempVector),
        ]);
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

        const computedStyle = getComputedStyle(canvas.parentElement);
        const width =
            canvas.parentElement.clientWidth -
            (parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight));
        const height =
            canvas.parentElement.clientHeight -
            (parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom));

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
        rendererRef.current.setClearColor(theme.color.white);

        if (!controlsRef.current) {
            controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
            controlsRef.current.panSpeed = 0.5;
            controlsRef.current.rotateSpeed = 0.5;
            controlsRef.current.zoomSpeed = 0.5;
        }

        initPoints();
        initCameras();

        rAFRef.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        if (filterState.viewPoints && filterState.viewInitialResiduals && initialPoints.current) {
            initialPoints.current.visible = true;
        } else if (initialPoints.current) {
            initialPoints.current.visible = false;
        }

        if (filterState.viewPoints && filterState.viewFinalResiduals && finalPoints.current) {
            finalPoints.current.visible = true;
        } else if (finalPoints.current) {
            finalPoints.current.visible = false;
        }

        if (filterState.viewCameras && filterState.viewInitialResiduals && initialCameras.current) {
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

        if (filterState.viewCameras && filterState.viewFinalResiduals && finalCameras.current) {
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
    }, [filterState]);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <canvas ref={initCanvas} />;
}
