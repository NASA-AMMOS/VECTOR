import { useState, useReducer, useEffect } from 'react';

import Landing from '@/components/Landing';
import Overview from '@/components/Overview';
import ActiveImageView from '@/components/ActiveImageView';
import ActiveTrackView from '@/components/ActiveTrackView';
import SideBar from '@/components/SideBar';
import ContextMenu from '@/components/ContextMenu';
import EditBanner from '@/components/EditBanner';

import { Route, useRouter } from '@/stores/RouterContext';
import { useData } from '@/stores/DataContext';

import * as styles from '@/App.css';

export interface ContextMenuState {
    isEnabled: boolean;
    isTrack: boolean;
    isTiepoint: boolean;
    x: number;
    y: number;
    data: any;
}

export default function App() {
    const router = useRouter();

    const { tracks, cameras, vicar, editHistory } = useData();

    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        isEnabled: false,
        isTrack: false,
        isTiepoint: false,
        x: 0,
        y: 0,
        data: null,
    });

    function disableContextMenu() {
        setContextMenu((prevState) => ({
            ...prevState,
            isEnabled: false,
            isTrack: false,
            isTiepoint: false,
            data: null,
        }));
    }

    useEffect(() => {
        window.addEventListener('click', disableContextMenu, false);
        return () => {
            window.removeEventListener('click', disableContextMenu, false);
        };
    }, []);

    return (
        <>
            {tracks.length === 0 || Object.keys(cameras).length === 0 || Object.keys(vicar).length === 0 ? (
                <Landing />
            ) : (
                <main className={styles.container}>
                    <SideBar />
                    <Overview />
                    <ActiveImageView contextMenu={contextMenu} setContextMenu={setContextMenu} />
                    <ActiveTrackView contextMenu={contextMenu} setContextMenu={setContextMenu} />
                    {contextMenu.isEnabled && <ContextMenu state={contextMenu} />}
                    {editHistory.length > 0 && <EditBanner />}
                </main>
            )}
        </>
    );
}
