import cn from 'classnames';

import { useFilters } from '@/stores/FiltersContext';

import { Body } from '@/styles/headers.css';
import * as styles from '@/components/Select.css';

interface SelectProps {
    name: string;
    label: string;
    value: string;
    children: React.ReactNode | React.ReactNode[];
}

export default function Select({ name, label, value, children }: SelectProps) {
    const { dispatchFilter } = useFilters();

    const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        dispatchFilter({ type: name, data: event.target.value });
    };

    return (
        <div className={styles.container}>
            <label className={Body} htmlFor={name}>
                {label}
            </label>
            <select className={cn(Body, styles.select)} id={name} name={name} value={value} onChange={onChange}>
                {children}
            </select>
        </div>
    );
}
