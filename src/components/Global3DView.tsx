import CameraViewport from '@/components/CameraViewport';

import * as styles from '@/components/Global3DView.css';

export default function Global3DView() {
    return (
        <section className={styles.container}>
            <CameraViewport />
        </section>
    );
}
