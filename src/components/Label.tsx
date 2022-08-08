import * as styles from '@/components/Label.css';

interface LabelProps {
    children: React.ReactNode;
};

export default function Label({ children }: LabelProps) {
    return (
        <p className={styles.container}>
            {children}
        </p>
    );
}
