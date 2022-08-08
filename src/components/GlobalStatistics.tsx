import { useReducer } from 'react';
import Toolbar from '@/components/Toolbar';
import Pill from '@/components/Pill';
import Label from '@/components/Label';
import Checkbox from '@/components/Checkbox';
import NumberInput from '@/components/NumberInput';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import { useData } from '@/DataContext';
import * as styles from '@/components/GlobalStatistics.css';

enum ActionType {
    INITIAL = 'INITIAL',
    FINAL = 'FINAL',
    RESIDUAL_LENGTH_MIN = 'RESIDUAL_LENGTH_MIN',
    RESIDUAL_LENGTH_MAX = 'RESIDUAL_LENGTH_MAX',
    RESIDUAL_ANGLE_MIN = 'RESIDUAL_ANGLE_MIN',
    RESIDUAL_ANGLE_MAX = 'RESIDUAL_ANGLE_MAX',
};

interface State {
    isInitial: boolean;
    isFinal: boolean;
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
    residualMin: 0,
    residualMax: 0,
    residualAngleMin: 0,
    residualAngleMax: 0,
};

function reducer(state: State, action: Action) {
    switch (action.type) {
        case ActionType.INITIAL:
            return { ...state, isInitial: !state.isInitial };
        case ActionType.FINAL:
            return { ...state, isFinal: !state.isFinal };
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

export default function GlobalStatistics() {
    const { initialResidualBounds, finalResidualBounds } = useData();

    const [state, dispatch] = useReducer(reducer, initialState);

    function handleChange(event: React.FormEvent<HTMLInputElement>) {
        dispatch({ type: event.currentTarget.name, data: event.currentTarget.value });
    }

    return (
        <>
            <Toolbar>
                <Pill>
                    <Label>
                        Residual Type
                    </Label>
                    <Checkbox
                        name={ActionType.INITIAL}
                        checked={state.isInitial}
                        onChange={handleChange}
                    >
                        <span>
                            Initial
                        </span>
                        <span>
                            [{initialResidualBounds[0][0]}, {initialResidualBounds[0][1]}]
                        </span>
                    </Checkbox>
                    <Checkbox
                        name={ActionType.FINAL}
                        checked={state.isFinal}
                        onChange={handleChange}
                        isInverted
                    >
                        <span>
                            Final
                        </span>
                        <span>
                            [{finalResidualBounds[0][0]}, {finalResidualBounds[0][1]}]
                        </span>
                    </Checkbox>
                </Pill>
                <Pill>
                    <Label>
                        Residual Length
                    </Label>
                    <NumberInput
                        name={ActionType.RESIDUAL_LENGTH_MIN}
                        value={state.residualMin}
                        onChange={handleChange}
                    >
                        Min
                    </NumberInput>
                    <NumberInput
                        name={ActionType.RESIDUAL_LENGTH_MAX}
                        value={state.residualMax}
                        onChange={handleChange}
                    >
                        Max
                    </NumberInput>
                </Pill>
                <Pill>
                    <Label>
                        Residual Angle
                    </Label>
                    <NumberInput
                        name={ActionType.RESIDUAL_ANGLE_MIN}
                        value={state.residualAngleMin}
                        onChange={handleChange}
                    >
                        Min
                    </NumberInput>
                    <NumberInput
                        name={ActionType.RESIDUAL_ANGLE_MAX}
                        value={state.residualAngleMax}
                        onChange={handleChange}
                    >
                        Max
                    </NumberInput>
                </Pill>
            </Toolbar>
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
        </>
    );
}
