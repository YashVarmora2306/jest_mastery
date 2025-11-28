"use client";

import React from 'react';
import Link from 'next/link';
import { Menu, Github } from 'lucide-react';
import styles from './Navbar.module.css';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.leftSection}>
        <button 
          className={styles.menuBtn} 
          onClick={onMenuClick}
          aria-label="Toggle Menu"
        >
          <Menu size={24} />
        </button>
        
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>J</span>
          <span>Jest Mastery</span>
        </Link>
      </div>

      <div className={styles.rightSection}>
        <a 
          href="https://github.com/YashVarmora2306/jest_mastery" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}
          title="View on GitHub"
        >
          <Github size={20} />
        </a>
      </div>
    </nav>
  );
}
