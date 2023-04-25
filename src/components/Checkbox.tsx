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
    className?: string;
    disabled?: boolean;
}

export default function Checkbox({ name, checked, children, type, className, disabled }: CheckboxProps) {
    const { dispatchFilter } = useFilters();

    const inputStyles: { [key: string]: boolean } = {};
    if (type === ResidualType.INITIAL) {
        inputStyles[styles.initial] = true;
    } else if (type === ResidualType.FINAL) {
        inputStyles[styles.final] = true;
    }

    if (disabled) {
        inputStyles[styles.disabled] = true;
    }

    const onChange = () => {
        dispatchFilter({ type: name });
    };

    return (
        <div className={cn(styles.container, className)}>
            <input
                className={cn(styles.input, inputStyles)}
                id={name}
                type="checkbox"
                name={name}
                value={name}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
            <label className={cn(Body, styles.label, { [styles.disabled]: disabled })} htmlFor={name}>
                {children}
            </label>
        </div>
    );
}
