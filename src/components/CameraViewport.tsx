import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    ArrowHelper,
    BufferGeometry,
    Float32BufferAttribute,
    Group,
    PerspectiveCamera,
    Points,
    PointsMaterial,
    Scene,
    Texture,
    TextureLoader,
    Vector2,
    Vector3,
    WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Camera, ImageFile, Point, ResidualType, Track, useData } from '@/stores/DataContext';
import { useFilters } from '@/stores/FiltersContext';

import InfiniteGrid from '@/components/InfiniteGrid';

import { theme } from '@/theme.css';
import * as styles from '@/components/CameraViewport.css';

import discAsset from '@/assets/disc.png';

const tempVec2 = new Vector2();

export default function CameraViewport() {
    const { trackId } = useParams();

    const { filterState } = useFilters();

    const { tracks, cameraMap, cameraImageMap } = useData();

    const sceneRef = useRef<Scene>(new Scene());
    const cameraRef = useRef<PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);

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
        if (rendererRef.current && controlsRef.current && cameraRef.current) {
            controlsRef.current.update();
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        }

        rAFRef.current = requestAnimationFrame(animate);
    };

    const initPoints = async () => {
        disposePoints();
        if (activeTracks.length < 1) return;

        let xAverage = 0;
        let yAverage = 0;
        let zAverage = 0;

        const initialVertices = [];
        const finalVertices = [];

        for (const track of activeTracks) {
            const initialPoint = track.initialXYZ;
            const finalPoint = track.finalXYZ;

            xAverage += initialPoint[0];
            yAverage += initialPoint[1];
            zAverage += initialPoint[2];

            initialVertices.push(initialPoint[0], initialPoint[1], initialPoint[2]);
            finalVertices.push(finalPoint[0], finalPoint[1], finalPoint[2]);
        }

        // Add a minor offset to prevent division by one.
        // If you divide by one, the average will be the same as the camera target,
        // which will produce unexpected results with the controls.
        xAverage /= activeTracks.length === 1 ? 0.99 : activeTracks.length;
        yAverage /= activeTracks.length === 1 ? 0.99 : activeTracks.length;
        zAverage /= activeTracks.length === 1 ? 0.99 : activeTracks.length;

        if (cameraRef.current && controlsRef.current) {
            cameraRef.current.position.set(xAverage, yAverage, zAverage);

            const firstXYZ = activeTracks[0].initialXYZ;
            controlsRef.current.target.set(firstXYZ[0], firstXYZ[1], firstXYZ[2]);
            controlsRef.current.update();
        }

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

        cameraRef.current = new PerspectiveCamera(45.0, width / height, 0.1, 1000);
        cameraRef.current.position.set(5, 5, 5);
        cameraRef.current.lookAt(new Vector3());

        rendererRef.current = new WebGLRenderer({ canvas });
        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(Math.min(2, window.devicePixelRatio));
        rendererRef.current.setClearColor(theme.color.white);

        controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        controlsRef.current.panSpeed = 0.25;
        controlsRef.current.zoomSpeed = 0.25;
        controlsRef.current.rotateSpeed = 0.25;

        sceneRef.current.add(infiniteGrid.current);
        sceneRef.current.add(initialCameras.current);
        sceneRef.current.add(finalCameras.current);

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
        } else if (initialCameras.current) {
            initialCameras.current.visible = false;
        }

        if (filterState.viewCameras && filterState.viewFinalResiduals && finalCameras.current) {
            finalCameras.current.visible = true;
        } else if (finalCameras.current) {
            finalCameras.current.visible = false;
        }
    }, [filterState]);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className={styles.canvas}>
            <canvas ref={initCanvas} />
        </div>
    );
}
