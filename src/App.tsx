import Landing from '@/components/Landing';
import Overview from '@/components/Overview';
import ActiveImageView from '@/components/ActiveImageView';
import ActiveTrackView from '@/components/ActiveTrackView';
import SideBar from '@/components/SideBar';

import { useData } from '@/stores/DataContext';

import * as styles from '@/App.css';

export default function App() {
    const { tracks, cameras, vicar } = useData();

    return (
        <>
            {tracks.length === 0 || Object.keys(cameras).length === 0 || Object.keys(vicar).length === 0 ? (
                <Landing />
            ) : (
                <main className={styles.container}>
                    <SideBar />
                    <Overview />
                    <ActiveImageView />
                    <ActiveTrackView />
                </main>
            )}
        </>
    );
}
