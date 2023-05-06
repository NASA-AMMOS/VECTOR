import { useNavigate } from 'react-router-dom';
import cn from 'classnames';

import { Filter, useFilters } from '@/stores/FiltersContext';

import { H2, H3 } from '@/styles/headers.css';
import * as styles from '@/components/ActiveSelection.css';

export default function ActiveSelection() {
    const navigate = useNavigate();

    const { filterState, dispatchFilter } = useFilters();

    if (!filterState.selectedCamera && !filterState.selectedTrack) {
        return null;
    }

    const handleRoute = () => {
        if (filterState.selectedCamera && filterState.selectedTrack === null) {
            navigate(`/images/${filterState.selectedCamera}`);
            dispatchFilter({ type: Filter.SELECT_CAMERA, data: null });
        } else if (filterState.selectedTrack && filterState.selectedCamera === null) {
            navigate(`/tracks/${filterState.selectedTrack}`);
            dispatchFilter({ type: Filter.SELECT_TRACK, data: null });
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={cn(H2, styles.text)}>Active Selection</h2>
            {filterState.selectedTrack && <p className={cn(H3, styles.text)}>Track ID: {filterState.selectedTrack}</p>}
            {filterState.selectedCamera && (
                <p className={cn(H3, styles.text)}>Camera ID: {filterState.selectedCamera}</p>
            )}
            <button className={cn(H3, styles.button)} onClick={handleRoute}>
                Go
            </button>
        </div>
    );
}
