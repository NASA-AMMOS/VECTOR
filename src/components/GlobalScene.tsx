import { useReducer } from 'react';

import CameraViewport from '@/components/CameraViewport';

import { useTools } from '@/stores/ToolsContext';

import * as styles from '@/components/GlobalScene.css';

export default function GlobalScene() {
    const { state } = useTools();

    return (
        <section className={styles.container}>
            <CameraViewport />
        </section>
    );
}
