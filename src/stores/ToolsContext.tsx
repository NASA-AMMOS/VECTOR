import { createContext, useContext, useReducer } from 'react';

export enum Filter {
    INITIAL_RESIDUAL = 'INITIAL_RESIDUAL',
    FINAL_RESIDUAL = 'FINAL_RESIDUAL',
    RESIDUAL_LENGTH_MIN = 'RESIDUAL_LENGTH_MIN',
    RESIDUAL_LENGTH_MAX = 'RESIDUAL_LENGTH_MAX',
    RESIDUAL_ANGLE_MIN = 'RESIDUAL_ANGLE_MIN',
    RESIDUAL_ANGLE_MAX = 'RESIDUAL_ANGLE_MAX',
};

interface State {
    isInitial: boolean;
    isFinal: boolean;
    residualMin: number | null;
    residualMax: number | null;
    residualAngleMin: number | null;
    residualAngleMax: number | null;
};

interface Action {
    type: string;
    data: string;
};

interface Tools {
    state: State;
    handleChange: (event: React.FormEvent<HTMLInputElement>) => void;
};

interface ProvideToolsProps {
    children: React.ReactNode;
};

const initialState: State = {
    isInitial: true,
    isFinal: true,
    residualMin: null,
    residualMax: null,
    residualAngleMin: null,
    residualAngleMax: null,
};

function reducer(state: State, action: Action) {
    switch (action.type) {
        case Filter.INITIAL_RESIDUAL:
            return { ...state, isInitial: !state.isInitial };
        case Filter.FINAL_RESIDUAL:
            return { ...state, isFinal: !state.isFinal };
        case Filter.RESIDUAL_LENGTH_MIN:
            return { ...state, residualMin: Number(action.data) };
        case Filter.RESIDUAL_LENGTH_MAX:
            return { ...state, residualMax: Number(action.data) };
        case Filter.RESIDUAL_ANGLE_MIN:
            return { ...state, residualAngleMin: Number(action.data) };
        case Filter.RESIDUAL_ANGLE_MAX:
            return { ...state, residualAngleMax: Number(action.data) };
        default:
            return state;
    }
}

export const ToolsContext = createContext<Tools>({} as Tools);

export function useTools() {
    return useContext(ToolsContext);
}

export default function ProvideTools({ children }: ProvideToolsProps) {
    const [state, dispatch] = useReducer(reducer, initialState);

    function handleChange(event: React.FormEvent<HTMLInputElement>) {
        dispatch({ type: event.currentTarget.name, data: event.currentTarget.value });
    }

    return (
        <ToolsContext.Provider value={{ state, handleChange }}>
            {children}
        </ToolsContext.Provider>
    );
}
