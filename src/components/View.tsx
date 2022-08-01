// This is a modified version of the <View /> component in @react-three/drei.
// This version supports a parent component to help determine if the view is offscreen.

import { ReactNode, MutableRefObject, useEffect, useRef, useState, useCallback, useReducer } from 'react';
import * as THREE from 'three';
import { createPortal, useFrame, useThree, Size } from '@react-three/fiber';

const isOrthographicCamera = (def: any): def is THREE.OrthographicCamera => def && (def as THREE.OrthographicCamera).isOrthographicCamera;

export type ContainerProps = {
    scene: THREE.Scene
    index: number
    children?: ReactNode
    frames: number
    rect: MutableRefObject<DOMRect>
    track: MutableRefObject<HTMLElement>
    parent?: MutableRefObject<HTMLElement>
    canvasSize: Size
};

export type ViewProps = {
    /** The tracking element, the view will be cut according to its whereabouts */
    track: MutableRefObject<HTMLElement>
    /** The parent element, the view will be visible based on its bounds */
    parent?: MutableRefObject<HTMLElement>
    /** Views take over the render loop, optional render index (1 by default) */
    index?: number
    /** If you know your view is always at the same place set this to 1 to avoid needless getBoundingClientRect overhead */
    frames?: number
    /** The scene to render, if you leave this undefined it will render the default scene */
    children?: ReactNode
};

function Container({ canvasSize, scene, index, children, frames, rect, track, parent }: ContainerProps) {
    const get = useThree((state) => state.get);
    const camera = useThree((state) => state.camera);
    const virtualScene = useThree((state) => state.scene);
    const setEvents = useThree((state) => state.setEvents);

    let frameCount = 0;

    useFrame(({ gl }) => {
        if (frames === Infinity || frameCount <= frames) {
            rect.current = track.current?.getBoundingClientRect();
            frameCount++;
        }

        if (rect.current) {
            const { left, right, top, bottom, width, height } = rect.current;

            let isOffscreen = bottom < 0 || top > canvasSize.height || right < 0 || left > canvasSize.width;
            if (parent && parent.current && !isOffscreen) {
                const parentBounds = parent.current.getBoundingClientRect();
                isOffscreen = bottom > parentBounds.bottom || top < parentBounds.top || right > parentBounds.right || left < parentBounds.left;
            }

            const positiveYUpBottom = canvasSize.height - bottom;
            const aspect = width / height;

            if (isOrthographicCamera(camera)) {
                if (
                    camera.left !== width / -2 ||
                    camera.right !== width / 2 ||
                    camera.top !== height / 2 ||
                    camera.bottom !== height / -2
                ) {
                    Object.assign(camera, { left: width / -2, right: width / 2, top: height / 2, bottom: height / -2 });
                    camera.updateProjectionMatrix();
                }
            } else if (camera.aspect !== aspect) {
                camera.aspect = aspect;
                camera.updateProjectionMatrix();
            }

            gl.setViewport(left, positiveYUpBottom, width, height);
            gl.setScissor(left, positiveYUpBottom, width, height);
            gl.setScissorTest(true);

            if (isOffscreen) {
                return;
            }

            // When children are present render the portalled scene, otherwise the default scene
            gl.render(children ? virtualScene : scene, camera);
        }
    }, index);

    useEffect(() => {
        // Connect the event layer to the tracking element
        const old = get().events.connected;
        setEvents({ connected: track.current });
        return () => setEvents({ connected: old });
    }, [])

    return (
        <>
            {children}
        </>
    );
}

function View({ track, parent, index = 1, frames = Infinity, children }: ViewProps) {
    const { size, scene } = useThree();

    const rect = useRef<DOMRect>(null!);

    const [virtualScene] = useState(() => new THREE.Scene());

    const compute = useCallback((event, state) => {
        if (track.current && event.target === track.current) {
            const { width, height, left, top } = rect.current;
            const x = event.clientX - left;
            const y = event.clientY - top;
            state.pointer.set((x / width) * 2 - 1, -(y / height) * 2 + 1);
            state.raycaster.setFromCamera(state.pointer, state.camera);
        }
    }, [rect]);

    const [ready, toggle] = useReducer(() => true, false);

    useEffect(() => {
        // We need the tracking elements bounds beforehand in order to inject it into the portal
        rect.current = track.current?.getBoundingClientRect()
        // And now we can proceed
        toggle()
    }, [])

    if (ready) {
        return createPortal(
            <Container canvasSize={size} frames={frames} scene={scene} track={track} parent={parent} rect={rect} index={index}>
                {children}
            </Container>
        , virtualScene, {
            events: { compute, priority: index },
            size: { width: rect.current.width, height: rect.current.height }
        });
    }
}

export default View;
