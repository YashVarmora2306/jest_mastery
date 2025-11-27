import { Step } from '../types';

export const step18: Step = {
  id: '18',
  title: 'Testing Next.js API Routes',
  description: `## **Step 18: Testing Next.js API Routes**

#### **Topic 1: Mocking Request and Response**
**Explanation:**

Use \`node-mocks-http\` to create mock \`req\` and \`res\` objects.

\`\`\`javascript
import { createMocks } from 'node-mocks-http';
import handler from './api/user';

test('returns user data', async () => {
  const { req, res } = createMocks({
    method: 'GET',
  });
  
  await handler(req, res);
  
  expect(res._getStatusCode()).toBe(200);
  expect(JSON.parse(res._getData())).toEqual({
    name: 'John Doe',
  });
});
\`\`\`

---

#### **Topic 2: Testing Different HTTP Methods**
**Explanation:**

Handle GET, POST, PUT, DELETE in the same handler.

\`\`\`javascript
test('handles POST request', async () => {
  const { req, res } = createMocks({
    method: 'POST',
    body: { name: 'New User' },
  });
  
  await handler(req, res);
  
  expect(res._getStatusCode()).toBe(201);
});
\`\`\`

---

#### **Topic 3: Testing Query Parameters**
**Explanation:**

\`\`\`javascript
test('filters by query param', async () => {
  const { req, res } = createMocks({
    method: 'GET',
    query: { id: '123' },
  });
  
  await handler(req, res);
  
  expect(JSON.parse(res._getData())).toEqual({ id: '123' });
});
\`\`\`

---

#### **Topic 4: Testing Error Handling**
**Explanation:**

Verify API returns correct error codes.

\`\`\`javascript
test('returns 400 for missing data', async () => {
  const { req, res } = createMocks({
    method: 'POST',
    body: {}, // Missing name
  });
  
  await handler(req, res);
  
  expect(res._getStatusCode()).toBe(400);
});
\`\`\`

---

#### **Topic 5: Testing Authentication Middleware**
**Explanation:**

\`\`\`javascript
test('returns 401 if unauthorized', async () => {
  const { req, res } = createMocks({
    method: 'GET',
    // No headers
  });
  
  await handler(req, res);
  
  expect(res._getStatusCode()).toBe(401);
});
\`\`\`

---

#### **Topic 6: Testing Dynamic API Routes**
**Explanation:**

\`\`\`javascript
// pages/api/posts/[id].js

test('returns post by ID', async () => {
  const { req, res } = createMocks({
    method: 'GET',
    query: { id: '5' }, // Dynamic param is in query
  });
  
  await handler(req, res);
  
  expect(JSON.parse(res._getData()).id).toBe('5');
});
\`\`\`

---

#### **Topic 7: Testing External API Calls within Handlers**
**Explanation:**

Mock \`fetch\` or database calls inside the handler.

\`\`\`javascript
test('calls external service', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true });
  
  const { req, res } = createMocks({ method: 'GET' });
  await handler(req, res);
  
  expect(fetch).toHaveBeenCalled();
});
\`\`\`

---

#### **Topic 8: Testing Headers**
**Explanation:**

\`\`\`javascript
test('checks content-type header', async () => {
  const { req, res } = createMocks({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  await handler(req, res);
  
  expect(res._getStatusCode()).toBe(200);
});
\`\`\`

---

#### **Topic 9: Testing Cookies**
**Explanation:**

\`\`\`javascript
test('reads cookies', async () => {
  const { req, res } = createMocks({
    method: 'GET',
    cookies: { token: 'abc' },
  });
  
  await handler(req, res);
  
  expect(res._getStatusCode()).toBe(200);
});
\`\`\`

---

#### **Topic 10: Testing Next.js 13+ Route Handlers**
**Explanation:**

Testing \`app/api/route.ts\` (Request/Response objects).

\`\`\`javascript
import { GET } from './route';

test('GET returns data', async () => {
  const request = new Request('http://localhost/api/user');
  const response = await GET(request);
  const data = await response.json();
  
  expect(response.status).toBe(200);
  expect(data.name).toBe('John');
});
\`\`\`
`,
  initialCode: `// ============================================
// STEP 18: Testing Next.js API Routes
// ============================================

// ================== MOCK HELPERS ==================

// Simulate node-mocks-http createMocks
function createMocks({ method = 'GET', query = {}, body = {}, headers = {}, cookies = {} } = {}) {
  const req = {
    method,
    query,
    body,
    headers,
    cookies,
  };
  
  const res = {
    statusCode: 200,
    _data: null,
    _headers: {},
    
    status(code) {
      this.statusCode = code;
      return this;
    },
    
    json(data) {
      this._data = JSON.stringify(data);
      return this;
    },
    
    send(data) {
      this._data = data;
      return this;
    },
    
    end(data) {
      this._data = data;
      return this;
    },
    
    setHeader(name, value) {
      this._headers[name] = value;
      return this;
    },
    
    _getStatusCode() {
      return this.statusCode;
    },
    
    _getData() {
      return this._data;
    },
    
    _getJSONData() {
      return JSON.parse(this._data);
    }
  };
  
  return { req, res };
}

// ================== API ROUTE HANDLERS ==================

// 1. Simple User Handler (GET/POST)
async function userHandler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ name: 'John Doe', id: 1 });
  }
  
  if (req.method === 'POST') {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    return res.status(201).json({ id: 2, name });
  }
  
  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(\`Method \${req.method} Not Allowed\`);
}

// 2. Dynamic Route Handler (e.g., /api/posts/[id])
async function postHandler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }
  
  if (req.method === 'GET') {
    // Simulate DB fetch
    if (id === '999') {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    return res.status(200).json({ id, title: \`Post \${id}\` });
  }
  
  if (req.method === 'DELETE') {
    return res.status(200).json({ message: \`Post \${id} deleted\` });
  }
  
  return res.status(405).end();
}

// 3. Authenticated Handler
async function protectedHandler(req, res) {
  const { authorization } = req.headers;
  
  if (!authorization || authorization !== 'Bearer valid-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  return res.status(200).json({ secret: 'Top Secret Data' });
}

// 4. Next.js 13+ Route Handler (App Router)
// Uses standard Request/Response objects
async function GET(request) {
  return new Response(JSON.stringify({ data: 'Hello' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Mock Response class for App Router tests
class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.headers = init.headers || {};
  }
  
  async json() {
    return JSON.parse(this.body);
  }
}

// ================== TESTS ==================

describe('API Route Testing', () => {
  
  // ================== SIMPLE HANDLER TESTS ==================
  
  describe('User Handler', () => {
    test('GET returns user data', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });
      
      await userHandler(req, res);
      
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ name: 'John Doe', id: 1 });
    });
    
    test('POST creates user with valid data', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { name: 'Alice' },
      });
      
      await userHandler(req, res);
      
      expect(res._getStatusCode()).toBe(201);
      expect(res._getJSONData()).toEqual({ id: 2, name: 'Alice' });
    });
    
    test('POST returns 400 if name missing', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {}, // Missing name
      });
      
      await userHandler(req, res);
      
      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({ error: 'Name is required' });
    });
    
    test('PUT returns 405 Method Not Allowed', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
      });
      
      await userHandler(req, res);
      
      expect(res._getStatusCode()).toBe(405);
      expect(res._headers['Allow']).toEqual(['GET', 'POST']);
    });
  });
  
  // ================== DYNAMIC ROUTE TESTS ==================
  
  describe('Post Handler (Dynamic)', () => {
    test('GET returns post by ID', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: '123' },
      });
      
      await postHandler(req, res);
      
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ id: '123', title: 'Post 123' });
    });
    
    test('GET returns 404 for non-existent post', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: '999' },
      });
      
      await postHandler(req, res);
      
      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({ error: 'Post not found' });
    });
    
    test('DELETE removes post', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: '123' },
      });
      
      await postHandler(req, res);
      
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'Post 123 deleted' });
    });
  });
  
  // ================== AUTHENTICATION TESTS ==================
  
  describe('Protected Handler', () => {
    test('returns 401 without header', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });
      
      await protectedHandler(req, res);
      
      expect(res._getStatusCode()).toBe(401);
    });
    
    test('returns 401 with invalid token', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: 'Bearer invalid' },
      });
      
      await protectedHandler(req, res);
      
      expect(res._getStatusCode()).toBe(401);
    });
    
    test('returns 200 with valid token', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' },
      });
      
      await protectedHandler(req, res);
      
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ secret: 'Top Secret Data' });
    });
  });
  
  // ================== APP ROUTER TESTS ==================
  
  describe('App Router Handler', () => {
    test('GET returns standard Response', async () => {
      const request = { url: 'http://localhost/api/test' };
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual({ data: 'Hello' });
    });
  });
  
  // ================== EDGE CASES ==================
  
  describe('Edge Cases', () => {
    test('handles missing query params gracefully', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {}, // Missing ID
      });
      
      await postHandler(req, res);
      
      expect(res._getStatusCode()).toBe(400);
    });
    
    test('handles JSON parsing errors (simulated)', async () => {
      // In real scenario, body-parser handles this
      // Here we just ensure our mock setup works
      const { req, res } = createMocks({
        method: 'POST',
        body: null,
      });
      
      // Our handler expects body to be object, accessing property of null throws
      // But let's check if we can catch it or if handler should check
      try {
        await userHandler(req, res);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });
});

console.log('✅ API Route Testing Complete!');
console.log('🌐 GET, POST, PUT, DELETE methods verified');
console.log('🛡️ Authentication and error handling covered');
console.log('🚀 Ready for Advanced Testing Concepts');
`
};
