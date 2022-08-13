import { useReducer } from 'react';

import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import SlopeChart from '@/components/SlopeChart';

import { Route, useRouter } from '@/stores/RouterContext';
import { useData } from '@/stores/DataContext';

import * as styles from '@/components/GlobalImageView.css';

enum ActionType {
    RESIDUAL_INITIAL = 'RESIDUAL_INITIAL',
    RESIDUAL_FINAL = 'RESIDUAL_FINAL',
    RELATIVE_AXIS = 'RELATIVE_AXIS',
    ABSOLUTE_AXIS = 'ABSOLUTE_AXIS',
    RESIDUAL_LENGTH_MIN = 'RESIDUAL_LENGTH_MIN',
    RESIDUAL_LENGTH_MAX = 'RESIDUAL_LENGTH_MAX',
    RESIDUAL_ANGLE_MIN = 'RESIDUAL_ANGLE_MIN',
    RESIDUAL_ANGLE_MAX = 'RESIDUAL_ANGLE_MAX',
};

interface State {
    isInitial: boolean;
    isFinal: boolean;
    isRelative: boolean;
    residualMin: number;
    residualMax: number;
    residualAngleMin: number;
    residualAngleMax: number;
};

interface Action {
    type: string;
    data: string;
};

const initialState: State = {
    isInitial: true,
    isFinal: true,
    isRelative: true,
    residualMin: 0,
    residualMax: 0,
    residualAngleMin: 0,
    residualAngleMax: 0,
};

function reducer(state: State, action: Action) {
    switch (action.type) {
        case ActionType.RESIDUAL_INITIAL:
            return { ...state, isInitial: !state.isInitial };
        case ActionType.RESIDUAL_FINAL:
            return { ...state, isFinal: !state.isFinal };
        case ActionType.RELATIVE_AXIS:
            return { ...state, isRelative: true };
        case ActionType.ABSOLUTE_AXIS:
            return { ...state, isRelative: false };
        case ActionType.RESIDUAL_LENGTH_MIN:
            return { ...state, residualMin: Number(action.data) };
        case ActionType.RESIDUAL_LENGTH_MAX:
            return { ...state, residualMax: Number(action.data) };
        case ActionType.RESIDUAL_ANGLE_MIN:
            return { ...state, residualAngleMin: Number(action.data) };
        case ActionType.RESIDUAL_ANGLE_MAX:
            return { ...state, residualAngleMax: Number(action.data) };
        default:
            return state;
    }
}

export default function GlobalImageView() {
    const router = useRouter();

    const { imageTiepoints, getImageURL, setActiveImage } = useData();

    const [state, dispatch] = useReducer(reducer, initialState);

    function handleChange(event: React.FormEvent<HTMLInputElement>) {
        dispatch({ type: event.currentTarget.name, data: event.currentTarget.value });
    }

    function handleClick(id: string) {
        router.push(Route.IMAGE);
        setActiveImage(id);
    }

    return (
        <section className={styles.container}>
            {Object.keys(imageTiepoints).map((id) => (
                <div key={id} className={styles.item} onClick={() => handleClick(id)}>
                    <div>
                        <h2 className={styles.header}>
                            Image ID: {id}
                        </h2>
                        <img
                            className={styles.image}
                            src={getImageURL(id)!}
                            alt={`Image with ID: ${id}`}
                        />
                    </div>
                    <RadialChart
                        state={state}
                        activeImage={id}
                    />
                    <ResidualChart
                        state={state}
                        activeImage={id}
                    />
                    <SlopeChart
                        state={state}
                        activeImage={id}
                    />
                </div>
            ))}
        </section>
    );
}
