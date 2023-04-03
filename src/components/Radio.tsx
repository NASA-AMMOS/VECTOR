import cn from 'classnames';

import { useFilters } from '@/stores/FiltersContext';

import { Body } from '@/styles/headers.css';
import * as styles from '@/components/Radio.css';

interface RadioProps {
    name: string;
    checked: boolean;
    children: React.ReactNode;
}

export default function Radio({ name, checked, children }: RadioProps) {
    const { dispatchFilter } = useFilters();

    const onChange = () => {
        dispatchFilter({ type: name });
    };

    return (
        <div className={styles.container}>
            <input
                className={cn(Body, styles.input)}
                id={name}
                type="radio"
                name={name}
                value={name}
                checked={checked}
                onChange={onChange}
            />
            <label className={cn(Body, styles.label)} htmlFor={name}>
                {children}
            </label>
        </div>
    );
}
