import { Step } from '../types';

export const step19: Step = {
  id: '19',
  title: 'Testing Next.js Middleware & Advanced Concepts',
  description: `## **Step 19: Testing Next.js Middleware & Advanced Concepts**

#### **Topic 1: Testing Middleware**
**Explanation:**

Middleware runs before requests complete. Test by mocking \`NextRequest\`.

\`\`\`javascript
import { middleware } from './middleware';
import { NextRequest, NextResponse } from 'next/server';

test('redirects to login if no token', () => {
  const req = new NextRequest('http://localhost/dashboard');
  const res = middleware(req);
  
  expect(res.status).toBe(307);
  expect(res.headers.get('Location')).toBe('http://localhost/login');
});
\`\`\`

---

#### **Topic 2: Testing Internationalization (i18n)**
**Explanation:**

Test routing based on locales.

\`\`\`javascript
test('uses correct locale', () => {
  mockRouter.locale = 'fr';
  render(<Greeting />);
  expect(screen.getByText('Bonjour')).toBeInTheDocument();
});
\`\`\`

---

#### **Topic 3: Testing Web Vitals**
**Explanation:**

Mock \`useReportWebVitals\`.

\`\`\`javascript
test('reports metrics', () => {
  const onPerfEntry = jest.fn();
  render(<App onPerfEntry={onPerfEntry} />);
  
  // Simulate metric
  onPerfEntry({ name: 'FCP', value: 100 });
  
  expect(onPerfEntry).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'FCP' })
  );
});
\`\`\`

---

#### **Topic 4: Accessibility Testing (jest-axe)**
**Explanation:**

Automated a11y checks.

\`\`\`javascript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('should have no accessibility violations', async () => {
  const { container } = render(<App />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
\`\`\`

---

#### **Topic 5: Testing Custom Document/App**
**Explanation:**

Verify global layouts or scripts.

\`\`\`javascript
test('renders custom document structure', () => {
  const { container } = render(<MyDocument />);
  expect(container.querySelector('html')).toHaveAttribute('lang', 'en');
});
\`\`\`

---

#### **Topic 6: Testing Image Optimization**
**Explanation:**

Verify \`next/image\` props.

\`\`\`javascript
test('renders optimized image', () => {
  render(<Image src="/img.jpg" width={100} height={100} />);
  const img = screen.getByRole('img');
  expect(img).toHaveAttribute('src');
  expect(img).toHaveAttribute('width', '100');
});
\`\`\`

---

#### **Topic 7: Testing Environment Variables**
**Explanation:**

Mock \`process.env\`.

\`\`\`javascript
const OLD_ENV = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...OLD_ENV };
});

afterAll(() => {
  process.env = OLD_ENV;
});

test('uses API key from env', () => {
  process.env.NEXT_PUBLIC_API_KEY = 'test-key';
  expect(getApiKey()).toBe('test-key');
});
\`\`\`

---

#### **Topic 8: Testing Error Boundaries**
**Explanation:**

Verify app recovers from errors.

\`\`\`javascript
test('shows error UI on crash', () => {
  const ThrowError = () => { throw new Error('Boom'); };
  
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});
\`\`\`

---

#### **Topic 9: Testing Dynamic Imports**
**Explanation:**

Wait for lazy-loaded components.

\`\`\`javascript
test('loads dynamic component', async () => {
  render(<PageWithDynamicComponent />);
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('Loaded Content')).toBeInTheDocument();
  });
});
\`\`\`

---

#### **Topic 10: Final Review & Best Practices**
**Explanation:**

1. **AAA Pattern**: Arrange, Act, Assert
2. **Avoid Implementation Details**: Test behavior
3. **Clean Up**: Reset mocks/handlers
4. **Coverage**: Aim for high confidence, not just 100% numbers
`,
  initialCode: `// ============================================
// STEP 19: Advanced Next.js Testing
// ============================================

// ================== MOCK CLASSES ==================

// Mock NextRequest (for Middleware)
class NextRequest {
  constructor(url, init = {}) {
    this.url = url;
    this.nextUrl = new URL(url);
    this.cookies = new Map(Object.entries(init.cookies || {}));
    this.headers = new Map(Object.entries(init.headers || {}));
  }
}

// Mock NextResponse (for Middleware)
class NextResponse {
  static next() {
    return { status: 200, headers: new Map() };
  }
  
  static redirect(url) {
    const headers = new Map();
    headers.set('Location', url);
    return { status: 307, headers };
  }
  
  static rewrite(url) {
    return { status: 200, rewrite: url, headers: new Map() };
  }
}

// ================== MIDDLEWARE ==================

function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 1. Protected Routes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token');
    
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl.toString());
    }
  }
  
  // 2. Redirects
  if (pathname === '/old-page') {
    return NextResponse.redirect(new URL('/new-page', request.url).toString());
  }
  
  // 3. Rewrites (e.g., for custom domains or paths)
  if (pathname.startsWith('/blog')) {
    return NextResponse.rewrite(new URL('/cms/blog', request.url).toString());
  }
  
  return NextResponse.next();
}

// ================== ACCESSIBILITY (A11Y) ==================

// Simulated axe-core
async function axe(html) {
  const violations = [];
  
  // Check 1: Images must have alt text
  if (html.includes('<img') && !html.includes('alt=')) {
    violations.push({
      id: 'image-alt',
      description: 'Images must have alternate text',
    });
  }
  
  // Check 2: Buttons must have text
  if (html.includes('<button></button>')) {
    violations.push({
      id: 'button-name',
      description: 'Buttons must have discernible text',
    });
  }
  
  return violations;
}

// Custom matcher for a11y
expect.extend({
  toHaveNoViolations(received) {
    const pass = received.length === 0;
    if (pass) {
      return {
        pass: true,
        message: () => 'Expected violations but found none',
      };
    } else {
      return {
        pass: false,
        message: () => 
          \`Expected no violations but found: \${JSON.stringify(received)}\`,
      };
    }
  },
});

// ================== ENVIRONMENT VARIABLES ==================

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}

function isFeatureEnabled(feature) {
  return process.env[\`FEATURE_\${feature.toUpperCase()}\`] === 'true';
}

// ================== ERROR BOUNDARY ==================

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

// ================== TESTS ==================

describe('Advanced Concepts Testing', () => {
  
  // ================== MIDDLEWARE TESTS ==================
  
  describe('Middleware', () => {
    test('allows access to public routes', () => {
      const req = new NextRequest('http://localhost:3000/');
      const res = middleware(req);
      
      expect(res.status).toBe(200);
    });
    
    test('redirects unauthenticated user from dashboard', () => {
      const req = new NextRequest('http://localhost:3000/dashboard');
      // No token in cookies
      
      const res = middleware(req);
      
      expect(res.status).toBe(307);
      expect(res.headers.get('Location')).toBe('http://localhost:3000/login');
    });
    
    test('allows authenticated user to dashboard', () => {
      const req = new NextRequest('http://localhost:3000/dashboard', {
        cookies: { token: 'valid' }
      });
      
      const res = middleware(req);
      
      expect(res.status).toBe(200);
    });
    
    test('redirects old paths', () => {
      const req = new NextRequest('http://localhost:3000/old-page');
      const res = middleware(req);
      
      expect(res.status).toBe(307);
      expect(res.headers.get('Location')).toBe('http://localhost:3000/new-page');
    });
    
    test('rewrites blog paths', () => {
      const req = new NextRequest('http://localhost:3000/blog/post-1');
      const res = middleware(req);
      
      expect(res.rewrite).toBe('http://localhost:3000/cms/blog');
    });
  });
  
  // ================== ACCESSIBILITY TESTS ==================
  
  describe('Accessibility (A11y)', () => {
    test('detects missing alt text', async () => {
      const html = '<div><img src="test.jpg" /></div>';
      const results = await axe(html);
      
      expect(results).not.toHaveNoViolations();
      expect(results[0].id).toBe('image-alt');
    });
    
    test('passes valid html', async () => {
      const html = '<div><img src="test.jpg" alt="Test" /></div>';
      const results = await axe(html);
      
      expect(results).toHaveNoViolations();
    });
    
    test('detects empty buttons', async () => {
      const html = '<button></button>';
      const results = await axe(html);
      
      expect(results).not.toHaveNoViolations();
      expect(results[0].id).toBe('button-name');
    });
  });
  
  // ================== ENVIRONMENT VARIABLE TESTS ==================
  
  describe('Environment Variables', () => {
    const originalEnv = process.env;
    
    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });
    
    afterAll(() => {
      process.env = originalEnv;
    });
    
    test('uses default API URL if not set', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      expect(getApiUrl()).toBe('http://localhost:3000');
    });
    
    test('uses configured API URL', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.production.com';
      expect(getApiUrl()).toBe('https://api.production.com');
    });
    
    test('checks feature flags', () => {
      process.env.FEATURE_BETA = 'true';
      expect(isFeatureEnabled('beta')).toBe(true);
      
      process.env.FEATURE_ALPHA = 'false';
      expect(isFeatureEnabled('alpha')).toBe(false);
    });
  });
  
  // ================== ERROR BOUNDARY TESTS ==================
  
  describe('Error Boundary', () => {
    // Note: We can't fully simulate React Error Boundaries in this simple runner
    // But we can test the logic if we were using Enzyme/RTL
    
    test('Error Boundary logic exists', () => {
      expect(ErrorBoundary).toBeDefined();
      expect(ErrorBoundary.getDerivedStateFromError).toBeDefined();
    });
    
    test('getDerivedStateFromError updates state', () => {
      const state = ErrorBoundary.getDerivedStateFromError(new Error('Test'));
      expect(state).toEqual({ hasError: true });
    });
  });
});

console.log('✅ Advanced Next.js Testing Complete!');
console.log('🛡️ Middleware logic verified');
console.log('♿ Accessibility checks implemented');
console.log('🔧 Environment configuration tested');
console.log('🎉 CONGRATULATIONS! You have completed the Jest & Next.js Testing Course!');
`
};
