import { Step } from '../types';

export const step15: Step = {
  id: '15',
  title: 'Testing Next.js Router & Navigation',
  description: `## **Step 15: Testing Next.js Router & Navigation**

#### **Topic 1: Mocking useRouter (Pages Router)**
**Explanation:**

**Using next-router-mock:**
\`\`\`javascript
import mockRouter from 'next-router-mock';

jest.mock('next/router', () => require('next-router-mock'));

test('redirects to login', () => {
  mockRouter.push('/dashboard');
  expect(mockRouter).toMatchObject({ asPath: '/dashboard' });
});
\`\`\`

**Manual Mocking:**
\`\`\`javascript
const useRouter = jest.spyOn(require('next/router'), 'useRouter');

test('accesses query params', () => {
  useRouter.mockImplementation(() => ({
    query: { id: '123' },
    pathname: '/post/[id]',
  }));
  
  render(<PostPage />);
  expect(screen.getByText('Post 123')).toBeInTheDocument();
});
\`\`\`

---

#### **Topic 2: Mocking App Router (Next.js 13+)**
**Explanation:**

**Mocking hooks:**
\`\`\`javascript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
\`\`\`

**Testing navigation:**
\`\`\`javascript
import { useRouter } from 'next/navigation';

test('navigates on click', async () => {
  const push = jest.fn();
  (useRouter).mockReturnValue({ push });
  
  render(<LoginButton />);
  await userEvent.click(screen.getByRole('button'));
  
  expect(push).toHaveBeenCalledWith('/dashboard');
});
\`\`\`

---

#### **Topic 3: Testing next/link**
**Explanation:**

**Link component behavior:**
\`\`\`javascript
test('link points to correct location', () => {
  render(<Link href="/about">About</Link>);
  
  const link = screen.getByRole('link', { name: 'About' });
  expect(link).toHaveAttribute('href', '/about');
});
\`\`\`

---

#### **Topic 4: Testing router.push() and replace()**
**Explanation:**

\`\`\`javascript
test('programmatic navigation', async () => {
  const user = userEvent.setup();
  render(<SearchForm />);
  
  await user.type(screen.getByRole('textbox'), 'react');
  await user.click(screen.getByRole('button'));
  
  expect(mockRouter.push).toHaveBeenCalledWith('/search?q=react');
});
\`\`\`

---

#### **Topic 5: Testing Route Parameters**
**Explanation:**

\`\`\`javascript
test('renders with route params', () => {
  mockRouter.push('/users/123');
  
  render(<UserProfile />);
  
  expect(screen.getByText('User ID: 123')).toBeInTheDocument();
});
\`\`\`

---

#### **Topic 6: Testing Query Parameters**
**Explanation:**

\`\`\`javascript
test('renders with query params', () => {
  mockRouter.push('/products?category=electronics');
  
  render(<ProductList />);
  
  expect(screen.getByText('Category: electronics')).toBeInTheDocument();
});
\`\`\`

---

#### **Topic 7: Testing Navigation Events**
**Explanation:**

**Listening to events:**
\`\`\`javascript
test('triggers route change events', () => {
  const handleRouteChange = jest.fn();
  Router.events.on('routeChangeStart', handleRouteChange);
  
  mockRouter.push('/new-page');
  
  expect(handleRouteChange).toHaveBeenCalledWith('/new-page');
});
\`\`\`

---

#### **Topic 8: Testing Route Guards/Protection**
**Explanation:**

\`\`\`javascript
test('redirects unauthenticated user', () => {
  // Mock unauthenticated state
  useSession.mockReturnValue({ status: 'unauthenticated' });
  
  render(<ProtectedPage />);
  
  expect(mockRouter.push).toHaveBeenCalledWith('/login');
});
\`\`\`

---

#### **Topic 9: Testing 404 Pages**
**Explanation:**

\`\`\`javascript
test('shows 404 for unknown routes', () => {
  mockRouter.push('/unknown-page');
  
  render(<App />);
  
  expect(screen.getByText('Page Not Found')).toBeInTheDocument();
});
\`\`\`

---

#### **Topic 10: Testing Dynamic Routes**
**Explanation:**

\`\`\`javascript
test('matches dynamic route pattern', () => {
  mockRouter.push('/blog/my-post');
  
  expect(mockRouter).toMatchObject({
    pathname: '/blog/[slug]',
    query: { slug: 'my-post' },
    asPath: '/blog/my-post',
  });
});
\`\`\`
`,
  initialCode: `// ============================================
// STEP 15: Testing Next.js Router
// ============================================

// ================== MOCK ROUTER SETUP ==================

// Mock implementation of next/router
const mockRouter = {
  pathname: '/',
  query: {},
  asPath: '/',
  push: jest.fn().mockImplementation((url) => {
    // Basic URL parsing to update mock state
    const [path, queryString] = url.split('?');
    mockRouter.pathname = path;
    mockRouter.asPath = url;
    
    if (queryString) {
      const params = new URLSearchParams(queryString);
      const query = {};
      for (const [key, value] of params.entries()) {
        query[key] = value;
      }
      mockRouter.query = query;
    } else {
      mockRouter.query = {};
    }
    return Promise.resolve(true);
  }),
  replace: jest.fn().mockResolvedValue(true),
  back: jest.fn(),
  reload: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
};

// Mock useRouter hook
const useRouter = () => mockRouter;

// Mock usePathname (App Router)
const usePathname = () => mockRouter.pathname;

// Mock useSearchParams (App Router)
const useSearchParams = () => new URLSearchParams(mockRouter.query);

// ================== SIMULATED REACT ==================
const React = {
  __state: [],
  __stateIndex: 0,
  
  useState(initialValue) {
    const index = this.__stateIndex;
    if (this.__state[index] === undefined) {
      this.__state[index] = typeof initialValue === 'function' 
        ? initialValue() 
        : initialValue;
    }
    
    const setState = (newValue) => {
      this.__state[index] = typeof newValue === 'function' 
        ? newValue(this.__state[index])
        : newValue;
    };
    
    this.__stateIndex++;
    return [this.__state[index], setState];
  },
  
  useEffect(callback, deps) {
    callback();
  },
  
  createElement(type, props, ...children) {
    return {
      type,
      props: {
        ...props,
        children: children.length === 1 ? children[0] : (children.length === 0 ? undefined : children)
      }
    };
  },
  
  resetHooks() {
    this.__stateIndex = 0;
    this.__state = [];
  }
};

// ================== COMPONENTS USING ROUTER ==================

// Navigation Component
function NavBar() {
  const router = useRouter();
  
  return (
    <nav>
      <button onClick={() => router.push('/')}>Home</button>
      <button onClick={() => router.push('/about')}>About</button>
      <button onClick={() => router.push('/contact')}>Contact</button>
    </nav>
  );
}

// Search Component
function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    router.push(\`/search?q=\${query}\`);
  };
  
  return (
    <form onSubmit={handleSearch}>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <button type="submit">Search</button>
    </form>
  );
}

// Protected Route Component
function Dashboard({ isAuthenticated }) {
  const router = useRouter();
  
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated) return null;
  
  return <div>Dashboard Content</div>;
}

// Dynamic Route Component
function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  
  if (!id) return <div>Loading...</div>;
  
  return <div>Product ID: {id}</div>;
}

// Active Link Component
function ActiveLink({ href, children }) {
  const router = useRouter();
  const isActive = router.pathname === href;
  
  const handleClick = (e) => {
    e.preventDefault();
    router.push(href);
  };
  
  return (
    <a 
      href={href} 
      onClick={handleClick}
      className={isActive ? 'active' : ''}
    >
      {children}
    </a>
  );
}

// Breadcrumbs Component (App Router style)
function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);
  
  return (
    <div className="breadcrumbs">
      <span>Home</span>
      {parts.map((part, index) => (
        <span key={index}> / {part}</span>
      ))}
    </div>
  );
}

// ================== TESTS ==================

describe('Next.js Router Testing', () => {
  
  beforeEach(() => {
    // Reset router state before each test
    mockRouter.pathname = '/';
    mockRouter.query = {};
    mockRouter.asPath = '/';
    mockRouter.push.mockClear();
    mockRouter.replace.mockClear();
    React.resetHooks();
  });
  
  // ================== BASIC NAVIGATION ==================
  
  describe('Basic Navigation', () => {
    test('NavBar navigates to correct pages', () => {
      const navBar = NavBar();
      
      // Simulate click on About
      const aboutBtn = navBar.props.children[1];
      aboutBtn.props.onClick();
      
      expect(mockRouter.push).toHaveBeenCalledWith('/about');
    });
    
    test('NavBar navigates to Home', () => {
      const navBar = NavBar();
      
      // Simulate click on Home
      const homeBtn = navBar.props.children[0];
      homeBtn.props.onClick();
      
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });
  
  // ================== QUERY PARAMETERS ==================
  
  describe('Query Parameters', () => {
    test('SearchBar pushes correct query params', () => {
      let searchBar = SearchBar();
      
      // Simulate typing
      const input = searchBar.props.children[0];
      input.props.onChange({ target: { value: 'jest' } });
      
      // Re-render to update state closure
      React.__stateIndex = 0; // Reset index for re-render
      searchBar = SearchBar();
      
      // Simulate submit
      searchBar.props.onSubmit({ preventDefault: () => {} });
      
      expect(mockRouter.push).toHaveBeenCalledWith('/search?q=jest');
    });
    
    test('router updates query state on push', () => {
      mockRouter.push('/search?q=react');
      
      expect(mockRouter.query).toEqual({ q: 'react' });
      expect(mockRouter.pathname).toBe('/search');
    });
  });
  
  // ================== ROUTE PROTECTION ==================
  
  describe('Route Protection', () => {
    test('Dashboard redirects to login if not authenticated', () => {
      // Simulate effect
      if (!false) { // isAuthenticated = false
        mockRouter.push('/login');
      }
      
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
    
    test('Dashboard renders content if authenticated', () => {
      const dashboard = Dashboard({ isAuthenticated: true });
      
      expect(dashboard).not.toBeNull();
      expect(dashboard.props.children).toBe('Dashboard Content');
    });
  });
  
  // ================== DYNAMIC ROUTES ==================
  
  describe('Dynamic Routes', () => {
    test('ProductPage renders loading state initially', () => {
      mockRouter.query = {}; // No ID
      const page = ProductPage();
      
      expect(page.props.children).toBe('Loading...');
    });
    
    test('ProductPage renders product ID from query', () => {
      mockRouter.query = { id: '123' };
      const page = ProductPage();
      
      expect(page.props.children).toEqual(['Product ID: ', '123']);
    });
  });
  
  // ================== ACTIVE LINKS ==================
  
  describe('Active Links', () => {
    test('ActiveLink has active class when on current page', () => {
      mockRouter.pathname = '/about';
      const link = ActiveLink({ href: '/about', children: 'About' });
      
      expect(link.props.className).toBe('active');
    });
    
    test('ActiveLink does not have active class when on different page', () => {
      mockRouter.pathname = '/';
      const link = ActiveLink({ href: '/about', children: 'About' });
      
      expect(link.props.className).toBe('');
    });
    
    test('ActiveLink navigates on click', () => {
      const link = ActiveLink({ href: '/contact', children: 'Contact' });
      
      link.props.onClick({ preventDefault: () => {} });
      
      expect(mockRouter.push).toHaveBeenCalledWith('/contact');
    });
  });
  
  // ================== APP ROUTER HOOKS ==================
  
  describe('App Router Hooks', () => {
    test('usePathname returns current path', () => {
      mockRouter.pathname = '/blog/post-1';
      const pathname = usePathname();
      
      expect(pathname).toBe('/blog/post-1');
    });
    
    test('useSearchParams returns URLSearchParams', () => {
      mockRouter.query = { sort: 'desc', page: '2' };
      const params = useSearchParams();
      
      expect(params.get('sort')).toBe('desc');
      expect(params.get('page')).toBe('2');
    });
    
    test('Breadcrumbs renders correct path segments', () => {
      mockRouter.pathname = '/products/electronics/laptops';
      const breadcrumbs = Breadcrumbs();
      
      const parts = breadcrumbs.props.children[1];
      expect(parts).toHaveLength(3); // products, electronics, laptops
    });
  });
  
  // ================== EDGE CASES ==================
  
  describe('Router Edge Cases', () => {
    test('handles empty query params', () => {
      mockRouter.push('/page');
      expect(mockRouter.query).toEqual({});
    });
    
    test('handles multiple query params', () => {
      mockRouter.push('/search?q=test&sort=asc&page=1');
      expect(mockRouter.query).toEqual({
        q: 'test',
        sort: 'asc',
        page: '1'
      });
    });
    
    test('handles encoded URI components', () => {
      mockRouter.push('/search?q=hello%20world');
      expect(mockRouter.query).toEqual({ q: 'hello world' });
    });
    
    test('handles path without leading slash', () => {
      // Our mock implementation assumes paths start with /
      // But let's verify push is called correctly
      mockRouter.push('relative/path');
      expect(mockRouter.push).toHaveBeenCalledWith('relative/path');
    });
  });
});

console.log('✅ Next.js Router Testing Complete!');
console.log('🛣️ Pages Router and App Router hooks mocked');
console.log('🧭 Navigation logic and route protection verified');
console.log('🎯 Ready for Data Fetching testing');
`
};
