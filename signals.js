// Signal UI Component Signals Database
// Based on Signal UI philosophy: intention over configuration

const SIGNALS = {
  // Structural Signals (Tone)
  tone: [
    { name: 'primary', description: 'Primary visual tone' },
    { name: 'secondary', description: 'Secondary visual tone' },
    { name: 'accent', description: 'Accent visual tone' },
    { name: 'neutral', description: 'Neutral visual tone' },
    { name: 'muted', description: 'Muted visual tone' },
    { name: 'subtle', description: 'Subtle visual tone' }
  ],

  // Size Signals
  size: [
    { name: 'xs', description: 'Extra small size' },
    { name: 'sm', description: 'Small size' },
    { name: 'md', description: 'Medium size' },
    { name: 'lg', description: 'Large size' },
    { name: 'xl', description: 'Extra large size' },
    { name: '2xl', description: '2x large size' },
    { name: '3xl', description: '3x large size' }
  ],

  // Shape Signals
  shape: [
    { name: 'rounded', description: 'Rounded corners' },
    { name: 'pill', description: 'Pill shape (fully rounded)' },
    { name: 'square', description: 'Square corners' },
    { name: 'circle', description: 'Circular shape' }
  ],

  // Behavioral Signals (Interaction Intent)
  behavior: [
    { name: 'hoverEnlarge', description: 'Enlarge on hover' },
    { name: 'hoverShrink', description: 'Shrink on hover' },
    { name: 'hoverFade', description: 'Fade on hover' },
    { name: 'pressShrink', description: 'Shrink when pressed' },
    { name: 'pressEnlarge', description: 'Enlarge when pressed' },
    { name: 'focusJump', description: 'Jump effect on focus' },
    { name: 'focusGlow', description: 'Glow effect on focus' },
    { name: 'slideUp', description: 'Slide up animation' },
    { name: 'slideDown', description: 'Slide down animation' },
    { name: 'slideLeft', description: 'Slide left animation' },
    { name: 'slideRight', description: 'Slide right animation' },
    { name: 'fadeIn', description: 'Fade in animation' },
    { name: 'fadeOut', description: 'Fade out animation' },
    { name: 'pulse', description: 'Pulse animation' },
    { name: 'bounce', description: 'Bounce animation' },
    { name: 'spin', description: 'Spin animation' }
  ],

  // State Signals
  state: [
    { name: 'loading', description: 'Loading state' },
    { name: 'disabled', description: 'Disabled state' },
    { name: 'error', description: 'Error state' },
    { name: 'success', description: 'Success state' },
    { name: 'warning', description: 'Warning state' },
    { name: 'active', description: 'Active state' },
    { name: 'selected', description: 'Selected state' }
  ],

  // Layout Signals
  layout: [
    { name: 'flex', description: 'Flex layout' },
    { name: 'grid', description: 'Grid layout' },
    { name: 'block', description: 'Block layout' },
    { name: 'inline', description: 'Inline layout' },
    { name: 'inlineBlock', description: 'Inline block layout' },
    { name: 'hidden', description: 'Hidden element' },
    { name: 'visible', description: 'Visible element' },
    { name: 'absolute', description: 'Absolute positioning' },
    { name: 'relative', description: 'Relative positioning' },
    { name: 'fixed', description: 'Fixed positioning' },
    { name: 'sticky', description: 'Sticky positioning' }
  ],

  // JS-level Signals
  jsSignals: [
    { name: 'submitForm', description: 'Submit form behavior' },
    { name: 'confirmOnClick', description: 'Show confirmation dialog on click' },
    { name: 'toggle', description: 'Toggle behavior' },
    { name: 'expand', description: 'Expand/collapse behavior' },
    { name: 'modal', description: 'Modal behavior' },
    { name: 'dropdown', description: 'Dropdown behavior' },
    { name: 'tooltip', description: 'Tooltip behavior' }
  ]
};

// Get all signals as flat array for autocomplete
function getAllSignals() {
  const allSignals = [];
  Object.values(SIGNALS).forEach(category => {
    category.forEach(signal => {
      allSignals.push({
        ...signal,
        category: Object.keys(SIGNALS).find(key => SIGNALS[key] === category)
      });
    });
  });
  return allSignals;
}

// Component patterns to detect
const COMPONENT_PATTERNS = [
  // JSX opening tags with props
  /<([A-Z][a-zA-Z0-9]*)[^>]*\s+[a-zA-Z][a-zA-Z0-9]*\s*=\s*["'][^"']*$/,
  // Inside JSX props
  /\s+[a-zA-Z][a-zA-Z0-9]*\s*=\s*["'][^"']*$/,
  // After prop name equals
  /([a-zA-Z][a-zA-Z0-9]*)\s*=\s*["'][^"']*$/,
];

module.exports = {
  SIGNALS,
  getAllSignals,
  COMPONENT_PATTERNS
};
