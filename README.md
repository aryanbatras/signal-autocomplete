# Signal UI VS Code Extension

A VS Code extension that provides intelligent autocomplete for Signal UI components, offering context-aware signal suggestions directly in your JSX/TSX code.

## What It Does

This extension helps you write Signal UI components faster by providing smart autocomplete for signal props. When you type inside a Signal UI component, it suggests available signals like `primary`, `lg`, `hoverEnlarge`, etc.

## Quick Start

### 1. Install the Extension
Search for "Signal UI" in the VS Code Marketplace and install it.

### 2. Copy All Components
```bash
npx signal-layers copy
```
This copies all Signal UI components to `src/components/signals/` in your project.

### 3. Install Dependencies
```bash
npm install react@>=16.8.0 react-dom@>=16.8.0 tailwindcss@v4
```

### 4. Configure Tailwind CSS (Optional)
If you want to edit components and get autocompletion, add this to your VS Code settings:

```json
{
  "tailwindCSS.experimental.classRegex": [
    ["\\b\\w+\\s*\\(\\s*[\"'`]([^\"'`]*)[\"'`]"]
  ]
}
```

## How It Works

The extension automatically scans your workspace for Signal UI components and provides intelligent signal suggestions when you're typing JSX props.

**Supported locations:**
- `components/ComponentName.jsx`
- `src/components/ComponentName.jsx` 
- `components/signals/ComponentName.jsx`
- `src/components/signals/ComponentName.jsx`
- `signals/ComponentName.jsx`

**Supported file types:** `.js`, `.jsx`, `.ts`, `.tsx`

## Signal Types

- **Structural Signals** - Define what the component is: `primary`, `secondary`, `sm`, `lg`
- **Behavioral Signals** - Define how it behaves: `hoverEnlarge`, `pressShrink`, `focusJump`
- **JS Signals** - Add JavaScript behavior: `submitForm`, `confirmOnClick`

## Example Usage

```jsx
import { Button } from './components/signals/Button.jsx';

// Basic usage
<Button onClick={() => console.log('clicked')}>Click me</Button>

// With signals
<Button primary lg hoverEnlarge>Primary Action</Button>

// Multiple signals
<Button ghost red sm hoverLift>Ghost Button</Button>
```

## Philosophy

Signal UI is built on **intention over configuration**:
- No `variant="primary"` - just use `primary`
- No `size="lg"` - just use `lg`
- Copy components into your project - you own the code
- No vendor lock-in or hidden abstractions

## Links

- **GitHub**: https://github.com/aryanbatras/minimalist-ui
- **Issues**: https://github.com/aryanbatras/minimalist-ui/issues



