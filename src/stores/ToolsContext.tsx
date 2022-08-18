import { createContext, useContext, useReducer, useEffect } from 'react';

import { useRouter } from '@/stores/RouterContext';
import { useData } from '@/stores/DataContext';

export enum Filter {
    RESET = 'RESET',
    INITIAL_RESIDUAL = 'INITIAL_RESIDUAL',
    FINAL_RESIDUAL = 'FINAL_RESIDUAL',
    RELATIVE_AXIS = 'RELATIVE_AXIS',
    ABSOLUTE_AXIS = 'ABSOLUTE_AXIS',
    RESIDUAL_LENGTH_MIN = 'RESIDUAL_LENGTH_MIN',
    RESIDUAL_LENGTH_MAX = 'RESIDUAL_LENGTH_MAX',
    RESIDUAL_ANGLE_MIN = 'RESIDUAL_ANGLE_MIN',
    RESIDUAL_ANGLE_MAX = 'RESIDUAL_ANGLE_MAX',
    RESIDUAL_SCALE = 'RESIDUAL_SCALE',
    RESIDUAL_SORT_FIELD = 'RESIDUAL_SORT_FIELD',
    RESIDUAL_SORT_DIRECTION = 'RESIDUAL_SORT_DIRECTION',
    SCENE_CAMERA = 'SCENE_CAMERA',
    SCENE_POINT = 'SCENE_POINT',
    SCENE_MESH = 'SCENE_MESH',
};

export enum ResidualSortField {
    INITIAL = 'INITIAL',
    FINAL = 'FINAL',
};

export enum ResidualSortDirection {
    INCREASING = 'INCREASING',
    DECREASING = 'DECREASING',
};

export interface ResidualSort {
    field: string;
    direction: string;
};

interface State {
    isInitial: boolean;
    isFinal: boolean;
    isRelative: boolean;
    residualMin: number | null;
    residualMax: number | null;
    residualAngleMin: number | null;
    residualAngleMax: number | null;
    residualScale: number;
    residualSort: ResidualSort;
    isCamera: boolean;
    isPoint: boolean;
    isMesh: boolean;
};

interface Action {
    type: string;
    data: string;
};

interface Tools {
    state: State;
    handleChange: (event: React.ChangeEvent) => void;
};

interface ProvideToolsProps {
    children: React.ReactNode;
};

const initialState: State = {
    isInitial: true,
    isFinal: true,
    isRelative: true,
    residualMin: null,
    residualMax: null,
    residualAngleMin: 0,
    residualAngleMax: 360,
    residualScale: 1,
    residualSort: {
        field: ResidualSortField.FINAL,
        direction: ResidualSortDirection.DECREASING,
    },
    isCamera: true,
    isPoint: true,
    isMesh: true,
};

function reducer(state: State, action: Action) {
    switch (action.type) {
        case Filter.RESET:
            return { ...initialState };
        case Filter.INITIAL_RESIDUAL:
            return { ...state, isInitial: !state.isInitial };
        case Filter.FINAL_RESIDUAL:
            return { ...state, isFinal: !state.isFinal };
        case Filter.RELATIVE_AXIS:
            return { ...state, isRelative: true };
        case Filter.ABSOLUTE_AXIS:
            return { ...state, isRelative: false };
        case Filter.RESIDUAL_LENGTH_MIN:
            return { ...state, residualMin: Number(action.data) };
        case Filter.RESIDUAL_LENGTH_MAX:
            return { ...state, residualMax: Number(action.data) };
        case Filter.RESIDUAL_ANGLE_MIN:
            return { ...state, residualAngleMin: Number(action.data) };
        case Filter.RESIDUAL_ANGLE_MAX:
            return { ...state, residualAngleMax: Number(action.data) };
        case Filter.RESIDUAL_SCALE:
            return { ...state, residualScale: action.data ? Number(action.data) : 1 };
        case Filter.RESIDUAL_SORT_FIELD:
            return { ...state, residualSort: { ...state.residualSort, field: action.data } };
        case Filter.RESIDUAL_SORT_DIRECTION:
            return { ...state, residualSort: { ...state.residualSort, direction: action.data } };
        case Filter.SCENE_CAMERA:
            return { ...state, isCamera: !state.isCamera };
        case Filter.SCENE_POINT:
            return { ...state, isPoint: !state.isPoint };
        case Filter.SCENE_MESH:
            return { ...state, isMesh: !state.isMesh };
        default:
            return state;
    }
}

export const ToolsContext = createContext<Tools>({} as Tools);

export function useTools() {
    return useContext(ToolsContext);
}

export default function ProvideTools({ children }: ProvideToolsProps) {
    const router = useRouter();

    const { initialResidualBounds, finalResidualBounds } = useData();

    const [state, dispatch] = useReducer(reducer, initialState);

    function handleChange(event: React.ChangeEvent) {
        const target = event.currentTarget as (HTMLInputElement | HTMLSelectElement);
        dispatch({ type: target.name, data: target.value });
    }

    // Reset filters when the route changes.
    useEffect(() => {
        dispatch({ type: Filter.RESET, data: '' });
        dispatch({
            type: Filter.RESIDUAL_LENGTH_MIN,
            data: Math.min(initialResidualBounds[0][0], finalResidualBounds[0][0]).toFixed(1)
        });
        dispatch({
            type: Filter.RESIDUAL_LENGTH_MAX,
            data: Math.max(initialResidualBounds[0][1], finalResidualBounds[0][1]).toFixed(1)
        });
    }, [router.pathname]);

    // Set default values for residual length for filters.
    useEffect(() => {
        dispatch({
            type: Filter.RESIDUAL_LENGTH_MIN,
            data: Math.min(initialResidualBounds[0][0], finalResidualBounds[0][0]).toFixed(1)
        });
        dispatch({
            type: Filter.RESIDUAL_LENGTH_MAX,
            data: Math.max(initialResidualBounds[0][1], finalResidualBounds[0][1]).toFixed(1)
        });
    }, [initialResidualBounds, finalResidualBounds]);

    return (
        <ToolsContext.Provider value={{ state, handleChange }}>
            {children}
        </ToolsContext.Provider>
    );
}
