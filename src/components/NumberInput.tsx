import * as styles from '@/components/NumberInput.css';

interface NumberInputProps {
    name: string;
    value: number;
    onChange: (event: React.FormEvent<HTMLInputElement>) => void;
    children: React.ReactNode;
};

export default function NumberInput({ name, value, onChange, children }: NumberInputProps) {
    return (
        <div className={styles.container}>
            <label className={styles.label} htmlFor={name}>
                {children}
            </label>
            <input
                className={styles.input}
                id={name}
                type="number"
                step="0.01"
                name={name}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}
