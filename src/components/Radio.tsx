import * as styles from '@/components/Radio.css';

interface RadioProps {
    name: string;
    checked: boolean;
    onChange: (event: React.ChangeEvent) => void;
    children: React.ReactNode | React.ReactNode[];
}

export default function Radio({ name, checked, onChange, children }: RadioProps) {
    return (
        <div className={styles.container}>
            <input
                className={styles.input}
                id={name}
                type="radio"
                name={name}
                value={name}
                checked={checked}
                onChange={onChange}
            />
            <label className={styles.label} htmlFor={name}>
                {children}
            </label>
        </div>
    );
}
