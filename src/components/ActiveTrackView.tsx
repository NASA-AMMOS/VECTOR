import { useReducer } from 'react';

import { Track } from '@/components/Tracks';
import CameraViewport from '@/components/CameraViewport';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import SlopeChart from '@/components/SlopeChart';

import { ContextMenuState } from '@/App';
import { useData } from '@/stores/DataContext';

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
    contextMenu: ContextMenuState;
    setContextMenu: React.Dispatch<ContextMenuState>;
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

export default function ActiveTrackView({ contextMenu, setContextMenu }: ActiveTrackViewProps) {
    const { activeImage, activeTrack } = useData();

    const [state, dispatch] = useReducer(reducer, initialState);

    function handleChange(event: React.FormEvent<HTMLInputElement>) {
        dispatch({ type: event.currentTarget.name, data: event.currentTarget.value });
    }

    return (
        <>
            {activeImage && activeTrack && (
                <section className={styles.container}>
                    <div className={styles.panel}>
                        <h3 className={styles.header}>
                            Track ID: {activeTrack}
                        </h3>
                        <div className={styles.bar}>
                            <Track
                                state={state}
                                contextMenu={contextMenu}
                                setContextMenu={setContextMenu}
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
                                isEdited
                            />
                        </div>
                        <div className={styles.item}>
                            <ResidualChart
                                state={state}
                                activeImage={activeImage}
                                activeTrack={activeTrack}
                                isEdited
                            />
                        </div>
                        <div className={styles.item}>
                            <SlopeChart
                                state={state}
                                activeImage={activeImage}
                                activeTrack={activeTrack}
                                isEdited
                            />
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
