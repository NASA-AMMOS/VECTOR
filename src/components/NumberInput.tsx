import * as styles from '@/components/NumberInput.css';

interface NumberInputProps {
    name: string;
    value: number | null;
    onChange: (event: React.FormEvent<HTMLInputElement>) => void;
    children: React.ReactNode;
};

export default function NumberInput({ name, value, onChange, children }: NumberInputProps) {
    return (
        <div className={styles.container}>
            <input
                className={styles.input}
                id={name}
                type="number"
                step="0.1"
                name={name}
                value={value ? value : undefined}
                onChange={onChange}
            />
            <label htmlFor={name}>
                {children}
            </label>
        </div>
    );
}
