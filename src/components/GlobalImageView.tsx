import { useReducer } from 'react';
import Toolbar from '@/components/Toolbar';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import SlopeChart from '@/components/SlopeChart';
import Checkbox from '@/components/Checkbox';
import { PageAction, PageType } from '@/App';
import { useData } from '@/DataContext';
import * as styles from '@/components/GlobalImageView.css';

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

interface GlobalImageViewProps {
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

export default function GlobalImageView({ route }: GlobalImageViewProps) {
    const { imageTiepoints, getImageURL, setActiveImage } = useData();

    const [state, dispatch] = useReducer(reducer, initialState);

    function handleChange(event: React.FormEvent<HTMLInputElement>) {
        dispatch({ type: event.currentTarget.value });
    }

    function handleClick(id: string) {
        route({ type: PageType.IMAGE });
        setActiveImage(id);
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
                        <RadialChart activeImage={id} state={state} />
                        <ResidualChart activeImage={id} state={state} />
                        <SlopeChart activeImage={id} />
                    </div>
                ))}
            </section>
        </>
    );
}
