import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { steps } from '@/data/courseContent';
import { BookOpen, CheckCircle, Circle, Terminal } from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div 
        className={`${styles.overlay} ${isOpen ? styles.open : ''}`} 
        onClick={onClose}
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <nav className={styles.navFixed}>
          <Link 
            href="/playground"
            className={`${styles.item} ${pathname === '/playground' ? styles.active : ''}`}
            onClick={onClose}
          >
            <div className={styles.icon}>
              <Terminal size={16} />
            </div>
            <div className={styles.content}>
              <span className={styles.stepTitle}>Practice Playground</span>
            </div>
          </Link>
        </nav>

        <div className={styles.divider} style={{ margin: '0 1rem', borderTop: '1px solid var(--border-color)' }} />

        <nav className={styles.nav}>
          {steps.map((step) => {
            const isActive = pathname === `/step/${step.id}`;
            return (
              <Link 
                key={step.id} 
                href={`/step/${step.id}`}
                className={`${styles.item} ${isActive ? styles.active : ''}`}
                onClick={onClose}
              >
                <div className={styles.icon}>
                  {isActive ? <BookOpen size={16} /> : <Circle size={14} />}
                </div>
                <div className={styles.content}>
                  <span className={styles.stepNum}>Step {step.id}</span>
                  <span className={styles.stepTitle}>{step.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className={styles.footer}>
          <p>Built for Next.js Testing</p>
        </div>
      </aside>
    </>
  );
}
