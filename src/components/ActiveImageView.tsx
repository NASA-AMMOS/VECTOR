import { useReducer } from 'react';
import Tracks from '@/components/Tracks';
import TiepointImage from '@/components/TiepointImage';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import Toolbar from '@/components/Toolbar';
import Checkbox from '@/components/Checkbox';
import { PageAction } from '@/App';
import { DataContext, useData } from '@/DataContext';
import * as styles from '@/components/ActiveImageView.css';

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

interface ActiveImageViewProps {
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

export default function ActiveImageView({ route }: ActiveImageViewProps) {
    const { activeImage, activeTrack } = useData();

    const [state, dispatch] = useReducer(reducer, initialState);

    function handleChange(event: React.FormEvent<HTMLInputElement>) {
        dispatch({ type: event.currentTarget.value });
    }

    return (
        <>
            {activeImage && !activeTrack && (
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
                        <div className={styles.column}>
                            <TiepointImage />
                            <div className={styles.block}>
                                <div className={styles.item}>
                                    <RadialChart state={state} activeImage={activeImage} />
                                </div>
                                <div className={styles.item}>
                                    <ResidualChart state={state} activeImage={activeImage} />
                                </div>
                            </div>
                        </div>
                        <Tracks dispatch={route} />
                    </section>
                </>
            )}
        </>
    );
}
