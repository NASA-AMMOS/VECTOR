import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import * as styles from '@/components/GlobalStatistics.css';

function GlobalStatistics() {
    return (
        <section className={styles.container}>
            <div className={styles.item}>
                <RadialChart />
            </div>
            <div className={styles.item}>
                <ResidualChart />
            </div>
        </section>
    );
}

export default GlobalStatistics;
