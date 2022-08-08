import * as styles from '@/components/Pill.css';

interface PillProps {
    children: React.ReactNode | React.ReactNode[];
};

export default function Pill({ children }: PillProps) {
    return (
        <div className={styles.container}>
            {children}
        </div>
    );
}
