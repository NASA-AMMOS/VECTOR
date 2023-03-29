import cn from 'classnames';

import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';

import { useTools } from '@/stores/ToolsContext';

import * as styles from '@/routes/overview.css';

export default function Overview() {
    const { state } = useTools();

    return (
        <section className={styles.container}>
            <div className={styles.item}>
                <h2 className={styles.title}>Distribution of Residual Lengths & Angles</h2>
                <RadialChart state={state} />
                <div className={styles.legend}>
                    <img className={styles.axis} src="/src/assets/radial.svg" alt="Radial Chart Legend w/ Degrees" />
                    <div className={styles.colors}>
                        <div className={styles.color}>
                            <span className={styles.circle} /> Initial
                        </div>
                        <div className={styles.color}>
                            <span className={cn(styles.circle, styles.inverted)} /> Final
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.item}>
                <h2 className={styles.title}>Distribution of Residual Lengths</h2>
                <ResidualChart state={state} />
                <div className={styles.legend}>
                    {/* Empty div for styling . */}
                    <div />
                    <div className={styles.colors}>
                        <div className={styles.color}>
                            <span className={styles.circle} /> Initial
                        </div>
                        <div className={styles.color}>
                            <span className={cn(styles.circle, styles.inverted)} /> Final
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
