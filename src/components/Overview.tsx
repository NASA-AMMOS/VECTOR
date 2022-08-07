import GlobalStatistics from '@/components/GlobalStatistics';
import CameraViewport from '@/components/CameraViewport';
import GlobalImageView from '@/components/GlobalImageView';
import { PageAction } from '@/App';
import { useData } from '@/DataContext';

interface OverviewProps {
    state: number;
    dispatch: React.Dispatch<PageAction>;
};

export default function Overview({ state, dispatch }: OverviewProps) {
    const { activeImage } = useData();

    return (
        <>
            {!activeImage && (
                <>
                    {state === 0 && <GlobalStatistics /> }
                    {state === 1 && <CameraViewport /> }
                    {state === 2 && <GlobalImageView route={dispatch} />}
                </>
            )}
        </>
    );
}
