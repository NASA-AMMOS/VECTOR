import { useReducer } from 'react';
import { Track } from '@/components/Tracks';
import CameraViewport from '@/components/CameraViewport';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import SlopeChart from '@/components/SlopeChart';
import Toolbar from '@/components/Toolbar';
import Pill from '@/components/Pill';
import Label from '@/components/Label';
import Checkbox from '@/components/Checkbox';
import Radio from '@/components/Radio';
import NumberInput from '@/components/NumberInput';
import { PageAction } from '@/App';
import { useData } from '@/DataContext';
import * as styles from '@/components/ActiveTrackView.css';

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

interface ActiveTrackViewProps {
    route: React.Dispatch<PageAction>;
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

export default function ActiveTrackView({ route }: ActiveTrackViewProps) {
    const { initialResidualBounds, finalResidualBounds, activeImage, activeTrack } = useData();

    const [state, dispatch] = useReducer(reducer, initialState);

    function handleChange(event: React.FormEvent<HTMLInputElement>) {
        dispatch({ type: event.currentTarget.name, data: event.currentTarget.value });
    }

    return (
        <>
            {activeImage && activeTrack && (
                <>
                    <Toolbar>
                        <Pill>
                            <Label>
                                Axes Scale
                            </Label>
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
                            <Label>
                                Residual Type
                            </Label>
                            <Checkbox
                                name={ActionType.RESIDUAL_INITIAL}
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
                                name={ActionType.RESIDUAL_FINAL}
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
                    <section className={styles.grid}>
                        <div className={styles.panel}>
                            <h3 className={styles.header}>
                                Track ID: {activeTrack}
                            </h3>
                            <div className={styles.bar}>
                                <Track
                                    state={state}
                                    route={route}
                                    activeImage={activeImage}
                                    activeTrack={activeTrack}
                                />
                            </div>
                            <CameraViewport state={state} />
                        </div>
                        <div className={styles.column}>
                            <div className={styles.item}>
                                <RadialChart
                                    state={state}
                                    activeImage={activeImage}
                                    activeTrack={activeTrack}
                                />
                            </div>
                            <div className={styles.item}>
                                <ResidualChart
                                    state={state}
                                    activeImage={activeImage}
                                    activeTrack={activeTrack}
                                />
                            </div>
                            <div className={styles.item}>
                                <SlopeChart
                                    state={state}
                                    activeImage={activeImage}
                                    activeTrack={activeTrack}
                                />
                            </div>
                        </div>
                    </section>
                </>
            )}
        </>
    );
}
