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
      // Check both root components/ and src/components/ folders
      const possiblePaths = [
        path.join(workspaceFolder.uri.fsPath, 'components', `${componentName}.jsx`),
        path.join(workspaceFolder.uri.fsPath, 'components', `${componentName}.js`),
        path.join(workspaceFolder.uri.fsPath, 'components', `${componentName}.tsx`),
        path.join(workspaceFolder.uri.fsPath, 'components', `${componentName}.ts`),
        path.join(workspaceFolder.uri.fsPath, 'src', 'components', `${componentName}.jsx`),
        path.join(workspaceFolder.uri.fsPath, 'src', 'components', `${componentName}.js`),
        path.join(workspaceFolder.uri.fsPath, 'src', 'components', `${componentName}.tsx`),
        path.join(workspaceFolder.uri.fsPath, 'src', 'components', `${componentName}.ts`)
      ];

      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          console.log(`Found component at: ${filePath}`);
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
   * Parse signals from component content - Simplified to focus on signals. pattern
   */
  parseSignals(content) {
    const signals = [];
    const foundSignals = new Set();
    
    console.log('Parsing component content for signals...');
    
    // Main pattern: signals.signalName (all occurrences)
    const signalPattern = /signals\.([a-zA-Z][a-zA-Z0-9]*)/g;
    let match;
    
    while ((match = signalPattern.exec(content)) !== null) {
      const signalName = match[1];
      
      // Skip common non-signal properties
      if (['className', 'children', 'style', 'id', 'key', 'ref', 'onClick', 'onSubmit', 'onChange', 'onFocus', 'onBlur', 'type', 'disabled'].includes(signalName)) {
        continue;
      }
      
      if (!foundSignals.has(signalName)) {
        foundSignals.add(signalName);
        signals.push({
          name: signalName,
          description: `Signal: ${signalName}`,
          category: 'signal'
        });
      }
    }
    
    console.log(`Found ${signals.length} signals:`, signals.map(s => s.name));
    return signals;
  }


  /**
   * Get signals for a specific component
   */
  async getSignalsForComponent(componentName) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    console.log('Available workspace folders:', workspaceFolders?.map(wf => wf.uri.fsPath) || 'None');
    
    const componentFile = this.findComponentFile(componentName, workspaceFolders);
    
    if (!componentFile) {
      console.log(`Component file not found for: ${componentName}`);
      return [];
    }

    console.log(`Found component file: ${componentFile}`);
    const signals = this.extractSignalsFromFile(componentFile);
    console.log(`Extracted signals:`, signals);
    return signals;
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
