import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    ArrowHelper,
    BufferGeometry,
    Clock,
    Float32BufferAttribute,
    Group,
    Points,
    PointsMaterial,
    Scene,
    Texture,
    TextureLoader,
    Vector2,
    Vector3,
    WebGLRenderer,
} from 'three';

import { Camera, ImageFile, Point, ResidualType, Track, useData } from '@/stores/DataContext';
import { SceneGridAxes, useFilters } from '@/stores/FiltersContext';

import VirtualCamera from '@/gl/VirtualCamera';
import InfiniteGrid from '@/gl/InfiniteGrid';

import { theme } from '@/theme.css';
import * as styles from '@/components/CameraViewport.css';

import discAsset from '@/assets/disc.png';

const tempVec2 = new Vector2();
const tempVec3 = new Vector3();

export default function CameraViewport() {
    const { trackId } = useParams();

    const { filterState } = useFilters();

    const { tracks, cameraMap, cameraImageMap } = useData();

    const sceneRef = useRef<Scene>(new Scene());
    const cameraRef = useRef<VirtualCamera | null>(null);
    const clockRef = useRef<Clock>(new Clock());

    const rAFRef = useRef<number | null>(null);
    const rendererRef = useRef<WebGLRenderer | null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
        if (rendererRef.current && cameraRef.current) {
            const delta = clockRef.current.getDelta();
            cameraRef.current.update(delta);
            rendererRef.current.render(sceneRef.current, cameraRef.current);
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

        const initialVertices = [];
        const finalVertices = [];

        for (const track of activeTracks) {
            const initialPoint = track.initialXYZ;
            const finalPoint = track.finalXYZ;

            xAverage += finalPoint[0];
            yAverage += finalPoint[1];
            zAverage += finalPoint[2];

            initialVertices.push(initialPoint[0], initialPoint[1], initialPoint[2]);
            finalVertices.push(finalPoint[0], finalPoint[1], finalPoint[2]);
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

        initialPointsGeometry.current.setAttribute('position', new Float32BufferAttribute(initialVertices, 3));
        finalPointsGeometry.current.setAttribute('position', new Float32BufferAttribute(finalVertices, 3));

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
            initialCameras.current.add(initialFrustum);

            const finalFrustum = camera.final.getFrustumMesh(tempVec2, ResidualType.FINAL);
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
            if (child instanceof ArrowHelper) {
                child.dispose();
            }
        }

        while (finalCameras.current.children.length > 0) {
            const child = finalCameras.current.children[0];
            finalCameras.current.remove(child);
            if (child instanceof ArrowHelper) {
                child.dispose();
            }
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

        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();

        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
    }, []);

    // This could probably be optimized into individual useEffect handlers.
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
        } else if (initialCameras.current) {
            initialCameras.current.visible = false;
        }

        if (filterState.viewCameras && filterState.viewFinalResiduals && finalCameras.current) {
            finalCameras.current.visible = true;
        } else if (finalCameras.current) {
            finalCameras.current.visible = false;
        }

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
    }, [filterState]);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className={styles.stage}>
            <canvas className={styles.canvas} ref={initCanvas} />
        </div>
    );
}
