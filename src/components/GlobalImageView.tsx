import { useReducer } from 'react';
import Toolbar from '@/components/Toolbar';
import Pill from '@/components/Pill';
import Checkbox from '@/components/Checkbox';
import Radio from '@/components/Radio';
import NumberInput from '@/components/NumberInput';
import RadialChart from '@/components/RadialChart';
import ResidualChart from '@/components/ResidualChart';
import SlopeChart from '@/components/SlopeChart';
import { PageAction, PageType } from '@/App';
import { useData } from '@/DataContext';
import * as styles from '@/components/GlobalImageView.css';

enum ActionType {
    RESIDUAL_INITIAL = 'RESIDUAL_INITIAL',
    RESIDUAL_FINAL = 'RESIDUAL_FINAL',
    RELATIVE_AXIS = 'RELATIVE_AXIS',
    ABSOLUTE_AXIS = 'ABSOLUTE_AXIS',
    RESIDUAL_MIN = 'RESIDUAL_MIN',
    RESIDUAL_MAX = 'RESIDUAL_MAX',
};

interface State {
    isInitial: boolean;
    isFinal: boolean;
    isRelative: boolean;
    residualMin: number;
    residualMax: number;
};

interface Action {
    type: string;
    data: string;
};

interface GlobalImageViewProps {
    route: React.Dispatch<PageAction>;
};

const initialState: State = { isInitial: true, isFinal: true, isRelative: true, residualMin: 0, residualMax: 0 };

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
        default:
            return state;
    }
}

export default function GlobalImageView({ route }: GlobalImageViewProps) {
    const { imageTiepoints, getImageURL, setActiveImage } = useData();

    const [state, dispatch] = useReducer(reducer, initialState);

    function handleChange(event: React.FormEvent<HTMLInputElement>) {
        dispatch({ type: event.currentTarget.name, data: event.currentTarget.value });
    }

    function handleClick(id: string) {
        route({ type: PageType.IMAGE });
        setActiveImage(id);
    }

    return (
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
        </>
    );
}
