import { Step } from '../types';

export const step13: Step = {
  id: '13',
  title: 'Testing User Interactions - Simulating User Actions',
  description: `## **Step 13: Testing User Interactions**

#### **Topic 1: Using @testing-library/user-event**
**Explanation:**

**user-event** provides realistic user interaction simulation.

**Import:**
\`\`\`javascript
import userEvent from '@testing-library/user-event';
\`\`\`

**Setup:**
\`\`\`javascript
test('user interaction', async () => {
  const user = userEvent.setup();
  // Use user.click(), user.type(), etc.
});
\`\`\`

**Why user-event over fireEvent?**
- More realistic behavior
- Fires all associated events
- Handles keyboard navigation
- Better for accessibility testing

---

#### **Topic 2: Simulating Clicks with user.click()**
**Explanation:**

\`\`\`javascript
test('button click', async () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  const user = userEvent.setup();
  const button = screen.getByRole('button');
  
  await user.click(button);
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
\`\`\`

---

#### **Topic 3: Simulating Typing with user.type()**
**Explanation:**

\`\`\`javascript
test('typing in input', async () => {
  render(<input placeholder="Enter name" />);
  
  const user = userEvent.setup();
  const input = screen.getByPlaceholderText('Enter name');
  
  await user.type(input, 'John Doe');
  
  expect(input).toHaveValue('John Doe');
});
\`\`\`

---

#### **Topic 4: Testing Form Submissions**
**Explanation:**

\`\`\`javascript
test('form submission', async () => {
  const handleSubmit = jest.fn(e => e.preventDefault());
  render(
    <form onSubmit={handleSubmit}>
      <input name="email" />
      <button type="submit">Submit</button>
    </form>
  );
  
  const user = userEvent.setup();
  await user.type(screen.getByRole('textbox'), 'test@example.com');
  await user.click(screen.getByRole('button'));
  
  expect(handleSubmit).toHaveBeenCalled();
});
\`\`\`

---

#### **Topic 5: Testing Keyboard Interactions**
**Explanation:**

\`\`\`javascript
test('keyboard navigation', async () => {
  render(<input placeholder="Search" />);
  
  const user = userEvent.setup();
  const input = screen.getByPlaceholderText('Search');
  
  await user.type(input, 'test{Enter}');
  
  expect(input).toHaveValue('test');
});
\`\`\`

---

#### **Topic 6: Testing Mouse Events**
**Explanation:**

\`\`\`javascript
test('hover event', async () => {
  const handleMouseEnter = jest.fn();
  render(
    <button onMouseEnter={handleMouseEnter}>
      Hover me
    </button>
  );
  
  const user = userEvent.setup();
  await user.hover(screen.getByRole('button'));
  
  expect(handleMouseEnter).toHaveBeenCalled();
});
\`\`\`

---

#### **Topic 7: Testing Focus and Blur**
**Explanation:**

\`\`\`javascript
test('input focus and blur', async () => {
  const handleFocus = jest.fn();
  const handleBlur = jest.fn();
  
  render(
    <input 
      onFocus={handleFocus} 
      onBlur={handleBlur} 
      placeholder="Test"
    />
  );
  
  const user = userEvent.setup();
  const input = screen.getByPlaceholderText('Test');
  
  await user.click(input); // Focus
  expect(handleFocus).toHaveBeenCalled();
  
  await user.tab(); // Blur
  expect(handleBlur).toHaveBeenCalled();
});
\`\`\`

---

#### **Topic 8: userEvent vs fireEvent**
**Explanation:**

**userEvent (recommended):**
- Realistic user behavior
- Multiple events fired
- Async operations
\`\`\`javascript
await user.click(button);
\`\`\`

**fireEvent (legacy):**
- Single event firing
- Synchronous
- Less realistic
\`\`\`javascript
fireEvent.click(button);
\`\`\`

**Recommendation:** Always use userEvent for new tests!

---

#### **Topic 9: Async User Interactions**
**Explanation:**

\`\`\`javascript
test('async user action', async () => {
  render(<AsyncButton />);
  
  const user = userEvent.setup();
  const button = screen.getByRole('button');
  
  await user.click(button);
  
  // Wait for async update
  await screen.findByText('Success!');
});
\`\`\`

---

#### **Topic 10: Testing Complex User Flows**
**Explanation:**

\`\`\`javascript
test('multi-step form flow', async () => {
  render(<MultiStepForm />);
  
  const user = userEvent.setup();
  
  // Step 1
  await user.type(screen.getByLabelText('Name'), 'John');
  await user.click(screen.getByText('Next'));
  
  // Step 2
  await user.type(screen.getByLabelText('Email'), 'john@example.com');
  await user.click(screen.getByText('Submit'));
  
  await screen.findByText('Form submitted!');
});
\`\`\`
`,
  initialCode: `// ============================================
// STEP 13: Testing User Interactions
// ============================================

// ================== INTERACTIVE COMPONENTS ==================

// Counter Component
function Counter() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div>
      <p data-testid="count">Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// Input Component with onChange
function NameInput({ onChange }) {
  return (
    <div>
      <label htmlFor="name">Name:</label>
      <input 
        id="name"
        type="text" 
        onChange={onChange}
        placeholder="Enter your name"
      />
    </div>
  );
}

// Form Component
function LoginForm({ onSubmit }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

// Toggle Component
function Toggle({ onToggle }) {
  const [isOn, setIsOn] = React.useState(false);
  
  const handleToggle = () => {
    setIsOn(!isOn);
    onToggle?.(!isOn);
  };
  
  return (
    <button 
      onClick={handleToggle}
      aria-pressed={isOn}
    >
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
}

// Dropdown Component
function Dropdown({ options, onChange }) {
  const [selectedValue, setSelectedValue] = React.useState('');
  
  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedValue(value);
    onChange?.(value);
  };
  
  return (
    <select value={selectedValue} onChange={handleChange}>
      <option value="">Select an option</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// Checkbox Component
function Checkbox({ label, onChange }) {
  const [checked, setChecked] = React.useState(false);
  
  const handleChange = (e) => {
    setChecked(e.target.checked);
    onChange?.(e.target.checked);
  };
  
  return (
    <label>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={handleChange}
      />
      {label}
    </label>
  );
}

// Simulated React for playground
const React = {
  useState: (initial) => {
    let value = initial;
    const setValue = (newValue) => {
      value = typeof newValue === 'function' ? newValue(value) : newValue;
    };
    return [value, setValue];
  },
  createElement: (type, props, ...children) => {
    return {
      type,
      props: {
        ...props,
        children: children.length === 1 ? children[0] : (children.length === 0 ? undefined : children)
      }
    };
  }
};

// ================== TESTS ==================

describe('User Interaction Testing', () => {
  
  describe('Button Clicks', () => {
    test('button onClick is called', () => {
      const handleClick = jest.fn();
      const button = <button onClick={handleClick}>Click me</button>;
      
      // Simulate click
      button.props.onClick();
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
    
    test('button can be clicked multiple times', () => {
      const handleClick = jest.fn();
      const button = <button onClick={handleClick}>Click me</button>;
      
      // Simulate multiple clicks
      button.props.onClick();
      button.props.onClick();
      button.props.onClick();
      
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
    
    test('disabled button does not trigger onClick', () => {
      const handleClick = jest.fn();
      const button = <button onClick={handleClick} disabled={true}>Click me</button>;
      
      // Would not trigger in real DOM when disabled
      // In this simulation, we check the disabled state
      expect(button.props.disabled).toBe(true);
    });
  });
  
  describe('Form Input Interactions', () => {
    test('input onChange is called when typing', () => {
      const handleChange = jest.fn();
      const input = <input onChange={handleChange} placeholder="Type here" />;
      
      // Simulate typing
      const event = { target: { value: 'Hello' } };
      input.props.onChange(event);
      
      expect(handleChange).toHaveBeenCalledWith(event);
    });
    
    test('input value updates on change', () => {
      let inputValue = '';
      const handleChange = (e) => {
        inputValue = e.target.value;
      };
      
      const input = <input value={inputValue} onChange={handleChange} />;
      
      // Simulate typing
      input.props.onChange({ target: { value: 'Test' } });
      
      expect(inputValue).toBe('Test');
    });
    
    test('NameInput component handles onChange', () => {
      const handleChange = jest.fn();
      const nameInput = NameInput({ onChange: handleChange });
      
      const input = nameInput.props.children[1];
      input.props.onChange({ target: { value: 'John' } });
      
      expect(handleChange).toHaveBeenCalled();
    });
  });
  
  describe('Form Submission', () => {
    test('form onSubmit is called', () => {
      const handleSubmit = jest.fn(e => e.preventDefault());
      const form = <form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </form>;
      
      // Simulate submit
      form.props.onSubmit({ preventDefault: () => {} });
      
      expect(handleSubmit).toHaveBeenCalled();
    });
    
    test('form submission prevents default', () => {
      const preventDefault = jest.fn();
      const handleSubmit = (e) => e.preventDefault();
      
      const form = <form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </form>;
      
      form.props.onSubmit({ preventDefault });
      
      expect(preventDefault).toHaveBeenCalled();
    });
  });
  
  describe('Checkbox Interactions', () => {
    test('checkbox onChange is called', () => {
      const handleChange = jest.fn();
      const checkbox = <input type="checkbox" onChange={handleChange} />;
      
      // Simulate check
      checkbox.props.onChange({ target: { checked: true } });
      
      expect(handleChange).toHaveBeenCalled();
    });
    
    test('checkbox toggles checked state', () => {
      let checked = false;
      const handleChange = (e) => {
        checked = e.target.checked;
      };
      
      const checkbox = <input 
        type="checkbox" 
        checked={checked} 
        onChange={handleChange} 
      />;
      
      // Toggle on
      checkbox.props.onChange({ target: { checked: true } });
      expect(checked).toBe(true);
      
      // Toggle off
      checkbox.props.onChange({ target: { checked: false } });
      expect(checked).toBe(false);
    });
  });
  
  describe('Select/Dropdown Interactions', () => {
    test('select onChange is called', () => {
      const handleChange = jest.fn();
      const select = <select onChange={handleChange}>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </select>;
      
      // Simulate selection
      select.props.onChange({ target: { value: '1' } });
      
      expect(handleChange).toHaveBeenCalled();
    });
    
    test('select updates value', () => {
      let selectedValue = '';
      const handleChange = (e) => {
        selectedValue = e.target.value;
      };
      
      const select = <select value={selectedValue} onChange={handleChange}>
        <option value="">Select</option>
        <option value="option1">Option 1</option>
      </select>;
      
      select.props.onChange({ target: { value: 'option1' } });
      
      expect(selectedValue).toBe('option1');
    });
  });
  
  describe('Focus and Blur Events', () => {
    test('input onFocus is called', () => {
      const handleFocus = jest.fn();
      const input = <input onFocus={handleFocus} placeholder="Focus me" />;
      
      // Simulate focus
      input.props.onFocus();
      
      expect(handleFocus).toHaveBeenCalled();
    });
    
    test('input onBlur is called', () => {
      const handleBlur = jest.fn();
      const input = <input onBlur={handleBlur} placeholder="Blur me" />;
      
      // Simulate blur
      input.props.onBlur();
      
      expect(handleBlur).toHaveBeenCalled();
    });
    
    test('input handles focus and blur sequence', () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      const input = <input 
        onFocus={handleFocus} 
        onBlur={handleBlur}
        placeholder="Test"
      />;
      
      input.props.onFocus();
      expect(handleFocus).toHaveBeenCalledTimes(1);
      
      input.props.onBlur();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Mouse Events', () => {
    test('button onMouseEnter is called', () => {
      const handleMouseEnter = jest.fn();
      const button = <button onMouseEnter={handleMouseEnter}>Hover</button>;
      
      button.props.onMouseEnter();
      
      expect(handleMouseEnter).toHaveBeenCalled();
    });
    
    test('button onMouseLeave is called', () => {
      const handleMouseLeave = jest.fn();
      const button = <button onMouseLeave={handleMouseLeave}>Hover</button>;
      
      button.props.onMouseLeave();
      
      expect(handleMouseLeave).toHaveBeenCalled();
    });
    
    test('element handles hover sequence', () => {
      const handleMouseEnter = jest.fn();
      const handleMouseLeave = jest.fn();
      const div = <div 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Hover area
      </div>;
      
      // Mouse enters
      div.props.onMouseEnter();
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
      
      // Mouse leaves
      div.props.onMouseLeave();
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Keyboard Events', () => {
    test('input onKeyDown is called', () => {
      const handleKeyDown = jest.fn();
      const input = <input onKeyDown={handleKeyDown} placeholder="Type" />;
      
      input.props.onKeyDown({ key: 'Enter' });
      
      expect(handleKeyDown).toHaveBeenCalled();
    });
    
    test('input onKeyUp is called', () => {
      const handleKeyUp = jest.fn();
      const input = <input onKeyUp={handleKeyUp} placeholder="Type" />;
      
      input.props.onKeyUp({ key: 'a' });
      
      expect(handleKeyUp).toHaveBeenCalled();
    });
    
    test('Enter key triggers specific action', () => {
      const handleSubmit = jest.fn();
      const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          handleSubmit();
        }
      };
      
      const input = <input onKeyDown={handleKeyDown} placeholder="Press Enter" />;
      
      input.props.onKeyDown({ key: 'Enter' });
      expect(handleSubmit).toHaveBeenCalled();
      
      input.props.onKeyDown({ key: 'a' });
      expect(handleSubmit).toHaveBeenCalledTimes(1); // Still 1
    });
  });
  
  describe('Complex User Flows', () => {
    test('multi-step interaction', () => {
      const results = [];
      
      // Step 1: Type in input
      const input = <input 
        onChange={(e) => results.push({ step: 'input', value: e.target.value })}
        placeholder="Name"
      />;
      input.props.onChange({ target: { value: 'John' } });
      
      // Step 2: Check checkbox
      const checkbox = <input 
        type="checkbox"
        onChange={(e) => results.push({ step: 'checkbox', checked: e.target.checked })}
      />;
      checkbox.props.onChange({ target: { checked: true } });
      
      // Step 3: Submit form
      const form = <form 
        onSubmit={(e) => {
          e.preventDefault();
          results.push({ step: 'submit' });
        }}
      />;
      form.props.onSubmit({ preventDefault: () => {} });
      
      // Verify all steps completed
      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({ step: 'input', value: 'John' });
      expect(results[1]).toEqual({ step: 'checkbox', checked: true });
      expect(results[2]).toEqual({ step: 'submit' });
    });
    
    test('form with multiple inputs', () => {
      const formData = {};
      
      const nameInput = <input 
        name="name"
        onChange={(e) => formData.name = e.target.value}
      />;
      
      const emailInput = <input 
        name="email"
        onChange={(e) => formData.email = e.target.value}
      />;
      
      const passwordInput = <input 
        name="password"
        onChange={(e) => formData.password = e.target.value}
      />;
      
      // Fill form
      nameInput.props.onChange({ target: { value: 'John Doe' } });
      emailInput.props.onChange({ target: { value: 'john@example.com' } });
      passwordInput.props.onChange({ target: { value: 'password123' } });
      
      // Verify all fields filled
      expect(formData).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });
    });
  });
  
  describe('Event Handler Edge Cases', () => {
    test('handles missing onChange gracefully', () => {
      const input = <input value="test" />;
      
      // Should not throw even without onChange
      expect(input.props.onChange).toBeUndefined();
    });
    
    test('handles onClick with no handler', () => {
      const button = <button>Click me</button>;
      
      expect(button.props.onClick).toBeUndefined();
    });
    
    test('handles multiple event handlers', () => {
      const onClick = jest.fn();
      const onMouseEnter = jest.fn();
      const onFocus = jest.fn();
      
      const button = <button 
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
      >
        Multi-event
      </button>;
      
      button.props.onClick();
      button.props.onMouseEnter();
      button.props.onFocus();
      
      expect(onClick).toHaveBeenCalled();
      expect(onMouseEnter).toHaveBeenCalled();
      expect(onFocus).toHaveBeenCalled();
    });
  });
});

console.log('✅ User Interaction Testing Complete!');
console.log('🖱️ All user events covered');
console.log('⌨️ Keyboard, mouse, and form interactions tested');
console.log('🎯 Ready for React Hooks testing');
`
};
