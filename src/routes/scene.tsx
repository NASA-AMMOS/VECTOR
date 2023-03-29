import CameraViewport from '@/components/CameraViewport';

import * as styles from '@/routes/scene.css';

export default function Scene() {
    return (
        <section className={styles.container}>
            <CameraViewport />
        </section>
    );
}
