"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { steps } from '@/data/courseContent';
import { BookOpen, CheckCircle, Circle, Terminal } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>J</span>
          <span>Jest Mastery</span>
        </div>
        <div className={styles.subtitle}>Interactive Guide</div>
      </div>

      <nav className={styles.navFixed}>
        <Link 
          href="/playground"
          className={`${styles.item} ${pathname === '/playground' ? styles.active : ''}`}
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
  );
}
