import { Step } from '../types';

export const step16: Step = {
  id: '16',
  title: 'Testing Next.js Data Fetching (SSR/SSG)',
  description: `## **Step 16: Testing Next.js Data Fetching (SSR/SSG)**

#### **Topic 1: Testing getServerSideProps (SSR)**
**Explanation:**

**getServerSideProps** runs on the server for every request.

**Testing Strategy:**
1. Import the function
2. Mock external dependencies (fetch, database)
3. Call function with mock context
4. Assert returned props

\`\`\`javascript
import { getServerSideProps } from './index';

test('getServerSideProps returns data', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ title: 'Test' })
  });
  
  const context = { params: { id: '1' } };
  const response = await getServerSideProps(context);
  
  expect(response).toEqual({
    props: {
      data: { title: 'Test' }
    }
  });
});
\`\`\`

---

#### **Topic 2: Testing getStaticProps (SSG)**
**Explanation:**

**getStaticProps** runs at build time.

**Testing Strategy:**
Similar to getServerSideProps, but focus on build-time logic.

\`\`\`javascript
import { getStaticProps } from './[id]';

test('getStaticProps fetches static data', async () => {
  const context = { params: { id: '1' } };
  const response = await getStaticProps(context);
  
  expect(response.props.post).toBeDefined();
  expect(response.revalidate).toBe(60);
});
\`\`\`

---

#### **Topic 3: Testing getStaticPaths**
**Explanation:**

**getStaticPaths** defines which paths to pre-render.

\`\`\`javascript
import { getStaticPaths } from './[id]';

test('getStaticPaths returns correct paths', async () => {
  const response = await getStaticPaths();
  
  expect(response.paths).toContainEqual({
    params: { id: '1' }
  });
  expect(response.fallback).toBe('blocking');
});
\`\`\`

---

#### **Topic 4: Mocking fetch for Data Fetching**
**Explanation:**

Use \`jest.fn()\` or \`msw\` to mock \`fetch\`.

\`\`\`javascript
beforeEach(() => {
  global.fetch = jest.fn();
});

test('handles fetch error', async () => {
  global.fetch.mockRejectedValue(new Error('API Error'));
  
  const response = await getServerSideProps({});
  
  expect(response.props.error).toBe('API Error');
});
\`\`\`

---

#### **Topic 5: Testing Redirects in Data Fetching**
**Explanation:**

Verify function returns redirect object.

\`\`\`javascript
test('redirects if user not found', async () => {
  global.fetch.mockResolvedValue({ status: 404 });
  
  const response = await getServerSideProps({ params: { id: '999' } });
  
  expect(response).toEqual({
    redirect: {
      destination: '/404',
      permanent: false,
    },
  });
});
\`\`\`

---

#### **Topic 6: Testing NotFound in Data Fetching**
**Explanation:**

Verify function returns notFound object.

\`\`\`javascript
test('returns notFound if data missing', async () => {
  const response = await getStaticProps({ params: { slug: 'missing' } });
  
  expect(response).toEqual({
    notFound: true,
  });
});
\`\`\`

---

#### **Topic 7: Testing Context Parameters**
**Explanation:**

Ensure function uses context (params, query, req, res) correctly.

\`\`\`javascript
test('uses query params', async () => {
  const context = { query: { page: '2' } };
  await getServerSideProps(context);
  
  expect(fetch).toHaveBeenCalledWith('/api/posts?page=2');
});
\`\`\`

---

#### **Topic 8: Testing Revalidation (ISR)**
**Explanation:**

Verify \`revalidate\` property in \`getStaticProps\`.

\`\`\`javascript
test('enables ISR with revalidate', async () => {
  const response = await getStaticProps({});
  
  expect(response.revalidate).toBe(10); // 10 seconds
});
\`\`\`

---

#### **Topic 9: Testing Error Handling**
**Explanation:**

Ensure graceful error handling in data fetching methods.

\`\`\`javascript
test('returns empty props on error', async () => {
  global.fetch.mockRejectedValue(new Error('Fail'));
  
  const response = await getStaticProps({});
  
  expect(response.props).toEqual({ data: [] });
});
\`\`\`

---

#### **Topic 10: Integration with Components**
**Explanation:**

Test that the component renders correctly with props from data fetching.

\`\`\`javascript
test('page renders with server props', () => {
  const props = { title: 'Server Data' };
  render(<Page {...props} />);
  
  expect(screen.getByText('Server Data')).toBeInTheDocument();
});
\`\`\`
`,
  initialCode: `// ============================================
// STEP 16: Testing Next.js Data Fetching
// ============================================

// ================== MOCK SETUP ==================

// Mock global fetch
global.fetch = jest.fn();

// ================== DATA FETCHING FUNCTIONS ==================

// 1. getServerSideProps (SSR)
async function getServerSideProps(context) {
  const { id } = context.params || {};
  
  try {
    const res = await fetch(\`https://api.example.com/posts/\${id}\`);
    
    if (res.status === 404) {
      return {
        notFound: true,
      };
    }
    
    if (!res.ok) {
      throw new Error('API Error');
    }
    
    const data = await res.json();
    
    return {
      props: {
        post: data,
      },
    };
  } catch (error) {
    return {
      props: {
        error: error.message,
      },
    };
  }
}

// 2. getStaticProps (SSG)
async function getStaticProps(context) {
  const res = await fetch('https://api.example.com/products');
  const data = await res.json();
  
  if (!data || data.length === 0) {
    return {
      redirect: {
        destination: '/no-products',
        permanent: false,
      },
    };
  }
  
  return {
    props: {
      products: data,
    },
    revalidate: 60, // ISR
  };
}

// 3. getStaticPaths (SSG)
async function getStaticPaths() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();
  
  const paths = posts.map((post) => ({
    params: { id: post.id.toString() },
  }));
  
  return {
    paths,
    fallback: 'blocking',
  };
}

// 4. getServerSideProps with Authentication
async function getServerSidePropsAuth(context) {
  const { req } = context;
  const token = req.cookies?.token;
  
  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  
  return {
    props: {
      user: { name: 'Authenticated User' },
    },
  };
}

// ================== TESTS ==================

describe('Next.js Data Fetching Tests', () => {
  
  beforeEach(() => {
    fetch.mockClear();
  });
  
  // ================== getServerSideProps TESTS ==================
  
  describe('getServerSideProps', () => {
    test('returns data when API call succeeds', async () => {
      const mockPost = { id: 1, title: 'Test Post' };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockPost,
      });
      
      const context = { params: { id: '1' } };
      const response = await getServerSideProps(context);
      
      expect(response).toEqual({
        props: {
          post: mockPost,
        },
      });
      expect(fetch).toHaveBeenCalledWith('https://api.example.com/posts/1');
    });
    
    test('returns notFound when API returns 404', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });
      
      const context = { params: { id: '999' } };
      const response = await getServerSideProps(context);
      
      expect(response).toEqual({
        notFound: true,
      });
    });
    
    test('returns error prop when API fails', async () => {
      fetch.mockRejectedValueOnce(new Error('Network Error'));
      
      const context = { params: { id: '1' } };
      const response = await getServerSideProps(context);
      
      expect(response).toEqual({
        props: {
          error: 'Network Error',
        },
      });
    });
  });
  
  // ================== getStaticProps TESTS ==================
  
  describe('getStaticProps', () => {
    test('returns products and revalidate', async () => {
      const mockProducts = [{ id: 1, name: 'Product A' }];
      
      fetch.mockResolvedValueOnce({
        json: async () => mockProducts,
      });
      
      const response = await getStaticProps({});
      
      expect(response).toEqual({
        props: {
          products: mockProducts,
        },
        revalidate: 60,
      });
    });
    
    test('redirects when no products found', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => [], // Empty array
      });
      
      const response = await getStaticProps({});
      
      expect(response).toEqual({
        redirect: {
          destination: '/no-products',
          permanent: false,
        },
      });
    });
  });
  
  // ================== getStaticPaths TESTS ==================
  
  describe('getStaticPaths', () => {
    test('generates paths from API data', async () => {
      const mockPosts = [
        { id: 1 },
        { id: 2 },
      ];
      
      fetch.mockResolvedValueOnce({
        json: async () => mockPosts,
      });
      
      const response = await getStaticPaths();
      
      expect(response.paths).toHaveLength(2);
      expect(response.paths).toContainEqual({ params: { id: '1' } });
      expect(response.paths).toContainEqual({ params: { id: '2' } });
      expect(response.fallback).toBe('blocking');
    });
  });
  
  // ================== AUTHENTICATION TESTS ==================
  
  describe('getServerSidePropsAuth', () => {
    test('redirects to login if no token', async () => {
      const context = {
        req: {
          cookies: {},
        },
      };
      
      const response = await getServerSidePropsAuth(context);
      
      expect(response).toEqual({
        redirect: {
          destination: '/login',
          permanent: false,
        },
      });
    });
    
    test('returns user if token exists', async () => {
      const context = {
        req: {
          cookies: { token: 'valid-token' },
        },
      };
      
      const response = await getServerSidePropsAuth(context);
      
      expect(response).toEqual({
        props: {
          user: { name: 'Authenticated User' },
        },
      });
    });
  });
  
  // ================== EDGE CASES ==================
  
  describe('Edge Cases', () => {
    test('getServerSideProps handles missing params', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });
      
      // Call without params
      const response = await getServerSideProps({});
      
      // Should fetch with undefined id -> "undefined"
      expect(fetch).toHaveBeenCalledWith('https://api.example.com/posts/undefined');
    });
    
    test('getStaticProps handles null API response', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => null,
      });
      
      const response = await getStaticProps({});
      
      expect(response.redirect).toBeDefined();
    });
  });
});

console.log('✅ Next.js Data Fetching Testing Complete!');
console.log('📡 getServerSideProps, getStaticProps, getStaticPaths covered');
console.log('🔒 Authentication and error handling scenarios verified');
console.log('🎯 Ready for Client-Side Data Fetching testing');
`
};
