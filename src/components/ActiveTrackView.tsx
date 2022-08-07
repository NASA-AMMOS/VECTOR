import { useReducer } from 'react';
import { Track } from '@/components/Tracks';
import CameraViewport from '@/components/CameraViewport';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import SlopeChart from '@/components/SlopeChart';
import Toolbar from '@/components/Toolbar';
import Checkbox from '@/components/Checkbox';
import { PageAction } from '@/App';
import { useData } from '@/DataContext';
import * as styles from '@/components/ActiveTrackView.css';

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

interface ActiveTrackViewProps {
    route: React.Dispatch<PageAction>;
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

export default function ActiveTrackView({ route }: ActiveTrackViewProps) {
    const { activeImage, activeTrack } = useData();

    const [state, dispatch] = useReducer(reducer, initialState);

    function handleChange(event: React.FormEvent<HTMLInputElement>) {
        dispatch({ type: event.currentTarget.value });
    }

    return (
        <>
            {activeImage && activeTrack && (
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
                    <section className={styles.grid}>
                        <div className={styles.panel}>
                            <h3 className={styles.header}>
                                Track ID: {activeTrack}
                            </h3>
                            <div className={styles.bar}>
                                <Track
                                    dispatch={route}
                                    activeImage={activeImage}
                                    activeTrack={activeTrack}
                                />
                            </div>
                            <CameraViewport />
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
                                <SlopeChart activeImage={activeImage} activeTrack={activeTrack} />
                            </div>
                        </div>
                    </section>
                </>
            )}
        </>
    );
}
