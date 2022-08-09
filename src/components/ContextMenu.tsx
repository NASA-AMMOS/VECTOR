import { useRef, useEffect } from 'react';
import { fileSave } from 'browser-fs-access';
import { ContextMenuState } from '@/App';
import { EditType, EditOperation, useData } from '@/DataContext';
import * as styles from '@/components/ContextMenu.css';

interface ContextMenuProps {
    state: ContextMenuState;
};

const parser = new DOMParser();
const serializer = new XMLSerializer();

export default function ContextMenu({ state }: ContextMenuProps) {
    const { tiepointsFile, setEditHistory } = useData();

    const container = useRef<HTMLDivElement>(null);

    async function handleTrackDelete() {
        if (tiepointsFile && state.data && typeof state.data === 'number') {
            const xml = parser.parseFromString(tiepointsFile, 'application/xml');
            const tiepoints = xml.querySelectorAll('tie');
            for (const tiepoint of tiepoints) {
                const track = tiepoint.querySelector('track');
                if (track) {
                    const trackId = track.getAttribute('id');
                    if (trackId && Number(trackId) === state.data) {
                        tiepoint.remove();
                    }
                }
            }
            const xmlString = serializer.serializeToString(xml);
            const blob = new Blob([xmlString], { type: 'application/xml' });
            try {
                await fileSave(blob, { fileName: `tiepoints_${Date.now()}.xml`, extensions: ['.xml'] });
            } catch (err) {
                console.error(err);
                return;
            }
            setEditHistory((prevState) => [...prevState, {
                id: state.data,
                type: EditType.TRACK,
                operation: EditOperation.DELETE,
            }]);
        }
    }

    useEffect(() => {
        if (state.isEnabled && container.current) {
            container.current.style.left = `${state.x}px`;
            container.current.style.top = `${state.y}px`;
        }
    }, [state]);

    return (
        <div ref={container} className={styles.container}>
            <button
                className={styles.button}
                disabled={!state.isTrack}
                onClick={handleTrackDelete}
            >
                Delete Track
            </button>
            <button
                className={styles.button}
                disabled={!state.isTiepoint}
            >
                Delete Tiepoint
            </button>
        </div>
    )
}
