// Dynamic Component Scanner for Signal UI
// Scans component files to extract available signals

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

class ComponentScanner {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds cache
  }

  /**
   * Find component file by name in the components folder
   */
  findComponentFile(componentName, workspaceFolders) {
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return null;
    }

    for (const workspaceFolder of workspaceFolders) {
      const componentsPath = path.join(workspaceFolder.uri.fsPath, 'src', 'components');
      const signalsPath = path.join(workspaceFolder.uri.fsPath, 'src', 'components', 'signals');
      
      // Try both components/ and components/signals/ folders
      const possiblePaths = [
        path.join(componentsPath, `${componentName}.jsx`),
        path.join(componentsPath, `${componentName}.js`),
        path.join(componentsPath, `${componentName}.tsx`),
        path.join(componentsPath, `${componentName}.ts`),
        path.join(signalsPath, `${componentName}.jsx`),
        path.join(signalsPath, `${componentName}.js`),
        path.join(signalsPath, `${componentName}.tsx`),
        path.join(signalsPath, `${componentName}.ts`)
      ];

      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          return filePath;
        }
      }
    }

    return null;
  }

  /**
   * Extract signals from a component file
   */
  extractSignalsFromFile(filePath) {
    const cacheKey = `${filePath}_${Date.now()}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const signals = this.parseSignals(content);
      
      // Cache the result
      this.cache.set(cacheKey, signals);
      
      // Clean old cache entries
      this.cleanCache();
      
      return signals;
    } catch (error) {
      console.error(`Error reading component file ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Parse signals from component content
   */
  parseSignals(content) {
    const signals = [];
    
    // Pattern 1: Extract signals from docblock comments
    const docblockPattern = /\/\*\*[\s\S]*?\*\//g;
    const docblocks = content.match(docblockPattern) || [];
    
    docblocks.forEach(docblock => {
      // Look for signal definitions in docblock
      const signalMatches = docblock.match(/@signal\s+(\w+)\s*-\s*(.+)/g);
      if (signalMatches) {
        signalMatches.forEach(match => {
          const [, name, description] = match.match(/@signal\s+(\w+)\s*-\s*(.+)/);
          signals.push({
            name: name.trim(),
            description: description.trim(),
            category: 'documented'
          });
        });
      }
    });

    // Pattern 2: Extract from props destructuring with signal-like names
    const propsPattern = /function\s+\w+\s*\(\s*\{([^}]+)\}\s*\)/g;
    const propsMatches = content.match(propsPattern);
    
    if (propsMatches) {
      propsMatches.forEach(match => {
        const props = match.match(/\{([^}]+)\}/)[1];
        const propList = props.split(',').map(p => p.trim());
        
        propList.forEach(prop => {
          // Look for signal-like prop names
          if (this.isSignalName(prop)) {
            signals.push({
              name: prop,
              description: `Signal: ${prop}`,
              category: 'props'
            });
          }
        });
      });
    }

    // Pattern 3: Extract from inline signal comments
    const commentPattern = /\/\/\s*(\w+)\s*[-:]\s*(.+)/g;
    let commentMatch;
    while ((commentMatch = commentPattern.exec(content)) !== null) {
      const [, name, description] = commentMatch;
      if (this.isSignalName(name)) {
        signals.push({
          name: name.trim(),
          description: description.trim(),
          category: 'commented'
        });
      }
    }

    // Pattern 4: Extract from signal arrays/objects in code
    const signalArrayPattern = /(?:const|let|var)\s+\w*Signals?\s*=\s*\[([\s\S]*?)\]/g;
    const signalObjectPattern = /(?:const|let|var)\s+\w*Signals?\s*=\s*\{([\s\S]*?)\}/g;
    
    [signalArrayPattern, signalObjectPattern].forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const signalContent = match[1];
        this.extractSignalsFromContent(signalContent, signals);
      }
    });

    // Remove duplicates
    const uniqueSignals = [];
    const seen = new Set();
    
    signals.forEach(signal => {
      if (!seen.has(signal.name)) {
        seen.add(signal.name);
        uniqueSignals.push(signal);
      }
    });

    return uniqueSignals;
  }

  /**
   * Extract signals from content string
   */
  extractSignalsFromContent(content, signals) {
    // Match quoted signal names
    const quotedPattern = /['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = quotedPattern.exec(content)) !== null) {
      const name = match[1].trim();
      if (this.isSignalName(name)) {
        signals.push({
          name,
          description: `Signal: ${name}`,
          category: 'defined'
        });
      }
    }
  }

  /**
   * Check if a name looks like a signal
   */
  isSignalName(name) {
    // Remove common non-signal props
    const nonSignals = ['className', 'children', 'style', 'id', 'key', 'ref', 'onClick', 'onSubmit', 'onChange', 'onFocus', 'onBlur'];
    
    if (nonSignals.includes(name)) {
      return false;
    }

    // Signal patterns: camelCase or specific patterns
    const signalPatterns = [
      /^[a-z]+[A-Z][a-zA-Z]*$/, // camelCase (hoverEnlarge, pressShrink)
      /^(primary|secondary|accent|neutral|muted|subtle)$/, // tone signals
      /^(xs|sm|md|lg|xl|2xl|3xl)$/, // size signals
      /^(rounded|pill|square|circle)$/, // shape signals
      /^(loading|disabled|error|success|warning|active|selected)$/, // state signals
      /^(flex|grid|block|inline|inlineBlock|hidden|visible|absolute|relative|fixed|sticky)$/ // layout signals
    ];

    return signalPatterns.some(pattern => pattern.test(name));
  }

  /**
   * Get signals for a specific component
   */
  async getSignalsForComponent(componentName) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const componentFile = this.findComponentFile(componentName, workspaceFolders);
    
    if (!componentFile) {
      return [];
    }

    return this.extractSignalsFromFile(componentFile);
  }

  /**
   * Clean old cache entries
   */
  cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      const timestamp = parseInt(key.split('_').pop());
      if (now - timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear cache manually
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = ComponentScanner;
