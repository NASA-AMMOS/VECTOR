import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    BufferAttribute,
    BufferGeometry,
    Clock,
    Group,
    Mesh,
    Points,
    PointsMaterial,
    Raycaster,
    Scene,
    Texture,
    TextureLoader,
    Vector2,
    Vector3,
    WebGLRenderer,
} from 'three';

import { Camera, ImageFile, Point, ResidualType, Track, useData } from '@/stores/DataContext';
import { Filter, SceneGridAxes, useFilters } from '@/stores/FiltersContext';

import VirtualCamera from '@/gl/VirtualCamera';
import InfiniteGrid from '@/gl/InfiniteGrid';

import { theme } from '@/theme.css';
import * as styles from '@/components/CameraViewport.css';

import discAsset from '@/assets/disc.png';

const tempVec2 = new Vector2();
const tempVec3 = new Vector3();

export default function CameraViewport() {
    const { trackId } = useParams();

    const { filterState, dispatchFilter } = useFilters();

    const { tracks, cameraMap, cameraImageMap, hashTrackMap, hasher } = useData();

    const sceneRef = useRef<Scene>(new Scene());
    const cameraRef = useRef<VirtualCamera | null>(null);
    const clockRef = useRef<Clock>(new Clock());

    const rAFRef = useRef<number | null>(null);
    const rendererRef = useRef<WebGLRenderer | null>(null);

    const raycasterRef = useRef<Raycaster>(new Raycaster());
    const mouseRef = useRef<Vector2>(new Vector2());

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasRectRef = useRef<DOMRect | null>(null);

    const infiniteGrid = useRef<InfiniteGrid>(new InfiniteGrid());

    const spriteTexture = useRef<Texture>(new TextureLoader().load(discAsset));

    const initialPoints = useRef<Points | null>(null);
    const initialPointsGeometry = useRef<BufferGeometry>(new BufferGeometry());
    const initialPointsMaterial = useRef<PointsMaterial>(
        new PointsMaterial({
            color: theme.color.initialHex,
            sizeAttenuation: true,
            map: spriteTexture.current,
            alphaTest: 0.25,
            transparent: true,
        }),
    );

    const finalPoints = useRef<Points | null>(null);
    const finalPointsGeometry = useRef<BufferGeometry>(new BufferGeometry());
    const finalPointsMaterial = useRef<PointsMaterial>(
        new PointsMaterial({
            color: theme.color.finalHex,
            sizeAttenuation: true,
            map: spriteTexture.current,
            alphaTest: 0.25,
            transparent: true,
        }),
    );

    const initialCameras = useRef<Group>(new Group());
    const finalCameras = useRef<Group>(new Group());

    const activeTracks = useMemo<Track[]>(() => {
        if (!trackId) {
            return tracks;
        }
        return tracks.filter((track) => track.id === trackId);
    }, [tracks, trackId]);

    const activePoints = useMemo<Point[]>(() => {
        return activeTracks.map((t) => t.points).flat();
    }, [activeTracks]);

    const animate = () => {
        const renderer = rendererRef.current;
        const camera = cameraRef.current;

        if (renderer && camera) {
            const delta = clockRef.current.getDelta();
            camera.update(delta);

            renderer.render(sceneRef.current, camera);
        }

        rAFRef.current = requestAnimationFrame(animate);
    };

    const initPoints = async () => {
        disposePoints();
        if (activeTracks.length < 1) return;

        // There are many approaches to calculating the centroid of a point cloud.
        // This is the naive approach that takes the average of each axis.
        // https://stackoverflow.com/questions/77936/whats-the-best-way-to-calculate-a-3d-or-n-d-centroid
        let xAverage = 0;
        let yAverage = 0;
        let zAverage = 0;

        const initialVertices = new Float32Array(activeTracks.length * 3);
        const initialIds = new Int32Array(activeTracks.length);

        const finalVertices = new Float32Array(activeTracks.length * 3);
        const finalIds = new Int32Array(activeTracks.length);

        for (const [i, track] of activeTracks.entries()) {
            const hashedId = hasher(track.id);

            const initialPoint = track.initialXYZ;
            const finalPoint = track.finalXYZ;

            xAverage += finalPoint[0];
            yAverage += finalPoint[1];
            zAverage += finalPoint[2];

            initialVertices[i * 3] = initialPoint[0];
            initialVertices[i * 3 + 1] = initialPoint[1];
            initialVertices[i * 3 + 2] = initialPoint[2];
            initialIds[i] = hashedId;

            finalVertices[i * 3] = finalPoint[0];
            finalVertices[i * 3 + 1] = finalPoint[1];
            finalVertices[i * 3 + 2] = finalPoint[2];
            finalIds[i] = hashedId;
        }

        // Add a minor offset to prevent division by one.
        // If you divide by one, the average will be the same as the camera target,
        // which will produce unexpected results with the controls.
        xAverage /= activeTracks.length === 1 ? 0.99 : activeTracks.length;
        yAverage /= activeTracks.length === 1 ? 0.99 : activeTracks.length;
        zAverage /= activeTracks.length === 1 ? 0.99 : activeTracks.length;

        if (cameraRef.current) {
            cameraRef.current.position.set(xAverage, yAverage, zAverage);

            const firstXYZ = activeTracks[0].initialXYZ;
            tempVec3.set(firstXYZ[0], firstXYZ[1], firstXYZ[2]);
            cameraRef.current.lookAt(tempVec3);
        }

        infiniteGrid.current.position.set(xAverage, yAverage, zAverage);

        initialPointsGeometry.current.setAttribute('position', new BufferAttribute(initialVertices, 3));
        initialPointsGeometry.current.setAttribute('tracks', new BufferAttribute(initialIds, 1));

        finalPointsGeometry.current.setAttribute('position', new BufferAttribute(finalVertices, 3));
        finalPointsGeometry.current.setAttribute('tracks', new BufferAttribute(finalIds, 1));

        initialPoints.current = new Points(initialPointsGeometry.current, initialPointsMaterial.current);
        sceneRef.current.add(initialPoints.current);

        finalPoints.current = new Points(finalPointsGeometry.current, finalPointsMaterial.current);
        sceneRef.current.add(finalPoints.current);
    };

    const initCameras = async () => {
        const data: { [key: string]: { image: ImageFile; camera: Camera } } = {};
        for (const point of activePoints) {
            if (!(point.cameraId in data)) {
                data[point.cameraId] = { image: cameraImageMap[point.cameraId], camera: cameraMap[point.cameraId] };
            }
        }

        disposeCameras();

        for (const { image, camera } of Object.values(data)) {
            tempVec2.set(image.width, image.height);

            const initialFrustum = camera.initial.getFrustumMesh(tempVec2, ResidualType.INITIAL);
            initialFrustum.userData.cameraId = camera.id;
            initialCameras.current.add(initialFrustum);

            const finalFrustum = camera.final.getFrustumMesh(tempVec2, ResidualType.FINAL);
            finalFrustum.userData.cameraId = camera.id;
            finalCameras.current.add(finalFrustum);
        }
    };

    const disposePoints = () => {
        initialPointsGeometry.current.dispose();
        initialPointsMaterial.current.dispose();

        finalPointsGeometry.current.dispose();
        finalPointsMaterial.current.dispose();

        spriteTexture.current.dispose();
    };

    const disposeCameras = () => {
        while (initialCameras.current.children.length > 0) {
            const child = initialCameras.current.children[0];
            initialCameras.current.remove(child);
        }

        while (finalCameras.current.children.length > 0) {
            const child = finalCameras.current.children[0];
            finalCameras.current.remove(child);
        }
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
        canvasRectRef.current = canvas.getBoundingClientRect();

        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();

        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const handleClick = (event: MouseEvent) => {
        const canvas = canvasRef.current;
        const canvasRect = canvasRectRef.current;

        const renderer = rendererRef.current;
        const camera = cameraRef.current;

        const raycaster = raycasterRef.current;
        const mouse = mouseRef.current;
        const scene = sceneRef.current;

        if (canvas && canvasRect && renderer && camera) {
            const x = event.clientX - canvasRect.left;
            const y = event.clientY - canvasRect.top;

            mouse.x = (x / canvas.clientWidth) * 2.0 - 1.0;
            mouse.y = (y / canvas.clientHeight) * -2.0 + 1.0;

            const delta = clockRef.current.getDelta();
            camera.update(delta);

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children);

            // Intersections are sorted by distance, so after the first valid
            // intersection we can exit.
            for (const intersect of intersects) {
                // Check for cameras.
                if (
                    intersect.object instanceof Mesh &&
                    intersect.object.parent instanceof Group &&
                    intersect.object.parent.userData.cameraId !== undefined
                ) {
                    const cameraId = intersect.object.parent.userData.cameraId;
                    dispatchFilter({ type: Filter.SELECT_CAMERA, data: cameraId });
                    return;
                }

                // Check for points.
                if (intersect.object instanceof Points && intersect.index) {
                    const index = intersect.index;

                    if (intersect.object.geometry instanceof BufferGeometry) {
                        const tracks = intersect.object.geometry.getAttribute('tracks');

                        if (tracks instanceof BufferAttribute) {
                            const hashedId = tracks.getX(index);

                            if (hashedId in hashTrackMap) {
                                const track = hashTrackMap[hashedId];
                                dispatchFilter({ type: Filter.SELECT_TRACK, data: track.id });
                                return;
                            }
                        }
                    }
                }
            }
        }
    };

    const initCanvas = useCallback((canvas: HTMLCanvasElement) => {
        canvasRef.current = canvas;

        if (!canvas || !canvas.parentElement) {
            if (rAFRef.current) cancelAnimationFrame(rAFRef.current);

            while (sceneRef.current.children.length > 0) {
                const child = sceneRef.current.children[0];
                sceneRef.current.remove(child);
            }

            disposePoints();
            disposeCameras();

            if (cameraRef.current) cameraRef.current.dispose();

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

        rendererRef.current = new WebGLRenderer({ canvas });
        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(Math.min(2, window.devicePixelRatio));
        rendererRef.current.setClearColor(theme.color.white);

        cameraRef.current = new VirtualCamera(width / height, rendererRef.current.domElement);

        sceneRef.current.add(infiniteGrid.current);
        sceneRef.current.add(initialCameras.current);
        sceneRef.current.add(finalCameras.current);

        initPoints();
        initCameras();

        rAFRef.current = requestAnimationFrame(animate);

        canvasRectRef.current = canvas.getBoundingClientRect();
        canvas.addEventListener('click', handleClick);
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
    }, [filterState.viewPoints, filterState.viewInitialResiduals, filterState.viewFinalResiduals]);

    useEffect(() => {
        if (filterState.viewCameras && filterState.viewInitialResiduals && initialCameras.current) {
            initialCameras.current.visible = true;
        } else if (initialCameras.current) {
            initialCameras.current.visible = false;
        }

        if (filterState.viewCameras && filterState.viewFinalResiduals && finalCameras.current) {
            finalCameras.current.visible = true;
        } else if (finalCameras.current) {
            finalCameras.current.visible = false;
        }
    }, [filterState.viewCameras, filterState.viewInitialResiduals, filterState.viewFinalResiduals]);

    // This could probably be optimized into individual useEffect handlers.
    useEffect(() => {
        switch (filterState.sceneGridAxes) {
            case SceneGridAxes.XZ:
                infiniteGrid.current.material.uniforms.uAxesType.value = 0.0;
                break;
            case SceneGridAxes.XY:
                infiniteGrid.current.material.uniforms.uAxesType.value = 1.0;
                break;
            case SceneGridAxes.YZ:
                infiniteGrid.current.material.uniforms.uAxesType.value = 2.0;
                break;
        }
    }, [filterState.sceneGridAxes]);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (canvasRef.current) {
                canvasRef.current.removeEventListener('click', handleClick);
            }
        };
    }, []);

    return (
        <div className={styles.stage}>
            <canvas ref={initCanvas} className={styles.canvas} tabIndex={0} />
        </div>
    );
}
