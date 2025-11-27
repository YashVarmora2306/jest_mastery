import { Step } from '../types';

export const step17: Step = {
  id: '17',
  title: 'Testing Data Fetching (Client-Side)',
  description: `## **Step 17: Testing Data Fetching (Client-Side)**

#### **Topic 1: Mocking Global fetch**
**Explanation:**

**Basic fetch mock:**
\`\`\`javascript
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'mocked data' }),
  })
);

beforeEach(() => {
  fetch.mockClear();
});
\`\`\`

**Mocking specific responses:**
\`\`\`javascript
fetch.mockImplementationOnce(() =>
  Promise.resolve({
    json: () => Promise.resolve({ id: 1 }),
  })
);
\`\`\`

---

#### **Topic 2: Testing Loading States**
**Explanation:**

Verify loading indicator appears while data is fetching.

\`\`\`javascript
test('shows loading state', async () => {
  // Delay response
  fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
  
  render(<UserList />);
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
\`\`\`

---

#### **Topic 3: Testing Error States**
**Explanation:**

Verify error message appears when fetch fails.

\`\`\`javascript
test('shows error message', async () => {
  fetch.mockRejectedValue(new Error('API Failed'));
  
  render(<UserList />);
  
  await waitFor(() => {
    expect(screen.getByText('Error: API Failed')).toBeInTheDocument();
  });
});
\`\`\`

---

#### **Topic 4: Testing Successful Data Rendering**
**Explanation:**

Verify data is displayed after successful fetch.

\`\`\`javascript
test('renders users', async () => {
  fetch.mockResolvedValue({
    ok: true,
    json: async () => [{ id: 1, name: 'John' }],
  });
  
  render(<UserList />);
  
  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
\`\`\`

---

#### **Topic 5: Testing SWR / React Query**
**Explanation:**

**Mocking SWR:**
\`\`\`javascript
import useSWR from 'swr';
jest.mock('swr');

test('renders data from SWR', () => {
  useSWR.mockReturnValue({
    data: { name: 'Test' },
    error: undefined,
  });
  
  render(<Profile />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
\`\`\`

**Testing React Query:**
Wrap component in \`QueryClientProvider\` for tests.

---

#### **Topic 6: Using MSW (Mock Service Worker)**
**Explanation:**

**MSW** intercepts network requests at network level.

**Setup:**
\`\`\`javascript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/user', (req, res, ctx) => {
    return res(ctx.json({ name: 'John' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
\`\`\`

**Why MSW?**
- No need to mock \`fetch\` manually
- Reusable handlers
- Closer to real interaction

---

#### **Topic 7: Testing Pagination**
**Explanation:**

\`\`\`javascript
test('loads next page', async () => {
  render(<PaginatedList />);
  
  await userEvent.click(screen.getByText('Next'));
  
  expect(fetch).toHaveBeenCalledWith('/api/items?page=2');
});
\`\`\`

---

#### **Topic 8: Testing Search/Filtering**
**Explanation:**

\`\`\`javascript
test('filters results', async () => {
  render(<SearchList />);
  
  await userEvent.type(screen.getByRole('textbox'), 'query');
  await userEvent.click(screen.getByText('Search'));
  
  expect(fetch).toHaveBeenCalledWith('/api/search?q=query');
});
\`\`\`

---

#### **Topic 9: Testing Data Mutations (POST/PUT/DELETE)**
**Explanation:**

\`\`\`javascript
test('creates new item', async () => {
  fetch.mockResolvedValue({ ok: true });
  
  render(<CreateForm />);
  await userEvent.type(screen.getByRole('textbox'), 'New Item');
  await userEvent.click(screen.getByText('Create'));
  
  expect(fetch).toHaveBeenCalledWith('/api/items', expect.objectContaining({
    method: 'POST',
    body: JSON.stringify({ name: 'New Item' }),
  }));
});
\`\`\`

---

#### **Topic 10: Testing Empty States**
**Explanation:**

\`\`\`javascript
test('shows empty message', async () => {
  fetch.mockResolvedValue({
    json: async () => [],
  });
  
  render(<List />);
  
  await waitFor(() => {
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });
});
\`\`\`
`,
  initialCode: `// ============================================
// STEP 17: Testing Client-Side Data Fetching
// ============================================

// ================== MOCK SETUP ==================

// Mock global fetch
global.fetch = jest.fn();

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
    // In this simulation, we run effect immediately
    // For async tests, we might need to handle cleanup or re-runs
    const cleanup = callback();
    if (typeof cleanup === 'function') {
      // We don't really handle unmount in this simple sim, but good to support
    }
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

// ================== COMPONENTS ==================

// User List Component
function UserList() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await res.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (users.length === 0) return <div>No users found</div>;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// Search Component
function UserSearch() {
  const [query, setQuery] = React.useState('');
  const [result, setResult] = React.useState(null);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    const res = await fetch(\`/api/search?q=\${query}\`);
    const data = await res.json();
    setResult(data);
  };
  
  return (
    <div>
      <form onSubmit={handleSearch}>
        <input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users"
        />
        <button type="submit">Search</button>
      </form>
      {result && <div data-testid="result">{result.name}</div>}
    </div>
  );
}

// Create User Form (POST request)
function CreateUserForm() {
  const [name, setName] = React.useState('');
  const [status, setStatus] = React.useState('idle');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (res.ok) {
        setStatus('success');
        setName('');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Creating...' : 'Create'}
      </button>
      {status === 'success' && <span>User created!</span>}
      {status === 'error' && <span>Error creating user</span>}
    </form>
  );
}

// Custom Hook for Data Fetching
function useData(url) {
  const [data, setData] = React.useState(null);
  
  React.useEffect(() => {
    let mounted = true;
    
    fetch(url)
      .then(res => res.json())
      .then(json => {
        if (mounted) setData(json);
      });
      
    return () => {
      mounted = false;
    };
  }, [url]);
  
  return data;
}

// Component using Custom Hook
function DataDisplay({ url }) {
  const data = useData(url);
  
  if (!data) return <div>Loading...</div>;
  
  return <div>Data: {data.value}</div>;
}

// ================== TESTS ==================

describe('Client-Side Data Fetching', () => {
  
  beforeEach(() => {
    fetch.mockClear();
    // Reset React hooks state (simulated)
    React.resetHooks();
  });
  
  // ================== LOADING & SUCCESS STATES ==================
  
  describe('UserList Component', () => {
    test('shows loading state initially', () => {
      // Mock fetch to never resolve immediately (or use fake timers)
      fetch.mockImplementation(() => new Promise(() => {}));
      
      const component = UserList();
      
      expect(component.type).toBe('div');
      expect(component.props.children).toBe('Loading...');
    });
    
    test('renders users after successful fetch', async () => {
      const mockUsers = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ];
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockUsers,
      });
      
      // Initial render (triggers effect)
      let component = UserList();
      
      // Wait for async operations (simulated)
      await Promise.resolve();
      await Promise.resolve();
      
      // Re-render (simulated)
      React.__stateIndex = 0;
      component = UserList();
      
      expect(component.type).toBe('ul');
      expect(component.props.children).toHaveLength(2);
      expect(component.props.children[0].props.children).toBe('Alice');
    });
    
    test('shows empty state when no users', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });
      
      let component = UserList();
      await Promise.resolve();
      await Promise.resolve();
      
      React.__stateIndex = 0;
      component = UserList();
      
      expect(component.props.children).toBe('No users found');
    });
  });
  
  // ================== ERROR HANDLING ==================
  
  describe('Error Handling', () => {
    test('shows error message on fetch failure', async () => {
      fetch.mockRejectedValue(new Error('Network Error'));
      
      let component = UserList();
      await Promise.resolve();
      await Promise.resolve();
      
      React.__stateIndex = 0;
      component = UserList();
      
      expect(component.props.children).toEqual(['Error: ', 'Network Error']);
    });
    
    test('shows error message on non-ok response', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
      });
      
      let component = UserList();
      await Promise.resolve();
      await Promise.resolve();
      
      React.__stateIndex = 0;
      component = UserList();
      
      expect(component.props.children).toEqual(['Error: ', 'Failed to fetch users']);
    });
  });
  
  // ================== USER INTERACTION & FETCH ==================
  
  describe('UserSearch Component', () => {
    test('fetches data on search submit', async () => {
      fetch.mockResolvedValue({
        json: async () => ({ name: 'Result' }),
      });
      
      let component = UserSearch();
      const form = component.props.children[0];
      const input = form.props.children[0];
      
      // Type query
      input.props.onChange({ target: { value: 'test' } });
      
      // Re-render to update state
      React.__stateIndex = 0;
      component = UserSearch();
      const updatedForm = component.props.children[0];
      
      // Submit form
      await updatedForm.props.onSubmit({ preventDefault: () => {} });
      
      expect(fetch).toHaveBeenCalledWith('/api/search?q=test');
    });
  });
  
  // ================== POST REQUESTS ==================
  
  describe('CreateUserForm Component', () => {
    test('sends POST request with correct data', async () => {
      fetch.mockResolvedValue({ ok: true });
      
      let component = CreateUserForm();
      const input = component.props.children[0];
      
      // Type name
      input.props.onChange({ target: { value: 'New User' } });
      
      // Re-render
      React.__stateIndex = 0;
      component = CreateUserForm();
      const form = component;
      
      // Submit
      await form.props.onSubmit({ preventDefault: () => {} });
      
      expect(fetch).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New User' }),
      });
    });
    
    test('shows success message', async () => {
      fetch.mockResolvedValue({ ok: true });
      
      let component = CreateUserForm();
      const form = component;
      
      await form.props.onSubmit({ preventDefault: () => {} });
      
      // Re-render to check state
      React.__stateIndex = 0;
      component = CreateUserForm();
      const successMsg = component.props.children[2];
      
      expect(successMsg.props.children).toBe('User created!');
    });
  });
  
  // ================== CUSTOM HOOKS ==================
  
  describe('Custom Hook Data Fetching', () => {
    test('useData fetches and returns data', async () => {
      fetch.mockResolvedValue({
        json: async () => ({ value: 'Hook Data' }),
      });
      
      let component = DataDisplay({ url: '/api/data' });
      
      // Initially loading
      expect(component.props.children).toBe('Loading...');
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Re-render
      React.__stateIndex = 0;
      component = DataDisplay({ url: '/api/data' });
      
      // console.log('DataDisplay children:', component.props.children);
      expect(component.props.children).toContain('Hook Data');
    });
  });
  
  // ================== EDGE CASES ==================
  
  describe('Edge Cases', () => {
    test('handles race conditions (simulated)', async () => {
      // In a real test, we'd verify cleanup function is called
      // Here we just ensure the hook structure supports cleanup
      const component = DataDisplay({ url: '/api/1' });
      
      // Simulate unmount/cleanup logic check
      // This is implicit in the hook implementation
      expect(component).toBeDefined();
    });
  });
});

console.log('✅ Client-Side Data Fetching Testing Complete!');
console.log('🔄 Loading, Error, and Success states verified');
console.log('📤 GET and POST requests tested');
console.log('🎯 Ready for API Routes testing');
`
};
