import { Step } from '../types';

export const step12: Step = {
  id: '12',
  title: 'Testing React Components - Rendering and Querying',
  description: `## **Step 12: Testing React Components (Client Components)**

#### **Topic 1: Rendering Components with render()**
**Explanation:**

**Basic render:**
\`\`\`javascript
import { render } from '@testing-library/react';

test('renders component', () => {
  const { container } = render(<Button>Click me</Button>);
  expect(container).toBeInTheDocument();
});
\`\`\`

**What render() does:**
- Creates a virtual DOM
- Returns query utilities
- Provides container reference
- Cleans up after test

---

#### **Topic 2: Querying Elements (.getBy*, .queryBy*, .findBy*)**
**Explanation:**

**Three query types:**

**getBy*** - Throws error if not found (synchronous)
\`\`\`javascript
const button = screen.getByRole('button');
const heading = screen.getByText('Hello');
\`\`\`

**queryBy*** - Returns null if not found (synchronous)
\`\`\`javascript
const button = screen.queryByRole('button'); // null if not found
expect(button).not.toBeInTheDocument();
\`\`\`

**findBy*** - Returns promise (asynchronous)
\`\`\`javascript
const button = await screen.findByRole('button'); // Waits for element
\`\`\`

**When to use:**
- \`getBy*\` - Element should exist
- \`queryBy*\` - Testing absence
- \`findBy*\` - Element appears asynchronously

---

#### **Topic 3: Query Priorities (Accessible Queries First)**
**Explanation:**

**Priority order (best to worst):**

1. **getByRole** - Most accessible
\`\`\`javascript
screen.getByRole('button', { name: 'Submit' });
screen.getByRole('heading', { level: 1 });
\`\`\`

2. **getByLabelText** - For form fields
\`\`\`javascript
screen.getByLabelText('Email');
\`\`\`

3. **getByPlaceholderText** - For inputs
\`\`\`javascript
screen.getByPlaceholderText('Enter email');
\`\`\`

4. **getByText** - For non-interactive elements
\`\`\`javascript
screen.getByText('Welcome');
\`\`\`

5. **getByTestId** - Last resort
\`\`\`javascript
screen.getByTestId('custom-element');
\`\`\`

---

#### **Topic 4: Testing Component Rendering**
**Explanation:**

\`\`\`javascript
test('component renders correctly', () => {
  render(<Button>Click me</Button>);
  
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveTextContent('Click me');
});
\`\`\`

---

#### **Topic 5: Testing Props**
**Explanation:**

\`\`\`javascript
test('component accepts and uses props', () => {
  render(<Button variant="primary" size="large">Submit</Button>);
  
  const button = screen.getByRole('button');
  expect(button).toHaveClass('btn-primary');
  expect(button).toHaveClass('btn-large');
});
\`\`\`

---

#### **Topic 6: Testing Conditional Rendering**
**Explanation:**

\`\`\`javascript
test('shows content when condition is true', () => {
  render(<Alert show={true} message="Error occurred" />);
  expect(screen.getByText('Error occurred')).toBeInTheDocument();
});

test('hides content when condition is false', () => {
  render(<Alert show={false} message="Error occurred" />);
  expect(screen.queryByText('Error occurred')).not.toBeInTheDocument();
});
\`\`\`

---

#### **Topic 7: Testing Lists and Iterations**
**Explanation:**

\`\`\`javascript
test('renders list of items', () => {
  const items = ['Item 1', 'Item 2', 'Item 3'];
  render(<List items={items} />);
  
  items.forEach(item => {
    expect(screen.getByText(item)).toBeInTheDocument();
  });
});
\`\`\`

---

#### **Topic 8: screen Object Usage**
**Explanation:**

**screen** provides all queries without destructuring:

\`\`\`javascript
// Instead of:
const { getByRole, getByText } = render(<Component />);

// Use screen:
render(<Component />);
const button = screen.getByRole('button');
const text = screen.getByText('Hello');
\`\`\`

---

#### **Topic 9: within() for Scoped Queries**
**Explanation:**

\`\`\`javascript
import { within } from '@testing-library/react';

test('queries within specific container', () => {
  render(<Form />);
  
  const form = screen.getByRole('form');
  const submitButton = within(form).getByRole('button', { name: 'Submit' });
  
  expect(submitButton).toBeInTheDocument();
});
\`\`\`

---

#### **Topic 10: Testing Component Composition**
**Explanation:**

\`\`\`javascript
test('parent component renders children', () => {
  render(
    <Card>
      <CardHeader>Title</CardHeader>
      <CardBody>Content</CardBody>
    </Card>
  );
  
  expect(screen.getByText('Title')).toBeInTheDocument();
  expect(screen.getByText('Content')).toBeInTheDocument();
});
\`\`\`

---

#### **Topic 11: Snapshot Testing with .toMatchSnapshot()**
**Explanation:**

\`\`\`javascript
test('component matches snapshot', () => {
  const { container } = render(<Button>Click me</Button>);
  expect(container.firstChild).toMatchSnapshot();
});
\`\`\`

**Snapshot saved to __snapshots__/ directory**

---

#### **Topic 12: When to Use Snapshots vs Regular Assertions**
**Explanation:**

**Use snapshots for:**
- Complex rendered output
- UI regression testing
- Component structure validation

**Use regular assertions for:**
- Specific behavior testing
- Dynamic content
- User interactions
- Business logic

**Best practice:** Combine both!
`,
  initialCode: `// ============================================
// STEP 12: Testing React Components
// ============================================

// ================== COMPONENTS ==================

// Button Component
function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false 
}) {
  return (
    <button
      className={\`btn btn-\${variant} btn-\${size}\`}
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
    >
      {children}
    </button>
  );
}

// Alert Component with conditional rendering
function Alert({ show, message, type = 'info' }) {
  if (!show) return null;
  
  return (
    <div className={\`alert alert-\${type}\`} role="alert">
      {message}
    </div>
  );
}

// List Component
function List({ items, onItemClick }) {
  return (
    <ul data-testid="list">
      {items.map((item, index) => (
        <li key={index} onClick={() => onItemClick?.(item)}>
          {item}
        </li>
      ))}
    </ul>
  );
}

// Card Component with composition
function Card({ children, title }) {
  return (
    <div className="card" data-testid="card">
      {title && <h2 className="card-title">{title}</h2>}
      <div className="card-content">{children}</div>
    </div>
  );
}

function CardHeader({ children }) {
  return <div className="card-header">{children}</div>;
}

function CardBody({ children }) {
  return <div className="card-body">{children}</div>;
}

// User Profile Component
function UserProfile({ user, showEmail = true }) {
  return (
    <div className="user-profile" data-testid="user-profile">
      <h3>{user.name}</h3>
      {showEmail && <p>{user.email}</p>}
      {user.role === 'admin' && <span className="badge">Admin</span>}
    </div>
  );
}

// Product List Component
function ProductList({ products }) {
  if (products.length === 0) {
    return <p>No products found</p>;
  }
  
  return (
    <div className="product-list">
      {products.map(product => (
        <div key={product.id} className="product-item">
          <h4>{product.name}</h4>
          <p className="price">\${product.price}</p>
        </div>
      ))}
    </div>
  );
}

// ================== TESTS ==================

describe('React Component Testing', () => {
  
  // ================== BASIC RENDERING ==================
  
  describe('Component Rendering', () => {
    test('renders button component', () => {
      const button = Button({ children: 'Click me' });
      
      expect(button.type).toBe('button');
      expect(button.props.children).toBe('Click me');
    });
    
    test('renders with default props', () => {
      const button = Button({ children: 'Test' });
      
      expect(button.props.className).toContain('btn-primary');
      expect(button.props.className).toContain('btn-medium');
    });
    
    test('button has correct data-testid', () => {
      const button = Button({ children: 'Test' });
      expect(button.props['data-testid']).toBe('button');
    });
  });
  
  // ================== TESTING PROPS ==================
  
  describe('Props Testing', () => {
    test('button accepts variant prop', () => {
      const primaryBtn = Button({ children: 'Primary', variant: 'primary' });
      expect(primaryBtn.props.className).toContain('btn-primary');
      
      const secondaryBtn = Button({ children: 'Secondary', variant: 'secondary' });
      expect(secondaryBtn.props.className).toContain('btn-secondary');
      
      const dangerBtn = Button({ children: 'Danger', variant: 'danger' });
      expect(dangerBtn.props.className).toContain('btn-danger');
    });
    
    test('button accepts size prop', () => {
      const smallBtn = Button({ children: 'Small', size: 'small' });
      expect(smallBtn.props.className).toContain('btn-small');
      
      const largeBtn = Button({ children: 'Large', size: 'large' });
      expect(largeBtn.props.className).toContain('btn-large');
    });
    
    test('button accepts disabled prop', () => {
      const button = Button({ children: 'Disabled', disabled: true });
      expect(button.props.disabled).toBe(true);
    });
    
    test('button accepts onClick handler', () => {
      const handleClick = jest.fn();
      const button = Button({ children: 'Click', onClick: handleClick });
      
      expect(button.props.onClick).toBe(handleClick);
    });
  });
  
  // ================== CONDITIONAL RENDERING ==================
  
  describe('Conditional Rendering', () => {
    test('Alert shows when show is true', () => {
      const alert = Alert({ show: true, message: 'Success!', type: 'success' });
      
      expect(alert).not.toBeNull();
      expect(alert.props.children).toBe('Success!');
      expect(alert.props.className).toContain('alert-success');
    });
    
    test('Alert hides when show is false', () => {
      const alert = Alert({ show: false, message: 'Error!' });
      
      expect(alert).toBeNull();
    });
    
    test('UserProfile shows email when showEmail is true', () => {
      const user = { name: 'John Doe', email: 'john@example.com' };
      const profile = UserProfile({ user, showEmail: true });
      
      const children = profile.props.children;
      const hasEmail = Array.isArray(children) && 
        children.some(child => child && child.props?.children === user.email);
      
      expect(hasEmail).toBe(true);
    });
    
    test('UserProfile hides email when showEmail is false', () => {
      const user = { name: 'John Doe', email: 'john@example.com' };
      const profile = UserProfile({ user, showEmail: false });
      
      const children = profile.props.children;
      const hasEmail = Array.isArray(children) && 
        children.some(child => child && child.props?.children === user.email);
      
      expect(hasEmail).toBe(false);
    });
    
    test('UserProfile shows admin badge for admin users', () => {
      const adminUser = { name: 'Admin', email: 'admin@example.com', role: 'admin' };
      const profile = UserProfile({ user: adminUser });
      
      const children = profile.props.children;
      const hasBadge = Array.isArray(children) && 
        children.some(child => child && child.props?.className === 'badge');
      
      expect(hasBadge).toBe(true);
    });
    
    test('UserProfile does not show admin badge for regular users', () => {
      const regularUser = { name: 'User', email: 'user@example.com', role: 'user' };
      const profile = UserProfile({ user: regularUser });
      
      const children = profile.props.children;
      const hasBadge = Array.isArray(children) && 
        children.some(child => child && child.props?.className === 'badge');
      
      expect(hasBadge).toBe(false);
    });
  });
  
  // ================== LISTS AND ITERATIONS ==================
  
  describe('Lists and Iterations', () => {
    test('List renders all items', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      const list = List({ items });
      
      const listItems = list.props.children;
      expect(listItems).toHaveLength(3);
    });
    
    test('List renders empty when no items', () => {
      const list = List({ items: [] });
      const listItems = list.props.children;
      
      expect(listItems).toHaveLength(0);
    });
    
    test('List items have onClick handlers', () => {
      const handleClick = jest.fn();
      const items = ['Item 1', 'Item 2'];
      const list = List({ items, onItemClick: handleClick });
      
      const firstItem = list.props.children[0];
      expect(firstItem.props.onClick).toBeDefined();
    });
    
    test('ProductList shows products', () => {
      const products = [
        { id: 1, name: 'Product 1', price: 10 },
        { id: 2, name: 'Product 2', price: 20 },
      ];
      
      const productList = ProductList({ products });
      const items = productList.props.children;
      
      expect(items).toHaveLength(2);
    });
    
    test('ProductList shows "No products" message when empty', () => {
      const productList = ProductList({ products: [] });
      
      expect(productList.type).toBe('p');
      expect(productList.props.children).toBe('No products found');
    });
    
    test('Product items display name and price', () => {
      const products = [
        { id: 1, name: 'Laptop', price: 999 },
      ];
      
      const productList = ProductList({ products });
      const productItem = productList.props.children[0];
      const [nameElement, priceElement] = productItem.props.children;
      
      expect(nameElement.props.children).toBe('Laptop');
      // In the simulated environment, \`\${product.price}\` becomes ['$ ', 999]
      expect(priceElement.props.children).toContain(999);
    });
  });
  
  // ================== COMPONENT COMPOSITION ==================
  
  describe('Component Composition', () => {
    test('Card renders with title', () => {
      const card = Card({ title: 'Card Title', children: 'Content' });
      
      expect(card.props['data-testid']).toBe('card');
      
      const children = card.props.children;
      const hasTitle = Array.isArray(children) && 
        children.some(child => child && child.props?.className === 'card-title');
      
      expect(hasTitle).toBe(true);
    });
    
    test('Card renders without title when not provided', () => {
      const card = Card({ children: 'Content' });
      
      const children = card.props.children;
      const hasTitle = Array.isArray(children) && 
        children.some(child => child && child.props?.className === 'card-title');
      
      expect(hasTitle).toBe(false);
    });
    
    test('Card renders children', () => {
      const card = Card({ 
        title: 'Test', 
        children: 'Test content' 
      });
      
      const cardContent = Array.isArray(card.props.children) 
        ? card.props.children.find(c => c.props?.className === 'card-content')
        : card.props.children;
      
      expect(cardContent).toBeDefined();
    });
  });
  
  // ================== SNAPSHOT TESTING ==================
  
  describe('Snapshot Testing', () => {
    test('Button component matches snapshot', () => {
      const button = Button({ children: 'Click me', variant: 'primary' });
      expect(button).toMatchSnapshot();
    });
    
    test('Alert component matches snapshot', () => {
      const alert = Alert({ show: true, message: 'Test message', type: 'info' });
      expect(alert).toMatchSnapshot();
    });
    
    test('Card with composition matches snapshot', () => {
      const card = Card({
        title: 'Test Card',
        children: 'Card content'
      });
      expect(card).toMatchSnapshot();
    });
  });
  
  // ================== EDGE CASES ==================
  
  describe('Edge Cases', () => {
    test('handles null children', () => {
      const button = Button({ children: null });
      expect(button.props.children).toBeNull();
    });
    
    test('handles undefined props', () => {
      const button = Button({ children: 'Test', variant: undefined });
      expect(button.props.className).toContain('btn-primary'); // Default
    });
    
    test('handles empty string children', () => {
      const button = Button({ children: '' });
      expect(button.props.children).toBe('');
    });
    
    test('List handles empty array', () => {
      const list = List({ items: [] });
      expect(list.props.children).toHaveLength(0);
    });
    
    test('ProductList handles empty products', () => {
      const productList = ProductList({ products: [] });
      expect(productList.props.children).toBe('No products found');
    });
  });
});

console.log('✅ React Component Testing Complete!');
console.log('📦 All rendering patterns covered');
console.log('🎯 Ready for user interaction testing');
`
};
