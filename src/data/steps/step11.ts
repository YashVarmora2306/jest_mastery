import { Step } from '../types';

export const step11: Step = {
  id: '11',
  title: 'Next.js Testing Setup & Configuration - Getting Started',
  description: `## **Step 11: Next.js Testing Setup & Configuration**

#### **Topic 1: Installing Jest in Next.js Project**
**Explanation:**
Next.js requires specific Jest configuration to work with React, JSX, and Next.js-specific features.

**Installation:**
\`\`\`bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom
\`\`\`

**For Next.js 13+ with App Router:**
\`\`\`bash
npm install --save-dev @testing-library/user-event
\`\`\`

---

#### **Topic 2: Installing React Testing Library**
**Explanation:**
React Testing Library provides utilities to test React components the way users interact with them.

**Core packages:**
- \`@testing-library/react\` - React component testing utilities
- \`@testing-library/jest-dom\` - Custom Jest matchers for DOM
- \`@testing-library/user-event\` - User interaction simulation

**Why React Testing Library?**
- Tests behavior, not implementation
- Encourages accessible queries
- Works with real DOM
- Better testing practices

---

#### **Topic 3: Installing Required Dependencies**
**Explanation:**

**Complete installation:**
\`\`\`bash
npm install --save-dev \\
  jest \\
  jest-environment-jsdom \\
  @testing-library/react \\
  @testing-library/jest-dom \\
  @testing-library/user-event \\
  @babel/preset-react
\`\`\`

**What each package does:**
- \`jest\` - Testing framework
- \`jest-environment-jsdom\` - Browser-like environment
- \`@testing-library/react\` - React testing utilities
- \`@testing-library/jest-dom\` - DOM matchers (toBeInTheDocument, etc.)
- \`@testing-library/user-event\` - User interaction simulation
- \`@babel/preset-react\` - JSX transformation

---

#### **Topic 4: Configuring jest.config.js for Next.js**
**Explanation:**

**jest.config.js:**
\`\`\`javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Path to Next.js app
  dir: './',
});

const customJestConfig = {
  // Test environment
  testEnvironment: 'jest-environment-jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Coverage
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/_*.{js,jsx,ts,tsx}',
  ],
  
  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};

module.exports = createJestConfig(customJestConfig);
\`\`\`

---

#### **Topic 5: Setting Up Test Environment (jsdom)**
**Explanation:**

**jsdom** provides a browser-like environment for testing React components.

**In jest.config.js:**
\`\`\`javascript
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  // or 'jsdom' for older versions
};
\`\`\`

**Why jsdom?**
- Simulates browser APIs (document, window)
- Enables DOM manipulation
- Required for React component testing
- Lightweight alternative to real browser

---

#### **Topic 6: Configuring Module Path Aliases**
**Explanation:**

**Map import aliases from Next.js to Jest:**

\`\`\`javascript
// jest.config.js
module.exports = {
  moduleNameMapper: {
    // Match Next.js import aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
    
    // CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    
    // Images
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
};
\`\`\`

**Create __mocks__/fileMock.js:**
\`\`\`javascript
module.exports = 'test-file-stub';
\`\`\`

---

#### **Topic 7: Setting Up .babelrc or SWC**
**Explanation:**

**Next.js 12+ uses SWC by default** - no Babel config needed!

**If using Babel, create .babelrc:**
\`\`\`json
{
  "presets": ["next/babel"]
}
\`\`\`

**SWC configuration (next.config.js):**
\`\`\`javascript
module.exports = {
  experimental: {
    swcPlugins: [
      // SWC plugins if needed
    ],
  },
};
\`\`\`

---

#### **Topic 8: Creating jest.setup.js**
**Explanation:**

**jest.setup.js** runs before each test file.

**Create jest.setup.js in project root:**
\`\`\`javascript
// Extend Jest matchers
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => require('next-router-mock'));

// Mock Next.js image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} />;
  },
}));

// Global test setup
global.fetch = jest.fn();

// Suppress console errors in tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
\`\`\`

---

#### **Topic 9: Understanding Next.js Testing Environment**
**Explanation:**

**Key differences from regular React testing:**

1. **Server vs Client Components:**
   - Server Components run on server
   - Client Components run in browser
   - Tests typically focus on Client Components

2. **Next.js APIs need mocking:**
   - \`next/router\` or \`next/navigation\`
   - \`next/image\`
   - \`next/link\`
   - \`next/head\`

3. **Data Fetching:**
   - \`getServerSideProps\` - Mock in tests
   - \`getStaticProps\` - Mock in tests
   - API routes - Test separately

---

#### **Topic 10: Project Structure for Tests**
**Explanation:**

**Recommended structure:**
\`\`\`
project/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   ├── app/ (or pages/)
│   │   ├── page.tsx
│   │   └── page.test.tsx
│   └── lib/
│       ├── utils.ts
│       └── utils.test.ts
├── __tests__/
│   ├── integration/
│   └── e2e/
├── __mocks__/
│   ├── fileMock.js
│   └── styleMock.js
├── jest.config.js
├── jest.setup.js
└── package.json
\`\`\`

**Alternative: \`__tests__\` directory:**
\`\`\`
project/
├── src/
│   └── components/
│       └── Button.tsx
├── __tests__/
│   └── components/
│       └── Button.test.tsx
\`\`\`

---

#### **Topic 11: Running Tests in Next.js**
**Explanation:**

**package.json scripts:**
\`\`\`json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
\`\`\`

**Running tests:**
\`\`\`bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
\`\`\`
`,
  initialCode: `// ============================================
// STEP 11: Next.js Testing Setup
// ============================================

// Note: This simulates Next.js testing setup
// In real project, you'd have separate config files

// ================== SIMULATED SETUP ==================

// Mock next/router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
};

// Mock next/image
const MockImage = ({ src, alt, width, height, ...props }) => (
  <img src={src} alt={alt} width={width} height={height} {...props} />
);

// Mock next/link
const MockLink = ({ href, children, ...props }) => (
  <a href={href} {...props}>
    {children}
  </a>
);

// ================== SAMPLE COMPONENTS ==================

// Simple Button Component
function Button({ children, onClick, variant = 'primary', disabled = false }) {
  const className = \`btn btn-\${variant} \${disabled ? 'disabled' : ''}\`;
  
  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
    >
      {children}
    </button>
  );
}

// Card Component
function Card({ title, description, imageUrl }) {
  return (
    <div className="card" data-testid="card">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="card-image"
          data-testid="card-image"
        />
      )}
      <div className="card-content">
        <h2 className="card-title">{title}</h2>
        <p className="card-description">{description}</p>
      </div>
    </div>
  );
}

// Navigation Component (using mocked Link)
function Navigation({ links }) {
  return (
    <nav data-testid="navigation">
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <MockLink href={link.href}>{link.label}</MockLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ================== BASIC REACT TESTING LIBRARY SIMULATION ==================

// Simplified render function (in real tests, use @testing-library/react)
function render(component) {
  // This is a simplified version for demonstration
  // Real RTL render is much more sophisticated
  return {
    container: component,
    getByTestId: (id) => {
      // Simplified query
      return { textContent: 'mocked element' };
    },
    getByText: (text) => {
      return { textContent: text };
    },
    getByRole: (role) => {
      return { role };
    },
  };
}

// ================== TESTS ==================

describe('Next.js Testing Setup Examples', () => {
  
  describe('Configuration Validation', () => {
    test('Jest is properly configured', () => {
      // Verify Jest is working
      expect(true).toBe(true);
    });
    
    test('can use ES6 syntax', () => {
      const arrow = () => 'test';
      expect(arrow()).toBe('test');
    });
    
    test('can use async/await', async () => {
      const asyncFn = async () => 'async result';
      const result = await asyncFn();
      expect(result).toBe('async result');
    });
  });
  
  describe('Mock Verification', () => {
    test('Next.js router is mocked', () => {
      expect(mockRouter).toBeDefined();
      expect(mockRouter.push).toBeDefined();
      expect(mockRouter.pathname).toBe('/');
    });
    
    test('Next Image is mocked', () => {
      expect(MockImage).toBeDefined();
      expect(typeof MockImage).toBe('function');
    });
    
    test('Next Link is mocked', () => {
      expect(MockLink).toBeDefined();
      expect(typeof MockLink).toBe('function');
    });
  });
  
  describe('Component Structure Tests', () => {
    test('Button component has correct structure', () => {
      const button = Button({ children: 'Click me' });
      expect(button.type).toBe('button');
      expect(button.props.children).toBe('Click me');
    });
    
    test('Button applies variant class', () => {
      const primaryButton = Button({ children: 'Primary', variant: 'primary' });
      expect(primaryButton.props.className).toContain('btn-primary');
      
      const secondaryButton = Button({ children: 'Secondary', variant: 'secondary' });
      expect(secondaryButton.props.className).toContain('btn-secondary');
    });
    
    test('Button handles disabled state', () => {
      const button = Button({ children: 'Disabled', disabled: true });
      expect(button.props.disabled).toBe(true);
      expect(button.props.className).toContain('disabled');
    });
  });
  
  describe('Card Component Tests', () => {
    test('Card renders with required props', () => {
      const card = Card({
        title: 'Test Card',
        description: 'Test Description',
      });
      
      expect(card.type).toBe('div');
      expect(card.props.className).toBe('card');
    });
    
    test('Card renders image when imageUrl provided', () => {
      const card = Card({
        title: 'Card with Image',
        description: 'Description',
        imageUrl: '/test.jpg',
      });
      
      // Check if card has image child
      const children = Array.isArray(card.props.children) 
        ? card.props.children 
        : [card.props.children];
      
      const hasImage = children.some(
        child => child && child.type === 'img'
      );
      
      expect(hasImage).toBe(true);
    });
    
    test('Card renders without image when imageUrl not provided', () => {
      const card = Card({
        title: 'Card without Image',
        description: 'Description',
      });
      
      const children = Array.isArray(card.props.children) 
        ? card.props.children 
        : [card.props.children];
      
      const hasImage = children.some(
        child => child && child.type === 'img'
      );
      
      expect(hasImage).toBe(false);
    });
  });
  
  describe('Navigation Component Tests', () => {
    test('Navigation renders links', () => {
      const links = [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
      ];
      
      const nav = Navigation({ links });
      expect(nav.type).toBe('nav');
    });
    
    test('Navigation renders correct number of links', () => {
      const links = [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About' },
      ];
      
      const nav = Navigation({ links });
      const ul = nav.props.children;
      const items = ul.props.children;
      
      expect(items).toHaveLength(2);
    });
  });
  
  describe('Module Path Alias Simulation', () => {
    test('can import from @/ alias (simulated)', () => {
      // In real setup, this would use moduleNameMapper
      const simulatedImport = '@/components/Button';
      expect(simulatedImport).toContain('components/Button');
    });
  });
  
  describe('Environment Setup Tests', () => {
    test('jsdom environment is available', () => {
      // In the playground (browser) and jsdom, window is defined
      expect(typeof window).not.toBe('undefined');
    });
    
    test('can create mock DOM elements', () => {
      const mockElement = {
        tagName: 'div',
        className: 'test',
        textContent: 'Hello',
      };
      
      expect(mockElement.tagName).toBe('div');
      expect(mockElement.textContent).toBe('Hello');
    });
  });
});

// ================== CONFIGURATION EXAMPLES ==================

describe('Configuration Examples', () => {
  test('jest.config.js structure is valid', () => {
    const jestConfig = {
      testEnvironment: 'jest-environment-jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    };
    
    expect(jestConfig.testEnvironment).toBe('jest-environment-jsdom');
    expect(jestConfig.setupFilesAfterEnv).toContain('<rootDir>/jest.setup.js');
    // Check property existence directly to handle keys with special characters/dots
    expect(jestConfig.moduleNameMapper['^@/(.*)$']).toBeDefined();
  });
  
  test('package.json scripts are defined', () => {
    const scripts = {
      test: 'jest',
      'test:watch': 'jest --watch',
      'test:coverage': 'jest --coverage',
    };
    
    expect(scripts.test).toBe('jest');
    expect(scripts['test:watch']).toContain('--watch');
    expect(scripts['test:coverage']).toContain('--coverage');
  });
});

console.log('✅ Next.js Jest Setup Complete!');
console.log('📦 All configurations validated');
console.log('🎯 Ready to write component tests');
`
};
