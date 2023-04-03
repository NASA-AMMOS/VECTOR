import cn from 'classnames';

import { ResidualType } from '@/stores/DataContext';
import { useFilters } from '@/stores/FiltersContext';

import { Body } from '@/styles/headers.css';
import * as styles from '@/components/Checkbox.css';

interface CheckboxProps {
    name: string;
    checked: boolean;
    children: React.ReactNode;
    type?: ResidualType;
}

export default function Checkbox({ name, checked, children, type }: CheckboxProps) {
    const { dispatchFilter } = useFilters();

    const inputStyles: { [key: string]: boolean } = {};
    if (type === ResidualType.INITIAL) {
        inputStyles[styles.initial] = true;
    } else if (type === ResidualType.FINAL) {
        inputStyles[styles.final] = true;
    }

    const onChange = () => {
        dispatchFilter({ type: name });
    };

    return (
        <div className={styles.container}>
            <input
                className={cn(styles.input, inputStyles)}
                id={name}
                type="checkbox"
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
