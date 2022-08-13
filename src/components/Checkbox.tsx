import cn from 'classnames';

import * as styles from '@/components/Checkbox.css';

interface CheckboxProps {
    name: string;
    checked: boolean;
    onChange: (event: React.FormEvent<HTMLInputElement>) => void;
    children: React.ReactNode | React.ReactNode[];
    isInverted?: boolean;
};

export default function Checkbox({ name, checked, onChange, isInverted, children }: CheckboxProps) {
    return (
        <div className={styles.container}>
            <input
                className={cn(styles.input, { [styles.inverted]: isInverted })}
                id={name}
                type="checkbox"
                name={name}
                value={name}
                checked={checked}
                onChange={onChange}
            />
            <label
                className={styles.label}
                htmlFor={name}
            >
                {children}
            </label>
        </div>
    );
}
