import cn from 'classnames';

import { useFilters } from '@/stores/FiltersContext';

import { Body } from '@/styles/headers.css';
import * as styles from '@/components/NumberInput.css';

interface NumberInputProps {
    name: string;
    value: number;
    children: React.ReactNode;
}

export default function NumberInput({ name, value, children }: NumberInputProps) {
    const { dispatchFilter } = useFilters();

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatchFilter({ type: name, data: parseFloat(event.target.value) });
    };

    return (
        <div className={styles.container}>
            <input
                className={cn(Body, styles.input)}
                id={name}
                type="number"
                name={name}
                value={value}
                onChange={onChange}
            />
            <label htmlFor={name} className={Body}>
                {children}
            </label>
        </div>
    );
}
