import { useReducer } from 'react';

import CameraViewport from '@/components/CameraViewport';

import * as styles from '@/components/GlobalScene.css';

enum ActionType {
    RESIDUAL_INITIAL = 'RESIDUAL_INITIAL',
    RESIDUAL_FINAL = 'RESIDUAL_FINAL',
};

interface State {
    isInitial: boolean;
    isFinal: boolean;
};

interface Action {
    type: string;
    data: string;
};

const initialState: State = { isInitial: true, isFinal: true };

function reducer(state: State, action: Action) {
    switch (action.type) {
        case ActionType.RESIDUAL_INITIAL:
            return { ...state, isInitial: !state.isInitial };
        case ActionType.RESIDUAL_FINAL:
            return { ...state, isFinal: !state.isFinal };
        default:
            return state;
    }
}

export default function GlobalScene() {
    const [state, dispatch] = useReducer(reducer, initialState);

    function handleChange(event: React.FormEvent<HTMLInputElement>) {
        dispatch({ type: event.currentTarget.name, data: event.currentTarget.value });
    }

    return (
        <section className={styles.container}>
            <CameraViewport state={state} />
        </section>
    );
}
