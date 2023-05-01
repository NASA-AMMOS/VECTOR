import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

import { Point, useData } from '@/stores/DataContext';

export enum Filter {
    RESET = 'RESET',

    VIEW_INITIAL_RESIDUALS = 'VIEW_INITIAL_RESIDUALS',
    VIEW_FINAL_RESIDUALS = 'FINAL_RESIDUAL',

    USE_RELATIVE_AXES = 'USE_RELATIVE_AXES',
    USE_ABSOLUTE_AXES = 'USE_ABSOLUTE_AXES',

    MIN_RESIDUAL_LENGTH = 'MIN_RESIDUAL_LENGTH',
    MAX_RESIDUAL_LENGTH = 'MAX_RESIDUAL_LENGTH',

    MIN_RESIDUAL_ANGLE = 'MIN_RESIDUAL_ANGLE',
    MAX_RESIDUAL_ANGLE = 'MAX_RESIDUAL_ANGLE',

    RESIDUAL_SORT_FIELD = 'RESIDUAL_SORT_FIELD',
    RESIDUAL_SORT_DIRECTION = 'RESIDUAL_SORT_DIRECTION',

    RESIDUAL_PRECISION = 'RESIDUAL_PRECISION',

    VIEW_CAMERAS = 'VIEW_CAMERAS',
    VIEW_POINTS = 'VIEW_POINTS',

    SCENE_GRID_AXES = 'SCENE_GRID_AXES',
}

export enum AxesType {
    RELATIVE,
    ABSOLUTE,
}

export enum ResidualSortField {
    INITIAL = 'INITIAL',
    FINAL = 'FINAL',
    ACQUISITION_ORDER = 'ACQUISITION_ORDER',
}

export enum ResidualSortDirection {
    INCREASING = 'INCREASING',
    DECREASING = 'DECREASING',
}

export enum ResidualPrecision {
    ONES = 1,
    TENTHS = 10,
    HUNDREDTHS = 100,
    THOUSANDTHS = 1000,
}

export enum SceneGridAxes {
    XZ = 'XZ',
    XY = 'XY',
    YZ = 'YZ',
}

interface FilterState {
    viewInitialResiduals: boolean;
    viewFinalResiduals: boolean;

    axesType: AxesType;

    minResidualLength: number;
    maxResidualLength: number;

    minResidualAngle: number;
    maxResidualAngle: number;

    residualSortField: ResidualSortField;
    residualSortDirection: ResidualSortDirection;

    residualPrecision: ResidualPrecision;

    viewCameras: boolean;
    viewPoints: boolean;

    sceneGridAxes: SceneGridAxes;
}

interface FilterAction {
    type: string;
    data?: number | string;
}

interface Filters {
    filterState: FilterState;
    dispatchFilter: React.Dispatch<FilterAction>;
    guardInitialPoint: (point: Point) => boolean;
    guardFinalPoint: (point: Point) => boolean;
    guardPoint: (point: Point) => boolean;
    roundToPrecision: (v: number) => number;
}

const initialState: FilterState = {
    viewInitialResiduals: true,
    viewFinalResiduals: true,

    axesType: AxesType.RELATIVE,

    minResidualLength: 0,
    maxResidualLength: 1,

    minResidualAngle: 0,
    maxResidualAngle: 360,

    residualSortField: ResidualSortField.FINAL,
    residualSortDirection: ResidualSortDirection.DECREASING,

    residualPrecision: ResidualPrecision.TENTHS,

    viewCameras: true,
    viewPoints: true,

    sceneGridAxes: SceneGridAxes.XZ,
};

function reducer(state: FilterState, action: FilterAction): FilterState {
    switch (action.type) {
        case Filter.RESET:
            return { ...initialState };

        case Filter.VIEW_INITIAL_RESIDUALS:
            return { ...state, viewInitialResiduals: !state.viewInitialResiduals };
        case Filter.VIEW_FINAL_RESIDUALS:
            return { ...state, viewFinalResiduals: !state.viewFinalResiduals };

        case Filter.USE_RELATIVE_AXES:
            return { ...state, axesType: AxesType.RELATIVE };

        case Filter.USE_ABSOLUTE_AXES:
            return { ...state, axesType: AxesType.ABSOLUTE };

        case Filter.MIN_RESIDUAL_LENGTH:
            if (typeof action.data === 'number') {
                return { ...state, minResidualLength: action.data };
            }
        case Filter.MAX_RESIDUAL_LENGTH:
            if (typeof action.data === 'number') {
                return { ...state, maxResidualLength: action.data };
            }

        case Filter.MIN_RESIDUAL_ANGLE:
            if (typeof action.data === 'number') {
                return { ...state, minResidualAngle: action.data };
            }
        case Filter.MAX_RESIDUAL_ANGLE:
            if (typeof action.data === 'number') {
                return { ...state, maxResidualAngle: action.data };
            }

        case Filter.RESIDUAL_SORT_FIELD:
            if (typeof action.data === 'string') {
                return { ...state, residualSortField: action.data as ResidualSortField };
            }
        case Filter.RESIDUAL_SORT_DIRECTION:
            if (typeof action.data === 'string') {
                return { ...state, residualSortDirection: action.data as ResidualSortDirection };
            }

        case Filter.RESIDUAL_PRECISION:
            if (typeof action.data === 'string') {
                return { ...state, residualPrecision: Number(action.data) as ResidualPrecision };
            }

        case Filter.VIEW_CAMERAS:
            return { ...state, viewCameras: !state.viewCameras };
        case Filter.VIEW_POINTS:
            return { ...state, viewPoints: !state.viewPoints };

        case Filter.SCENE_GRID_AXES:
            if (typeof action.data === 'string') {
                return { ...state, sceneGridAxes: action.data as SceneGridAxes };
            }

        default:
            return state;
    }
}

export const FiltersContext = createContext<Filters>({} as Filters);

export function useFilters() {
    return useContext(FiltersContext);
}

export default function ProvideFilters({ children }: { children: React.ReactNode }) {
    const { minResidualLength, maxResidualLength } = useData();

    const [filterState, dispatchFilter] = useReducer(reducer, initialState);

    const guardInitialPoint = useCallback(
        (point: Point) =>
            filterState.viewInitialResiduals &&
            filterState.minResidualLength <= point.initialResidualLength &&
            filterState.maxResidualLength >= point.initialResidualLength &&
            filterState.minResidualAngle <= point.initialResidualAngle &&
            filterState.maxResidualAngle >= point.initialResidualAngle,
        [filterState],
    );

    const guardFinalPoint = useCallback(
        (point: Point) =>
            filterState.viewFinalResiduals &&
            filterState.minResidualLength <= point.finalResidualLength &&
            filterState.maxResidualLength >= point.finalResidualLength &&
            filterState.minResidualAngle <= point.finalResidualAngle &&
            filterState.maxResidualAngle >= point.finalResidualAngle,
        [filterState],
    );

    const guardPoint = useCallback(
        (point: Point) =>
            filterState.minResidualLength <= point.initialResidualLength &&
            filterState.maxResidualLength >= point.initialResidualLength &&
            filterState.minResidualAngle <= point.initialResidualAngle &&
            filterState.maxResidualAngle >= point.initialResidualAngle &&
            filterState.minResidualLength <= point.finalResidualLength &&
            filterState.maxResidualLength >= point.finalResidualLength &&
            filterState.minResidualAngle <= point.finalResidualAngle &&
            filterState.maxResidualAngle >= point.finalResidualAngle,
        [filterState],
    );

    const roundToPrecision = useCallback(
        (v: number) => Math.round((v + Number.EPSILON) * filterState.residualPrecision) / filterState.residualPrecision,
        [filterState],
    );

    useEffect(() => {
        dispatchFilter({
            type: Filter.MIN_RESIDUAL_LENGTH,
            data: Math.round(minResidualLength),
        });
        dispatchFilter({
            type: Filter.MAX_RESIDUAL_LENGTH,
            data: Math.round(maxResidualLength),
        });
    }, [minResidualLength, maxResidualLength]);

    return (
        <FiltersContext.Provider
            value={{ filterState, dispatchFilter, guardInitialPoint, guardFinalPoint, guardPoint, roundToPrecision }}
        >
            {children}
        </FiltersContext.Provider>
    );
}
