import GlobalStatistics from '@/components/GlobalStatistics';
import GlobalScene from '@/components/GlobalScene';
import GlobalImageView from '@/components/GlobalImageView';
import { PageAction } from '@/App';
import { useData } from '@/DataContext';

interface OverviewProps {
    activeRoute: number;
    route: React.Dispatch<PageAction>;
};

export default function Overview({ activeRoute, route }: OverviewProps) {
    const { activeImage } = useData();

    return (
        <>
            {!activeImage && (
                <>
                    {activeRoute === 0 && <GlobalStatistics /> }
                    {activeRoute === 1 && <GlobalScene /> }
                    {activeRoute === 2 && <GlobalImageView route={route} />}
                </>
            )}
        </>
    );
}
