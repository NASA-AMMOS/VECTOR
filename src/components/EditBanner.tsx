import { useData } from '@/stores/DataContext';

import * as styles from '@/components/EditBanner.css';

export default function EditBanner() {
    const { editHistory } = useData();

    return (
        <div className={styles.container}>
            EDITED
        </div>
    );
}
