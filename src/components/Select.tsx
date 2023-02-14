import * as styles from '@/components/Select.css';

interface SelectProps {
    name: string;
    label: string;
    value: string;
    onChange: (event: React.ChangeEvent) => void;
    children?: React.ReactNode | React.ReactNode[];
}

export default function Select({ name, label, value, onChange, children }: SelectProps) {
    return (
        <div className={styles.container}>
            <label htmlFor={name}>{label}</label>
            <select className={styles.select} id={name} name={name} value={value} onChange={onChange}>
                {children}
            </select>
        </div>
    );
}
