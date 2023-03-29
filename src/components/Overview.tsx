import GlobalStatistics from '@/components/GlobalStatistics';
import Global3DView from '@/components/Global3DView';
import GlobalImageView from '@/components/GlobalImageView';

import { Route, useRouter } from '@/stores/RouterContext';
import { useData } from '@/stores/DataContext';

export default function Overview() {
    const router = useRouter();

    const { activeImage } = useData();

    return (
        <>
            {!activeImage && (
                <>
                    {router.pathname === Route.STATISTICS && <GlobalStatistics />}
                    {router.pathname === Route.CAMERAS && <Global3DView />}
                    {router.pathname === Route.IMAGES && <GlobalImageView />}
                </>
            )}
        </>
    );
}
