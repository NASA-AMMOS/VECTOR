import { useReducer } from 'react';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import * as styles from '@/components/GlobalStatistics.css';

enum ActionType {
    INITIAL = 'INITIAL',
    FINAL = 'FINAL',
    OVERLAY = 'OVERLAY',
};

interface State {
    initial: boolean;
    final: boolean;
    overlay: boolean;
};

interface Action {
    type: ActionType;
};

const initialState: State = { initial: true, final: true, overlay: true };

function reducer(state: State, action: Action) {
    return state;
}

export default function GlobalStatistics() {
    const [state, dispatch] = useReducer(reducer, initialState);

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
