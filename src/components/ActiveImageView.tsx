import { useReducer } from 'react';
import Tracks from '@/components/Tracks';
import TiepointImage from '@/components/TiepointImage';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import Toolbar from '@/components/Toolbar';
import Pill from '@/components/Pill';
import Checkbox from '@/components/Checkbox';
import Radio from '@/components/Radio';
import NumberInput from '@/components/NumberInput';
import { PageAction } from '@/App';
import { DataContext, useData } from '@/DataContext';
import * as styles from '@/components/ActiveImageView.css';

enum ActionType {
    RESIDUAL_INITIAL = 'RESIDUAL_INITIAL',
    RESIDUAL_FINAL = 'RESIDUAL_FINAL',
    RELATIVE_AXIS = 'RELATIVE_AXIS',
    ABSOLUTE_AXIS = 'ABSOLUTE_AXIS',
    RESIDUAL_MIN = 'RESIDUAL_MIN',
    RESIDUAL_MAX = 'RESIDUAL_MAX',
    RESIDUAL_SCALE = 'RESIDUAL_SCALE',
};

interface State {
    isInitial: boolean;
    isFinal: boolean;
    isRelative: boolean;
    residualMin: number;
    residualMax: number;
    residualScale: number;
};

interface Action {
    type: string;
    data: string;
};

interface ActiveImageViewProps {
    route: React.Dispatch<PageAction>;
};

const initialState: State = { isInitial: true, isFinal: true, isRelative: true, residualMin: 0, residualMax: 0, residualScale: 1 };

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
        case ActionType.RESIDUAL_MIN:
            return { ...state, residualMin: Number(action.data) };
        case ActionType.RESIDUAL_MAX:
            return { ...state, residualMax: Number(action.data) };
        case ActionType.RESIDUAL_SCALE:
            return { ...state, residualScale: Number(action.data) === 0 ? 1 : Number(action.data) };
        default:
            return state;
    }
}

export default function ActiveImageView({ route }: ActiveImageViewProps) {
    const { activeImage, activeTrack } = useData();

    const [state, dispatch] = useReducer(reducer, initialState);

    function handleChange(event: React.FormEvent<HTMLInputElement>) {
        dispatch({ type: event.currentTarget.name, data: event.currentTarget.value });
    }

    return (
        <>
            {activeImage && !activeTrack && (
                <>
                    <Toolbar>
                        <Pill>
                            <Checkbox
                                name={ActionType.RESIDUAL_INITIAL}
                                checked={state.isInitial}
                                onChange={handleChange}
                            >
                                Initial
                            </Checkbox>
                            <Checkbox
                                name={ActionType.RESIDUAL_FINAL}
                                checked={state.isFinal}
                                onChange={handleChange}
                            >
                                Final
                            </Checkbox>
                        </Pill>
                        <Pill>
                            <Radio
                                name={ActionType.RELATIVE_AXIS}
                                checked={state.isRelative}
                                onChange={handleChange}
                            >
                                Relative
                            </Radio>
                            <Radio
                                name={ActionType.ABSOLUTE_AXIS}
                                checked={!state.isRelative}
                                onChange={handleChange}
                            >
                                Absolute
                            </Radio>
                        </Pill>
                        <Pill>
                            <NumberInput
                                name={ActionType.RESIDUAL_MIN}
                                value={state.residualMin}
                                onChange={handleChange}
                            >
                                Min
                            </NumberInput>
                            <NumberInput
                                name={ActionType.RESIDUAL_MAX}
                                value={state.residualMax}
                                onChange={handleChange}
                            >
                                Max
                            </NumberInput>
                        </Pill>
                        <Pill>
                            <NumberInput
                                name={ActionType.RESIDUAL_SCALE}
                                value={state.residualScale}
                                onChange={handleChange}
                            >
                                Scale
                            </NumberInput>
                        </Pill>
                    </Toolbar>
                    <section className={styles.grid}>
                        <div className={styles.column}>
                            <TiepointImage state={state} />
                            <div className={styles.block}>
                                <div className={styles.item}>
                                    <RadialChart
                                        state={state}
                                        activeImage={activeImage}
                                    />
                                </div>
                                <div className={styles.item}>
                                    <ResidualChart
                                        state={state}
                                        activeImage={activeImage}
                                    />
                                </div>
                            </div>
                        </div>
                        <Tracks
                            state={state}
                            route={route}
                        />
                    </section>
                </>
            )}
        </>
    );
}
