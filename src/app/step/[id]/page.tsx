import React from 'react';
import { steps } from '@/data/courseContent';
import Playground from '@/components/Playground';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StepPage({ params }: PageProps) {
  const { id } = await params;
  const stepIndex = steps.findIndex(s => s.id === id);
  const step = steps[stepIndex];

  if (!step) {
    notFound();
  }

  const prevStep = steps[stepIndex - 1];
  const nextStep = steps[stepIndex + 1];

  return (
    <div className={styles.container}>
      <div className={styles.contentColumn}>
        <div className={styles.markdownWrapper}>
          <MarkdownRenderer content={step.description} />
        </div>
        
        <div className={styles.navigation}>
          {prevStep ? (
            <Link href={`/step/${prevStep.id}`} className="btn btn-secondary">
              <ChevronLeft size={16} /> Previous: {prevStep.title}
            </Link>
          ) : (
            <div /> // Spacer
          )}
          
          {nextStep ? (
            <Link href={`/step/${nextStep.id}`} className="btn btn-primary">
              Next: {nextStep.title} <ChevronRight size={16} />
            </Link>
          ) : (
            <Link href="/" className="btn btn-primary">
               Complete Course <ChevronRight size={16} />
            </Link>
          )}
        </div>
      </div>
      
      <div className={styles.playgroundColumn}>
        <Playground initialCode={step.initialCode} />
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return steps.map((step) => ({
    id: step.id,
  }));
}
