import * as styles from '@/components/Checkbox.css';

interface CheckboxProps {
    name: string;
    checked: boolean;
    onChange: (event: React.FormEvent<HTMLInputElement>) => void;
    children: React.ReactNode;
};

export default function Checkbox({ name, checked, onChange, children }: CheckboxProps) {
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
        </div>
    );
}
