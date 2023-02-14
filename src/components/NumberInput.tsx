import * as styles from '@/components/NumberInput.css';

interface NumberInputProps {
    name: string;
    value: number | null;
    step?: number;
    onChange: (event: React.ChangeEvent) => void;
    children?: React.ReactNode;
}

export default function NumberInput({ name, value, step, onChange, children }: NumberInputProps) {
    return (
        <div className={styles.container}>
            <input
                className={styles.input}
                id={name}
                type="number"
                step={step ?? 1}
                name={name}
                value={value === null ? 0 : value}
                onChange={onChange}
            />
            <label htmlFor={name}>{children}</label>
        </div>
    );
}
