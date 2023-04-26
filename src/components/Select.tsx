import cn from 'classnames';

import { useFilters } from '@/stores/FiltersContext';

import { Body } from '@/styles/headers.css';
import * as styles from '@/components/Select.css';

interface SelectProps {
    name: string;
    value: string | number;
    children: React.ReactNode | React.ReactNode[];
    label?: string;
}

export default function Select({ name, value, children, label }: SelectProps) {
    const { dispatchFilter } = useFilters();

    const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        dispatchFilter({ type: name, data: event.target.value });
    };

    return (
        <div className={styles.container}>
            {label && (
                <label className={cn(Body, styles.label)} htmlFor={name}>
                    {label}
                </label>
            )}
            <select className={cn(Body, styles.select)} id={name} name={name} value={value} onChange={onChange}>
                {children}
            </select>
        </div>
    );
}
