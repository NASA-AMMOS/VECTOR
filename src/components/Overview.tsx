import GlobalStatistics from '@/components/GlobalStatistics';
import GlobalImageView from '@/components/GlobalImageView';
import { useData } from '@/DataContext';

function Overview({ state, dispatch }) {
    const { activeImage } = useData();

    if (!activeImage) {
        if (state === 0) {
            return (
                <GlobalStatistics /> 
            );
        } else {
            return (
                <GlobalImageView dispatch={dispatch} />
            );
        }
    }
}

export default Overview;
