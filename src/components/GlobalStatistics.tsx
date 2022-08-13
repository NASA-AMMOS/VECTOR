import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';

import { useTools } from '@/stores/ToolsContext';

import * as styles from '@/components/GlobalStatistics.css';

export default function GlobalStatistics() {
    const { state } = useTools();

    return (
        <section className={styles.container}>
            <div className={styles.item}>
                <h2 className={styles.title}>
                    Distribution of Residual Lengths & Angles
                </h2>
                <RadialChart state={state} />
            </div>
            <div className={styles.item}>
                <h2 className={styles.title}>
                    Distribution of Residual Lengths
                </h2>
                <ResidualChart state={state} />
            </div>
        </section>
    );
}
