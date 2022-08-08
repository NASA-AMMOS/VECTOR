import { useReducer } from 'react';
import Toolbar from '@/components/Toolbar';
import Pill from '@/components/Pill';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import Checkbox from '@/components/Checkbox';
import * as styles from '@/components/GlobalStatistics.css';

enum ActionType {
    INITIAL = 'INITIAL',
    FINAL = 'FINAL',
};

interface State {
    isInitial: boolean;
    isFinal: boolean;
};

interface Action {
    type: string;
};

const initialState: State = { isInitial: true, isFinal: true };

function reducer(state: State, action: Action) {
    switch (action.type) {
        case ActionType.INITIAL:
            return { ...state, isInitial: !state.isInitial };
        case ActionType.FINAL:
            return { ...state, isFinal: !state.isFinal };
        default:
            return state;
    }
}

export default function GlobalStatistics() {
    const [state, dispatch] = useReducer(reducer, initialState);

    function handleChange(event: React.FormEvent<HTMLInputElement>) {
        dispatch({ type: event.currentTarget.value });
    }

    return (
        <>
            <Toolbar>
                <Pill>
                    <Checkbox
                        name={ActionType.INITIAL}
                        checked={state.isInitial}
                        onChange={handleChange}
                    >
                        Initial
                    </Checkbox>
                    <Checkbox
                        name={ActionType.FINAL}
                        checked={state.isFinal}
                        onChange={handleChange}
                    >
                        Final
                    </Checkbox>
                </Pill>
            </Toolbar>
            <section className={styles.container}>
                <div className={styles.item}>
                    <RadialChart state={state} />
                </div>
                <div className={styles.item}>
                    <ResidualChart state={state} />
                </div>
            </section>
        </>
    );
}
