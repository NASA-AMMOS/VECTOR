import cn from 'classnames';
import { fileSave } from 'browser-fs-access';

import { useData } from '@/stores/DataContext';

import * as styles from '@/components/EditModal.css';

interface Edit {
    id: any;
    type: string;
    operation: string;
};

interface EditModalProps {
    handeClose: (event: React.MouseEvent) => void;
};

const parser = new DOMParser();
const serializer = new XMLSerializer();

export default function EditModal({ handeClose }: EditModalProps) {
    const { tiepointsFile, editHistory, setEditHistory } = useData();

    function handleEdit(edit: Edit) {
        setEditHistory((edits) => {
            const newEdits = [...edits];
            const index = newEdits.findIndex((e) =>
                e.id === edit.id &&
                e.type === edit.type &&
                e.operation === edit.operation
            );
            newEdits.splice(index, 1);
            return newEdits;
        });
    }

    async function handleExport() {
        const trackIds = editHistory.map((e) => e.id);

        const xml = parser.parseFromString(tiepointsFile, 'application/xml');
        const tiepoints = xml.querySelectorAll('tie');

        for (const tiepoint of tiepoints) {
            const track = tiepoint.querySelector('track');
            if (track) {
                const trackId = track.getAttribute('id');
                if (trackId && trackIds.includes(Number(trackId))) {
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
        }
    }

    return (
        <>
            <div className={styles.shadow} />
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        Edit History
                    </h2>
                    <div className={styles.close} onClick={handeClose}>
                        +
                    </div>
                </div>
                {editHistory.length > 0 && (
                    <>
                        <div className={styles.list}>
                            {editHistory.map(({ id, type, operation }) => (
                                <div key={`${type}_${id}_${operation}`} className={styles.item}>
                                    <p
                                        key={`${type}_${id}_${operation}_text`}
                                        className={styles.text}
                                    >
                                        &gt; {type} {operation} {id}
                                    </p>
                                    <button
                                        key={`${type}_${id}_${operation}_button`}
                                        className={styles.button}
                                        onClick={() => handleEdit({ id, type, operation })}
                                    >
                                        Undo
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            className={cn(styles.button, styles.large)}
                            onClick={handleExport}
                        >
                            Export
                        </button>
                    </>
                )}
            </div>
        </>
    );
}
