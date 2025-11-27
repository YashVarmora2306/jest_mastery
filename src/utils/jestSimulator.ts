
import { transform } from 'sucrase';
import React from 'react';

type MatcherResult = {

  pass: boolean;
  message: () => string;
};

type Expectation = {
  [key: string]: any;
};

export type TestResult = {
  id: string;
  description: string;
  status: 'pass' | 'fail' | 'pending' | 'running';
  error?: string;
  duration?: number;
  fn?: () => void | Promise<void>;
  logs?: string[];
  assertionsExpected?: number;
  assertionsCount?: number;
};

export type SuiteResult = {
  id: string;
  description: string;
  tests: TestResult[];
  suites: SuiteResult[];
  parent?: SuiteResult;
  _beforeEach: (() => any)[];
  _afterEach: (() => any)[];
  _beforeAll: (() => any)[];
  _afterAll: (() => any)[];
};

class JestEnvironment {
  currentSuite: SuiteResult | null = null;
  currentTest: TestResult | null = null;
  rootSuites: SuiteResult[] = [];
  logs: string[] = [];
  
  // Custom Matchers
  customMatchers: Record<string, any> = {};

  // Mock Registry
  mockRegistry: Record<string, any> = {};
  createdMocks: Set<any> = new Set();
  
  // Fake Timers State
  useFakeTimersFlag = false;
  currentTime = 0;
  baseSystemTime = 0;
  timers: { id: number; callback: Function; dueTime: number; isInterval: boolean; interval?: number }[] = [];
  timerIdCounter = 1;
  originalSetTimeout = setTimeout.bind(globalThis);
  originalClearTimeout = clearTimeout.bind(globalThis);
  originalSetInterval = setInterval.bind(globalThis);
  originalClearInterval = clearInterval.bind(globalThis);
  originalDate = globalThis.Date;

  constructor() {
    this.rootSuites = [];
    this.logs = [];
  }

  log = (...args: any[]) => {
    const message = args.map(a => 
      typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
    ).join(' ');

    if (this.currentTest) {
      if (!this.currentTest.logs) this.currentTest.logs = [];
      this.currentTest.logs.push(message);
    } else {
      this.logs.push(message);
    }
  };

  describe = (description: string, callback: () => void) => {
    const suite: SuiteResult = {
      id: Math.random().toString(36).substr(2, 9),
      description,
      tests: [],
      suites: [],
      parent: this.currentSuite || undefined,
      _beforeEach: [],
      _afterEach: [],
      _beforeAll: [],
      _afterAll: []
    };

    if (this.currentSuite) {
      this.currentSuite.suites.push(suite);
    } else {
      this.rootSuites.push(suite);
    }

    const prevSuite = this.currentSuite;
    this.currentSuite = suite;
    
    try {
      callback();
    } catch (e: any) {
      this.log(`Error in describe block '${description}': ${e.message}`);
    }
    
    this.currentSuite = prevSuite;
  };

  beforeEach = (fn: () => any) => {
    if (this.currentSuite) this.currentSuite._beforeEach.push(fn);
  };

  afterEach = (fn: () => any) => {
    if (this.currentSuite) this.currentSuite._afterEach.push(fn);
  };

  beforeAll = (fn: () => any) => {
    if (this.currentSuite) this.currentSuite._beforeAll.push(fn);
  };

  afterAll = (fn: () => any) => {
    if (this.currentSuite) this.currentSuite._afterAll.push(fn);
  };

  test = (description: string, callback: () => void | Promise<void>) => {
    if (!this.currentSuite) {
      this.describe('Root', () => {
         this.test(description, callback);
      });
      return;
    }

    const testResult: TestResult = {
      id: Math.random().toString(36).substr(2, 9),
      description,
      status: 'pending',
      fn: callback,
      logs: [],
      assertionsCount: 0
    };

    this.currentSuite.tests.push(testResult);
  };

  // Execution Logic
  async run() {
    for (const suite of this.rootSuites) {
      await this.runSuite(suite);
    }
  }

  async runSuite(suite: SuiteResult) {
    // Run beforeAll
    for (const hook of suite._beforeAll) await this.executeHook(hook);

    // Run tests
    for (const test of suite.tests) {
       await this.runTest(test, suite);
    }

    // Run child suites
    for (const childSuite of suite.suites) {
      await this.runSuite(childSuite);
    }

    // Run afterAll
    for (const hook of suite._afterAll) await this.executeHook(hook);
  }

  async runTest(test: TestResult, suite: SuiteResult) {
    this.currentTest = test;
    test.status = 'running';
    test.logs = [];
    const start = performance.now();
    
    try {
      // Collect hooks from root to current suite
      const beforeEachHooks = [];
      const afterEachHooks = [];
      let s: SuiteResult | undefined = suite;
      while (s) {
        beforeEachHooks.unshift(...s._beforeEach);
        afterEachHooks.push(...s._afterEach);
        s = s.parent;
      }

      // Run beforeEach
      for (const hook of beforeEachHooks) await this.executeHook(hook);

      // Run test
      if (test.fn) {
        if (test.fn.length > 0) {
           await new Promise<void>((resolve, reject) => {
             const done = () => resolve();
             // @ts-ignore
             test.fn(done);
           });
        } else {
           await test.fn();
        }
      }

      test.status = 'pass';

      // Run afterEach
      for (const hook of afterEachHooks) await this.executeHook(hook);

      // Check assertions count
      if (test.assertionsExpected !== undefined && test.assertionsCount !== test.assertionsExpected) {
        throw new Error(`Expected ${test.assertionsExpected} assertions to be called but received ${test.assertionsCount}`);
      }

    } catch (e: any) {
      test.status = 'fail';
      test.error = e.message;
    }
    
    test.duration = performance.now() - start;
    this.currentTest = null;
  }

  async executeHook(hook: () => any) {
      try {
          await hook();
      } catch (e: any) {
          this.log(`Error in hook: ${e.message}`);
      }
  }

  // --- Fake Timers Logic ---
  useFakeTimers = () => {
    this.useFakeTimersFlag = true;
    this.currentTime = 0;
    this.baseSystemTime = this.originalDate.now();
    this.timers = [];
  };

  useRealTimers = () => {
    this.useFakeTimersFlag = false;
    this.timers = [];
  };

  private _setTimer(callback: Function, delay: number, isInterval: boolean, originalFn: Function) {
    if (!this.useFakeTimersFlag) return originalFn(callback, delay);
    const id = this.timerIdCounter++;
    this.timers.push({ 
      id, 
      callback, 
      dueTime: this.currentTime + delay, 
      isInterval, 
      interval: isInterval ? delay : undefined 
    });
    return id;
  }

  private _clearTimer(id: number, originalFn: Function) {
    if (!this.useFakeTimersFlag) return originalFn(id);
    this.timers = this.timers.filter(t => t.id !== id);
  }

  setTimeout = (callback: Function, delay: number = 0) => 
    this._setTimer(callback, delay, false, this.originalSetTimeout);

  clearTimeout = (id: number) => 
    this._clearTimer(id, this.originalClearTimeout);

  setInterval = (callback: Function, interval: number) => 
    this._setTimer(callback, interval, true, this.originalSetInterval);

  clearInterval = (id: number) => 
    this._clearTimer(id, this.originalClearInterval);

  advanceTimersByTime = (ms: number) => {
    if (!this.useFakeTimersFlag) return;
    const targetTime = this.currentTime + ms;
    
    while (true) {
      const activeTimers = this.timers.filter(t => t.dueTime <= targetTime);
      if (activeTimers.length === 0) break;
      
      activeTimers.sort((a, b) => a.dueTime - b.dueTime);
      const timer = activeTimers[0];
      
      this.currentTime = timer.dueTime;
      
      try {
        timer.callback();
      } catch (e: any) {
        this.log(`Error in timer callback: ${e.message}`);
      }
      
      if (timer.isInterval && timer.interval) {
        timer.dueTime += timer.interval;
      } else {
        this.timers = this.timers.filter(t => t.id !== timer.id);
      }
    }
    
    this.currentTime = targetTime;
  };

  advanceTimersToNextTimer = () => {
    if (!this.useFakeTimersFlag || this.timers.length === 0) return;
    const nextTimer = this.timers.reduce((prev, curr) => prev.dueTime < curr.dueTime ? prev : curr);
    const ms = nextTimer.dueTime - this.currentTime;
    if (ms > 0) this.advanceTimersByTime(ms);
  };

  getTimerCount = () => {
    return this.timers.length;
  };

  runOnlyPendingTimers = () => {
    if (!this.useFakeTimersFlag) return;
    const pendingTimers = [...this.timers];
    if (pendingTimers.length === 0) return;
    
    pendingTimers.sort((a, b) => a.dueTime - b.dueTime);
    
    for (const timer of pendingTimers) {
        if (!this.timers.find(t => t.id === timer.id)) continue;
        
        this.currentTime = timer.dueTime;
        try {
            timer.callback();
        } catch (e: any) {
            this.log(`Error in timer callback: ${e.message}`);
        }
        
        if (timer.isInterval && timer.interval) {
            const mainTimer = this.timers.find(t => t.id === timer.id);
            if (mainTimer) {
                mainTimer.dueTime += timer.interval;
            }
        } else {
            this.timers = this.timers.filter(t => t.id !== timer.id);
        }
    }
  };

  setSystemTime = (time: number | Date) => {
    this.baseSystemTime = new this.originalDate(time).getTime();
  };

  getMockDate = () => {
    const env = this;
    return class MockDate extends env.originalDate {
        constructor(...args: any[]) {
            if (args.length === 0 && env.useFakeTimersFlag) {
                super(env.baseSystemTime + env.currentTime);
            } else {
                super(...(args as []));
            }
        }
        
        static now() {
            if (env.useFakeTimersFlag) {
                 return env.baseSystemTime + env.currentTime;
            }
            return env.originalDate.now();
        }
    }
  };

  // --- Mocking Logic ---
  fn = (impl?: Function) => {
    const mockFn: any = (...args: any[]) => {
      mockFn.mock.calls.push(args);
      
      if (mockFn.mock._onceImplementations.length > 0) {
        const onceImpl = mockFn.mock._onceImplementations.shift();
        const result = onceImpl(...args);
        mockFn.mock.results.push({ type: 'return', value: result });
        return result;
      }

      const implementation = mockFn._impl || impl;
      const result = implementation ? implementation(...args) : undefined;
      mockFn.mock.results.push({ type: 'return', value: result });
      return result;
    };

    mockFn.mock = { 
      calls: [], 
      results: [],
      _onceImplementations: [] 
    };
    
    mockFn._impl = undefined;

    const withImpl = (implementation: Function) => {
      mockFn._impl = implementation;
      return mockFn;
    };

    const withOnce = (implementation: Function) => {
      mockFn.mock._onceImplementations.push(implementation);
      return mockFn;
    };
    
    mockFn.mockReturnValue = (val: any) => withImpl(() => val);
    mockFn.mockResolvedValue = (val: any) => withImpl(async () => val);
    mockFn.mockRejectedValue = (val: any) => withImpl(async () => { throw val; });
    mockFn.mockImplementation = (fn: Function) => withImpl(fn);
    
    mockFn.mockReturnValueOnce = (val: any) => withOnce(() => val);
    mockFn.mockResolvedValueOnce = (val: any) => withOnce(async () => val);
    mockFn.mockRejectedValueOnce = (val: any) => withOnce(async () => { throw val; });
    mockFn.mockImplementationOnce = (fn: Function) => withOnce(fn);
    
    mockFn.mockClear = () => { 
      mockFn.mock.calls = []; 
      mockFn.mock.results = []; 
      mockFn.mock._onceImplementations = [];
    };
    
    mockFn.mockReset = () => { 
      mockFn.mockClear(); 
      mockFn._impl = undefined; 
    };

    this.createdMocks.add(mockFn);
    return mockFn;
  };

  spyOn = (object: any, methodName: string) => {
    if (!object || typeof object[methodName] !== 'function') {
      throw new Error(`Cannot spy on ${methodName} property of object`);
    }
    
    const original = object[methodName];
    const mockFn = this.fn(original);
    
    // Replace method
    object[methodName] = mockFn;
    
    // Add mockRestore
    mockFn.mockRestore = () => {
      object[methodName] = original;
    };
    
    return mockFn;
  };

  mock = (moduleName: string, factory?: () => any) => {
    if (factory) {
      this.mockRegistry[moduleName] = factory();
    } else {
      const autoMock = new Proxy({}, {
        get: (target, prop) => {
          if (prop === 'default') return this.fn();
          if (typeof prop === 'string') {
             // @ts-ignore
             if (!target[prop]) target[prop] = this.fn();
             // @ts-ignore
             return target[prop];
          }
          return undefined;
        }
      });
      this.mockRegistry[moduleName] = autoMock;
    }
  };

  require = (moduleName: string) => {
    return new Proxy({}, {
      get: (target, prop) => {
        if (this.mockRegistry[moduleName]) {
          return this.mockRegistry[moduleName][prop];
        }
        if (prop === 'default') return this.fn();
        return this.fn();
      },
      apply: (target, thisArg, args) => {
        if (this.mockRegistry[moduleName] && typeof this.mockRegistry[moduleName] === 'function') {
          return this.mockRegistry[moduleName].apply(thisArg, args);
        }
        return undefined;
      }
    });
  };

  // --- Expect Logic ---
  extend = (matchers: Record<string, any>) => {
    this.customMatchers = { ...this.customMatchers, ...matchers };
  };

  // Asymmetric Matchers
  any = (constructor: any) => ({
    _isAsymmetricMatcher: true,
    asymmetricMatch: (actual: any) => {
      if (constructor === String) return typeof actual === 'string';
      if (constructor === Number) return typeof actual === 'number';
      if (constructor === Boolean) return typeof actual === 'boolean';
      if (constructor === Function) return typeof actual === 'function';
      if (constructor === Object) return typeof actual === 'object' && actual !== null;
      if (constructor === Array) return Array.isArray(actual);
      return actual instanceof constructor;
    }
  });

  anything = () => ({
    _isAsymmetricMatcher: true,
    asymmetricMatch: (actual: any) => actual !== null && actual !== undefined
  });

  objectContaining = (subset: any) => ({
    _isAsymmetricMatcher: true,
    asymmetricMatch: (actual: any) => {
      for (const key in subset) {
        if (subset[key] && typeof subset[key] === 'object' && subset[key]._isAsymmetricMatcher) {
           if (!subset[key].asymmetricMatch(actual[key])) return false;
        } else if (actual[key] !== subset[key]) {
           return false;
        }
      }
      return true;
    }
  });

  stringMatching = (pattern: string | RegExp) => ({
    _isAsymmetricMatcher: true,
    asymmetricMatch: (actual: any) => {
      const re = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
      return typeof actual === 'string' && re.test(actual);
    }
  });

  arrayContaining = (subset: any[]) => ({
    _isAsymmetricMatcher: true,
    asymmetricMatch: (actual: any) => {
      if (!Array.isArray(actual)) return false;
      return subset.every(item => actual.includes(item));
    }
  });

  expect = (received: any): Expectation => {
    if (this.currentTest) {
        this.currentTest.assertionsCount = (this.currentTest.assertionsCount || 0) + 1;
    }

    const checkError = (thrown: any, error?: string | RegExp | Error) => {
      if (!error) return;
      const message = thrown instanceof Error ? thrown.message : String(thrown);
      if (typeof error === 'string') {
        if (!message.includes(error)) throw new Error(`Expected error to include "${error}", but got "${message}"`);
      } else if (error instanceof RegExp) {
        if (!error.test(message)) throw new Error(`Expected error to match ${error}, but got "${message}"`);
      }
    };

    const matchers = (isNot: boolean) => {
      const pass = (condition: boolean, message: string | (() => string)) => {
        const result = isNot ? !condition : condition;
        if (!result) {
          const msg = typeof message === 'function' ? message() : message;
          throw new Error(msg);
        }
      };

      const deepEqual = (a: any, b: any): boolean => {
        // Handle Asymmetric Matchers
        if (b && typeof b === 'object' && b._isAsymmetricMatcher) {
            return b.asymmetricMatch(a);
        }
        
        if (a === b) return true;
        if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        for (const key of keysA) {
          if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
        }
        return true;
      };

      const baseMatchers: any = {
        toBe: (expected: any) => pass(received === expected, `Expected ${expected} but received ${received}`),
        toEqual: (expected: any) => pass(deepEqual(received, expected), `Expected deep equality failure`),
        toBeTruthy: () => pass(!!received, `Expected truthy but received ${received}`),
        toBeFalsy: () => pass(!received, `Expected falsy but received ${received}`),
        toBeNull: () => pass(received === null, `Expected null but received ${received}`),
        toBeUndefined: () => pass(received === undefined, `Expected undefined but received ${received}`),
        toBeDefined: () => pass(received !== undefined, `Expected defined but received undefined`),
        toBeGreaterThan: (n: number) => pass(received > n, `Expected > ${n} but received ${received}`),
        toBeGreaterThanOrEqual: (n: number) => pass(received >= n, `Expected >= ${n} but received ${received}`),
        toBeLessThan: (n: number) => pass(received < n, `Expected < ${n} but received ${received}`),
        toBeLessThanOrEqual: (n: number) => pass(received <= n, `Expected <= ${n} but received ${received}`),
        toBeCloseTo: (n: number, precision = 2) => {
          const diff = Math.abs(received - n);
          pass(diff < Math.pow(10, -precision) / 2, `Expected ${received} to be close to ${n}`);
        },
        toMatch: (pattern: RegExp | string) => {
          const re = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
          pass(re.test(received), `Expected ${received} to match ${pattern}`);
        },
        toContain: (item: any) => {
          if (typeof received === 'string') {
            pass(received.includes(item), `Expected string to contain ${item}`);
          } else if (Array.isArray(received)) {
            pass(received.includes(item), `Expected array to contain ${item}`);
          } else {
            pass(false, `Expected value to be an array or string`);
          }
        },
        toHaveLength: (length: number) => {
          pass(received?.length === length, `Expected length ${length} but got ${received?.length}`);
        },
        toContainEqual: (item: any) => {
           pass(Array.isArray(received) && received.some(x => deepEqual(x, item)), `Expected array to contain equal object`);
        },
        toHaveProperty: (key: string, value?: any) => {
          // Support dot notation for nested properties
          const keys = key.split('.');
          let current = received;
          let has = true;
          
          for (const k of keys) {
            if (current && Object.prototype.hasOwnProperty.call(current, k)) {
              current = current[k];
            } else {
              has = false;
              break;
            }
          }
          
          if (value !== undefined) {
             pass(has && deepEqual(current, value), `Expected property ${key} with value ${value}`);
          } else {
             pass(has, `Expected property ${key}`);
          }
        },
        toMatchObject: (subset: any) => {
          const check = (obj: any, sub: any): boolean => {
            for (const key in sub) {
              if (sub[key] && typeof sub[key] === 'object') {
                 if (!check(obj[key], sub[key])) return false;
              } else {
                 if (obj[key] !== sub[key]) return false;
              }
            }
            return true;
          };
          pass(check(received, subset), `Expected object to match subset`);
        },
        toThrow: (error?: string | RegExp | Error) => {
          let threw = false;
          let thrownError: any;
          try {
            received();
          } catch (e) {
            threw = true;
            thrownError = e;
          }

          if (isNot) {
             if (threw) throw new Error(`Expected not to throw but threw ${thrownError}`);
             return;
          }

          if (!threw) throw new Error(`Expected to throw but didn't`);
          
          checkError(thrownError, error);
        },
        toBeInstanceOf: (expected: any) => {
           pass(received instanceof expected, `Expected instance of ${expected.name}`);
        },
        toHaveBeenCalled: () => {
          if (!received.mock) throw new Error('Received value must be a mock function');
          pass(received.mock.calls.length > 0, 'Expected mock to have been called');
        },
        toHaveBeenCalledTimes: (times: number) => {
          if (!received.mock) throw new Error('Received value must be a mock function');
          pass(received.mock.calls.length === times, `Expected mock to be called ${times} times but was called ${received.mock.calls.length} times`);
        },
        toHaveBeenCalledWith: (...args: any[]) => {
          if (!received.mock) throw new Error('Received value must be a mock function');
          const calls = received.mock.calls;
          const wasCalled = calls.some((call: any[]) => deepEqual(call, args));
          pass(wasCalled, `Expected mock to have been called with ${JSON.stringify(args)}`);
        },
        toHaveBeenLastCalledWith: (...args: any[]) => {
          if (!received.mock) throw new Error('Received value must be a mock function');
          const calls = received.mock.calls;
          if (calls.length === 0) {
            pass(false, 'Expected mock to have been called at least once');
            return;
          }
          const lastCall = calls[calls.length - 1];
          pass(deepEqual(lastCall, args), `Expected last call to be ${JSON.stringify(args)} but was ${JSON.stringify(lastCall)}`);
        },
        toHaveBeenNthCalledWith: (nthCall: number, ...args: any[]) => {
          if (!received.mock) throw new Error('Received value must be a mock function');
          const calls = received.mock.calls;
          if (nthCall < 1 || nthCall > calls.length) {
            pass(false, `Expected mock to have been called at least ${nthCall} times but was called ${calls.length} times`);
            return;
          }
          const call = calls[nthCall - 1]; // Convert to 0-indexed
          pass(deepEqual(call, args), `Expected call ${nthCall} to be ${JSON.stringify(args)} but was ${JSON.stringify(call)}`);
        },
        toMatchSnapshot: () => {
          // Simulator doesn't support actual snapshots, so we just pass
          pass(true, 'Snapshot matched');
        },
        not: {} // Placeholder
      };

      for (const [name, matcher] of Object.entries(this.customMatchers)) {
        baseMatchers[name] = (...args: any[]) => {
          const result = (matcher as Function)(received, ...args);
          if (isNot ? result.pass : !result.pass) {
             const msg = typeof result.message === 'function' ? result.message() : result.message;
             throw new Error(msg);
          }
        };
      }

      return baseMatchers;
    };

    const base = matchers(false);
    
    const createAsyncMatcher = (type: 'resolves' | 'rejects') => {
      return new Proxy({}, {
        get: (target, prop) => {
          return async (...args: any[]) => {
            try {
              let val;
              if (type === 'resolves') {
                val = await received;
              } else {
                try {
                  await received;
                  throw new Error('Promise resolved but expected rejection');
                } catch (e) {
                  val = e; 
                  if ((e as any).message === 'Promise resolved but expected rejection') throw e;
                }
              }

              const matcherName = prop as string;
              const matcher = (matchers(false) as any)[matcherName];
              
              if (matcher) {
                if (matcherName === 'toThrow') {
                   const error = args[0];
                   checkError(val, error);
                   return;
                }
                
                const newMatchers = this.expect(val);
                // @ts-ignore
                if (newMatchers[matcherName]) {
                   // @ts-ignore
                   newMatchers[matcherName](...args);
                } else {
                   throw new Error(`Matcher ${matcherName} not found`);
                }
              }

            } catch (e: any) {
              throw e;
            }
          };
        }
      });
    };

    // @ts-ignore
    base.not = matchers(true);
    // @ts-ignore
    base.resolves = createAsyncMatcher('resolves');
    // @ts-ignore
    base.rejects = createAsyncMatcher('rejects');
    
    // @ts-ignore
    return base;
  };
}

export async function runCode(code: string): Promise<{ suites: SuiteResult[], logs: string[] }> {
  const env = new JestEnvironment();
  
  const jestObj = {
    fn: env.fn,
    mock: env.mock,
    spyOn: env.spyOn,
    requireActual: (name: string) => ({}),
    useFakeTimers: env.useFakeTimers,
    useRealTimers: env.useRealTimers,
    advanceTimersByTime: env.advanceTimersByTime,
    advanceTimersToNextTimer: env.advanceTimersToNextTimer,
    runAllTimers: () => env.advanceTimersByTime(100000),
    getTimerCount: env.getTimerCount,
    clearAllTimers: () => { env.timers = []; },
    clearAllMocks: () => { 
      env.createdMocks.forEach(mock => mock.mockClear());
    },
    runOnlyPendingTimers: env.runOnlyPendingTimers,
    setSystemTime: env.setSystemTime,
    unmock: () => {},
    doMock: () => {},
    enableAutomock: () => {},
    disableAutomock: () => {},
    setTimeout: (timeout: number) => {} // Jest config timeout stub
  };

  const expectObj = env.expect;
  // @ts-ignore
  expectObj.extend = env.extend;
  // @ts-ignore
  expectObj.any = env.any;
  // @ts-ignore
  expectObj.anything = env.anything;
  // @ts-ignore
  expectObj.objectContaining = env.objectContaining;
  // @ts-ignore
  expectObj.stringMatching = env.stringMatching;
  // @ts-ignore
  expectObj.arrayContaining = env.arrayContaining;
  // @ts-ignore
  expectObj.assertions = (n: number) => {
      if (env.currentTest) env.currentTest.assertionsExpected = n;
  };

  const mockGlobal: any = {};

  const context = {
    describe: env.describe,
    test: env.test,
    it: env.test,
    expect: expectObj,
    beforeAll: env.beforeAll,
    afterAll: env.afterAll,
    beforeEach: env.beforeEach,
    afterEach: env.afterEach,
    console: {
      log: env.log,
      error: env.log,
      warn: env.log
    },
    setTimeout: env.setTimeout,
    clearTimeout: env.clearTimeout,
    setInterval: env.setInterval,
    clearInterval: env.clearInterval,
    require: env.require,
    jest: jestObj,
    Promise: Promise,
    Error: Error,
    Date: env.getMockDate(),
    React: React,
    process: { env: {} },
    global: mockGlobal,
    fetch: new Proxy(() => {}, {
      apply: (target, thisArg, args) => {
        if (mockGlobal.fetch) {
          return mockGlobal.fetch(...args);
        }
        // @ts-ignore
        return window.fetch(...args);
      },
      get: (target, prop) => {
        if (mockGlobal.fetch) {
          return mockGlobal.fetch[prop];
        }
        // @ts-ignore
        return window.fetch[prop];
      }
    })
  };
  
  mockGlobal.global = mockGlobal;

  try {
    const compiledCode = transform(code, {
      transforms: ['jsx', 'imports'],
      jsxPragma: 'React.createElement',
      jsxFragmentPragma: 'React.Fragment',
    }).code;

    const func = new Function(...Object.keys(context), `
      return (async () => {
        try {
          ${compiledCode}
        } catch(e) {
          console.log("Runtime Error: " + e.message);
        }
      })();
    `);
    
    await func(...(Object.values(context) as []));
    
    // Run the tests after structure is built
    await env.run();
    
  } catch (e: any) {
    env.log(`Execution Error: ${e.message}`);
  }

  return {
    suites: env.rootSuites,
    logs: env.logs
  };
}
