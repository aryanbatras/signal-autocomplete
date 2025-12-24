# Signal UI Autocomplete Extension

A VS Code extension that provides intelligent autocomplete for Signal UI components, offering context-aware signal suggestions directly in your JSX/TSX code.

## Philosophy: Signal UI

Signal UI is a source-first, minimalist, framework-agnostic component library built on the principle of **intention over configuration**. Unlike traditional component libraries that rely on variant enums, configuration schemas, and opaque abstractions, Signal UI embraces a radically different approach:

### Core Principles

**1. Ownership Over Abstraction**
- Components are copied into your repository—you own the code completely
- No vendor lock-in, no runtime dependencies, no black boxes
- The file itself is the product; you read, edit, and ship it directly
- No hidden logic or helper functions obscuring behavior

**2. Intention Over Configuration**
- No `variant="primary"` or `size="lg"` enums
- Props are plain English signals: `primary`, `lg`, `hoverEnlarge`
- Signals express what you want, not how it's configured
- Declarative, readable, and immediately understandable

**3. Signals, Not Variants**
- Signals are static, declarative inputs—not reactive systems
- Components read props → output classes/attributes directly
- No combinatorial APIs or variant explosion
- Signals are composable, optional, and memorable

**4. Minimal Foundation, Infinite Extension**
- Each component ships with one semantic foundation and zero forced variations
- Everything else is opt-in and user-editable
- HTML already provides state; we listen and style on top
- Never re-model browser behavior

### Signal Types

**A. Structural Signals (Identity)**
- Define what the component is: `primary`, `secondary`, `sm`, `lg`
- Grouped by category (tone, size, shape)
- Only one per group applies—if multiple passed, last wins
- No warnings, no magic—deterministic and predictable

**B. Behavioral Signals (Interaction Intent)**
- Define how it behaves: `hoverEnlarge`, `pressShrink`, `focusJump`
- Verb-intent naming makes them expressive and memorable
- Optional and composable—use only what you need

**C. JS-Level Signals**
- Map intent to tiny inline JavaScript behavior
- Examples: `submitForm`, `confirmOnClick`
- Implemented inline, explicitly—no helpers or abstractions

## Extension Features

### Intelligent Component Discovery
The extension automatically scans your workspace for Signal UI components in multiple locations:
- `components/ComponentName.jsx`
- `src/components/ComponentName.jsx`
- `components/signals/ComponentName.jsx`
- `src/components/signals/ComponentName.jsx`
- `signals/ComponentName.jsx`

Supports both JavaScript (`.js`, `.jsx`) and TypeScript (`.ts`, `.tsx`) files.

### Context-Aware Autocomplete
- Activates only when typing inside JSX component props
- Detects component names and provides relevant signal suggestions
- Filters suggestions based on current input for rapid discovery
- Supports all JavaScript/TypeScript variants including JSX/TSX

### Signal Classification
The extension categorizes signals to provide intelligent prioritization:

1. **Layer Signals** - Foundation styling layers
2. **Lease Signals** - Contract-based conditional styling
3. **Spread Signals** - Native attribute spreading
4. **Composite Signals** - Complex signal combinations
5. **Standard Signals** - Direct signal usage

### Smart Prioritization
- Common signals (`primary`, `secondary`, `sm`, `md`, `lg`, `hoverEnlarge`) appear first
- Category-based sorting ensures logical organization
- Contextual filtering reduces cognitive load

## How It Works

### Component Scanning Process

1. **File Discovery**: When you trigger autocomplete in a JSX prop, the extension:
   - Extracts the component name from the current JSX tag
   - Scans predefined workspace folders for matching component files
   - Supports multiple file extensions (`.js`, `.jsx`, `.ts`, `.tsx`)

2. **Signal Extraction**: Once a component file is found:
   - Parses the file content to identify all signal usage patterns
   - Categorizes signals by type (layer, lease, spread, composite, standard)
   - Extracts signal descriptions and context from layer definitions

3. **Intelligent Caching**: 
   - 30-second cache prevents redundant file system operations
   - Automatic cache cleanup prevents memory bloat
   - Manual cache clearing available for development

### Signal Pattern Recognition

The extension recognizes several Signal UI patterns:

```javascript
// Layer definitions and usage
const foundation = layer("foundation");
foundation("bg", "primary");
foundation("text", "secondary");

// Lease contracts
lease("hover", "hoverEnlarge");
lease("focus", "focusRing");

// Spread signals
spread("native", "type");
spread("form", "onClick");

// Composite signals
signals.hoverEnlarge && (() => (element.classList.add("hover-scale")))();

// Direct signal usage
signals.primary
signals.secondary
signals.hoverEnlarge