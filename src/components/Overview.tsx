import GlobalStatistics from '@/components/GlobalStatistics';
import CameraViewport from '@/components/CameraViewport';
import GlobalImageView from '@/components/GlobalImageView';
import { useData } from '@/DataContext';

function Overview({ state, dispatch }) {
    const { activeImage } = useData();

    if (!activeImage) {
        if (state === 0) {
            return (
                <GlobalStatistics /> 
            );
        } else if (state === 1) {
            return (
                <CameraViewport />
            );
        } else if (state === 2) {
            return (
                <GlobalImageView dispatch={dispatch} />
            );
        }
    }
}

export default Overview;
