"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme
import { runCode, SuiteResult, TestResult } from '@/utils/jestSimulator';
import { Play, CheckCircle, XCircle, Terminal, Activity, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import styles from './Playground.module.css';

interface PlaygroundProps {
  initialCode: string;
}

const calculateStats = (suites: SuiteResult[]) => {
  const countTests = (s: SuiteResult): { total: number, passed: number } => {
    let total = s.tests.length;
    let passed = s.tests.filter(t => t.status === 'pass').length;
    
    for (const child of s.suites) {
      const childStats = countTests(child);
      total += childStats.total;
      passed += childStats.passed;
    }
    return { total, passed };
  };

  return suites.reduce((acc, s) => {
    const stats = countTests(s);
    return {
      total: acc.total + stats.total,
      passed: acc.passed + stats.passed
    };
  }, { total: 0, passed: 0 });
};

export default function Playground({ initialCode }: PlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [results, setResults] = useState<{ suites: SuiteResult[], logs: string[] } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [isExpanded, setIsExpanded] = useState(false);

  // Reset code when initialCode changes (step navigation)
  useEffect(() => {
    setCode(initialCode);
    setResults(null);
    setIsExpanded(false); // Reset expansion on step change
  }, [initialCode]);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      // Small delay to show loading state
      await new Promise(r => setTimeout(r, 300));
      const res = await runCode(code);
      setResults(res);
    } finally {
      setIsRunning(false);
    }
  };

  const adjustFontSize = (delta: number) => {
    setFontSize(prev => Math.min(Math.max(prev + delta, 10), 24));
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const stats = useMemo(() => {
    if (!results) return { total: 0, passed: 0, failed: 0 };
    const { total, passed } = calculateStats(results.suites);
    return { total, passed, failed: total - passed };
  }, [results]);

  return (
    <div className={`${styles.container} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Activity size={18} />
          <span>Live Playground</span>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.zoomControls}>
            <button 
              className={styles.iconBtn} 
              onClick={() => adjustFontSize(-1)}
              title="Decrease font size"
            >
              <ZoomOut size={16} />
            </button>
            <span className={styles.fontSizeLabel}>{fontSize}px</span>
            <button 
              className={styles.iconBtn} 
              onClick={() => adjustFontSize(1)}
              title="Increase font size"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          <div className={styles.divider} />

          <button 
            className={styles.iconBtn} 
            onClick={toggleExpand}
            title={isExpanded ? "Collapse" : "Expand to fullscreen"}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button 
            className={`btn btn-primary ${styles.runBtn}`} 
            onClick={handleRun}
            disabled={isRunning}
          >
            <Play size={16} fill="currentColor" />
            {isRunning ? 'Running...' : 'Run Tests'}
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.editorContainer}>
          <Editor
            value={code}
            onValueChange={code => setCode(code)}
            highlight={code => highlight(code, languages.javascript, 'javascript')}
            padding={16}
            className={styles.editor}
            style={{
              fontFamily: '"Fira Code", "Fira Mono", monospace',
              fontSize: fontSize,
              backgroundColor: '#0d1117',
              minHeight: '100%'
            }}
          />
        </div>

        <div className={styles.outputContainer}>
          {!results ? (
            <div className={styles.placeholder}>
              <Terminal size={48} className={styles.placeholderIcon} />
              <p>Run the tests to see results</p>
            </div>
          ) : (
            <div className={styles.results}>
              <div className={styles.summary}>
                <div className={`${styles.badge} ${styles.badgeTotal}`}>
                  Total: {stats.total}
                </div>
                <div className={`${styles.badge} ${styles.badgePass}`}>
                  Passed: {stats.passed}
                </div>
                {stats.failed > 0 && (
                  <div className={`${styles.badge} ${styles.badgeFail}`}>
                    Failed: {stats.failed}
                  </div>
                )}
              </div>

              <div className={styles.logs}>
                {results.logs.length > 0 && (
                  <div className={styles.consoleSection}>
                    <h4>Console Output</h4>
                    {results.logs.map((log, i) => (
                      <div key={i} className={styles.logLine}>{log}</div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.suites}>
                {results.suites.map(suite => (
                  <SuiteView key={suite.id} suite={suite} />
                ))}
                {results.suites.length === 0 && results.logs.length === 0 && (
                   <div className={styles.emptyState}>No tests found. Define tests using describe() and test().</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TestItem({ test }: { test: TestResult }) {
  return (
    <div className={`${styles.test} ${test.status === 'pass' ? styles.pass : styles.fail}`}>
      <div className={styles.testStatus}>
        {test.status === 'pass' ? <CheckCircle size={14} /> : <XCircle size={14} />}
      </div>
      <div className={styles.testInfo}>
        <div className={styles.testName}>{test.description}</div>
        {test.error && <div className={styles.testError}>{test.error}</div>}
        {test.logs && test.logs.length > 0 && (
          <div className={styles.testLogs}>
            {test.logs.map((log, i) => (
              <div key={i} className={styles.logLine}>{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SuiteView({ suite }: { suite: SuiteResult }) {
  return (
    <div className={styles.suite}>
      <div className={styles.suiteHeader}>{suite.description}</div>
      <div className={styles.suiteContent}>
        {suite.tests.map(test => (
          <TestItem key={test.id} test={test} />
        ))}
        {suite.suites.map(s => <SuiteView key={s.id} suite={s} />)}
      </div>
    </div>
  );
}
