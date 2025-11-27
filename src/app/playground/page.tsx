import React from 'react';
import Playground from '@/components/Playground';
import styles from './page.module.css';

const EMPTY_PLAYGROUND_CODE = `// Write your tests here
// You can use describe(), test(), expect(), and jest mocks

describe('My Practice Suite', () => {
  test('should pass a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  test('should demonstrate mocking', () => {
    const mockFn = jest.fn();
    mockFn('hello');
    expect(mockFn).toHaveBeenCalledWith('hello');
  });
});
`;

export default function PlaygroundPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Practice Playground</h1>
        <p className={styles.subtitle}>Experiment with Jest matchers, mocks, and more in this sandboxed environment.</p>
      </div>
      <div className={styles.playgroundWrapper}>
        <Playground initialCode={EMPTY_PLAYGROUND_CODE} />
      </div>
    </div>
  );
}
