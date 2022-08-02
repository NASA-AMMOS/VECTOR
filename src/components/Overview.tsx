import GlobalStatistics from '@/components/GlobalStatistics';
import GlobalImageView from '@/components/GlobalImageView';
import { useData } from '@/DataContext';

function Overview({ state }) {
    const { activeImage } = useData();

    if (!activeImage) {
        if (state === 0) {
            return (
                <GlobalStatistics /> 
            );
        } else {
            return (
                <GlobalImageView />
            );
        }

    }
}

export default Overview;
