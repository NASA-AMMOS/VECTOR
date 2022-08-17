import cn from 'classnames';

import * as styles from '@/components/Checkbox.css';

interface CheckboxProps {
    name: string;
    checked: boolean;
    onChange: (event: React.ChangeEvent) => void;
    children: React.ReactNode | React.ReactNode[];
    isInverted?: boolean;
};

export default function Checkbox({ name, checked, onChange, isInverted, children }: CheckboxProps) {
    return (
        <div className={styles.container}>
            <input
                className={styles.input}
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
            <span className={cn(styles.circle, { [styles.inverted]: isInverted })} />
        </div>
    );
}
