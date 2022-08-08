import * as styles from '@/components/Toolbar.css';

interface ToolbarProps {
    children: React.ReactNode | React.ReactNode[];
};

export default function Toolbar({ children }: ToolbarProps) {
    return (
        <section className={styles.container}>
            {children}
        </section>
    )
}
