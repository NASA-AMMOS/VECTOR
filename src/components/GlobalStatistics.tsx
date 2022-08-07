import { useReducer } from 'react';
import Toolbar from '@/components/Toolbar';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import Checkbox from '@/components/Checkbox';
import * as styles from '@/components/GlobalStatistics.css';

enum ActionType {
    INITIAL = 'INITIAL',
    FINAL = 'FINAL',
};

interface State {
    initial: boolean;
    final: boolean;
};

interface Action {
    type: string;
};

const initialState: State = { initial: true, final: true };

function reducer(state: State, action: Action) {
    switch (action.type) {
        case ActionType.INITIAL:
            return { ...state, initial: !state.initial };
        case ActionType.FINAL:
            return { ...state, final: !state.final };
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
                <Checkbox
                    name={ActionType.INITIAL}
                    checked={!!(state.initial)}
                    onChange={handleChange}
                >
                    Initial
                </Checkbox>
                <Checkbox
                    name={ActionType.FINAL}
                    checked={!!(state.final)}
                    onChange={handleChange}
                >
                    Final
                </Checkbox>
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
