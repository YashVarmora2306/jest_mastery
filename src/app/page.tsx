import Link from 'next/link';
import { ArrowRight, Terminal } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <Terminal size={40} color="white" />
      </div>
      
      <h1 className={styles.title}>
        Master Jest Testing
      </h1>
      
      <p className={styles.description}>
        A comprehensive, interactive guide to prepare you for testing in Next.js.
        Write code, run tests, and learn fundamentals in a live environment.
      </p>
      
      <Link href="/step/1" className={`btn btn-primary ${styles.cta}`}>
        Start Learning Path <ArrowRight size={20} />
      </Link>
    </div>
  );
}
