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
      // Check multiple possible component locations
      const possiblePaths = [
        // Root components/ folder
        path.join(workspaceFolder.uri.fsPath, 'components', `${componentName}.jsx`),
        path.join(workspaceFolder.uri.fsPath, 'components', `${componentName}.js`),
        path.join(workspaceFolder.uri.fsPath, 'components', `${componentName}.tsx`),
        path.join(workspaceFolder.uri.fsPath, 'components', `${componentName}.ts`),
        // src/components/ folder
        path.join(workspaceFolder.uri.fsPath, 'src', 'components', `${componentName}.jsx`),
        path.join(workspaceFolder.uri.fsPath, 'src', 'components', `${componentName}.js`),
        path.join(workspaceFolder.uri.fsPath, 'src', 'components', `${componentName}.tsx`),
        path.join(workspaceFolder.uri.fsPath, 'src', 'components', `${componentName}.ts`),
        // components/signals/ folder
        path.join(workspaceFolder.uri.fsPath, 'components', 'signals', `${componentName}.jsx`),
        path.join(workspaceFolder.uri.fsPath, 'components', 'signals', `${componentName}.js`),
        path.join(workspaceFolder.uri.fsPath, 'components', 'signals', `${componentName}.tsx`),
        path.join(workspaceFolder.uri.fsPath, 'components', 'signals', `${componentName}.ts`),
        // src/components/signals/ folder
        path.join(workspaceFolder.uri.fsPath, 'src', 'components', 'signals', `${componentName}.jsx`),
        path.join(workspaceFolder.uri.fsPath, 'src', 'components', 'signals', `${componentName}.js`),
        path.join(workspaceFolder.uri.fsPath, 'src', 'components', 'signals', `${componentName}.tsx`),
        path.join(workspaceFolder.uri.fsPath, 'src', 'components', 'signals', `${componentName}.ts`),
        // signals/ folder
        path.join(workspaceFolder.uri.fsPath, 'signals', `${componentName}.jsx`),
        path.join(workspaceFolder.uri.fsPath, 'signals', `${componentName}.js`),
        path.join(workspaceFolder.uri.fsPath, 'signals', `${componentName}.tsx`),
        path.join(workspaceFolder.uri.fsPath, 'signals', `${componentName}.ts`)
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
   * Parse signals from component content - Enhanced to extract layer, lease, and spread information
   */
  parseSignals(content) {
    const signals = [];
    const foundSignals = new Map();
    
    console.log('Parsing component content for signals...');
    
    // Extract layer definitions and their signals
    const layerDefinitions = this.extractLayerDefinitions(content);
    
    // Extract lease signals
    const leaseSignals = this.extractLeaseSignals(content);
    
    // Extract spread signals
    const spreadSignals = this.extractSpreadSignals(content);
    
    // Extract composite signals
    const compositeSignals = this.extractCompositeSignals(content);
    
    // Main pattern: signals.signalName (all occurrences)
    const signalPattern = /signals\.([a-zA-Z][a-zA-Z0-9]*)/g;
    let match;
    
    while ((match = signalPattern.exec(content)) !== null) {
      const signalName = match[1];
      
      // Skip if already processed
      if (foundSignals.has(signalName)) {
        continue;
      }
      
      // Determine signal type and description
      let description = signalName;
      let category = 'signal';
      let layer = '';
      
      // Check if it's a layer signal
      for (const [layerName, layerInfo] of Object.entries(layerDefinitions)) {
        if (layerInfo.signals.includes(signalName)) {
          category = 'layer';
          layer = layerName;
          description = `${layerName} layer`;
          break;
        }
      }
      
      // Check if it's a lease signal
      if (leaseSignals.includes(signalName)) {
        category = 'lease';
        description = `lease contract`;
      }
      
      // Check if it's a spread signal
      if (spreadSignals.includes(signalName)) {
        category = 'spread';
        description = `native spread`;
      }
      
      // Check if it's a composite signal
      if (compositeSignals.includes(signalName)) {
        category = 'composite';
        description = `composite signal`;
      }
      
      foundSignals.set(signalName, {
        name: signalName,
        description: description,
        category: category,
        layer: layer
      });
    }
    
    // Convert Map to array and sort by category and name
    const result = Array.from(foundSignals.values()).sort((a, b) => {
      const categoryOrder = { 'layer': 0, 'lease': 1, 'spread': 2, 'composite': 3, 'signal': 4 };
      if (categoryOrder[a.category] !== categoryOrder[b.category]) {
        return categoryOrder[a.category] - categoryOrder[b.category];
      }
      return a.name.localeCompare(b.name);
    });
    
    console.log(`Found ${result.length} signals:`, result.map(s => `${s.name} (${s.category})`));
    return result;
  }

  /**
   * Extract layer definitions from component content
   */
  extractLayerDefinitions(content) {
    const layers = {};
    
    // Find layer definitions: const layerName = layer("layerType");
    const layerDefPattern = /const\s+([a-zA-Z][a-zA-Z0-9]*)\s*=\s*layer\("([^"]+)"\)/g;
    let match;
    
    while ((match = layerDefPattern.exec(content)) !== null) {
      const layerVarName = match[1];
      const layerType = match[2];
      
      layers[layerVarName] = {
        type: layerType,
        signals: []
      };
    }
    
    // Find signals assigned to each layer
    for (const [layerVarName, layerInfo] of Object.entries(layers)) {
      // Pattern: layerVarName("className", "signalName")
      const signalPattern = new RegExp(`${layerVarName}\\s*\\(\\s*["'][^"']*["']\\s*,\\s*["']([^"']+)["']\\s*\\)`, 'g');
      let signalMatch;
      
      while ((signalMatch = signalPattern.exec(content)) !== null) {
        layerInfo.signals.push(signalMatch[1]);
      }
    }
    
    return layers;
  }

  /**
   * Extract lease signals from component content
   */
  extractLeaseSignals(content) {
    const leases = [];
    
    // Pattern: lease("leaseName", "signalKey") or lease(signalName)
    const leasePattern = /lease\s*\(\s*["']([^"']+)["'](?:\s*,\s*["']([^"']+)["'])?\s*\)/g;
    let match;
    
    while ((match = leasePattern.exec(content)) !== null) {
      leases.push(match[2] || match[1]); // Use signalKey if provided, otherwise leaseName
    }
    
    return leases;
  }

  /**
   * Extract spread signals from component content
   */
  extractSpreadSignals(content) {
    const spreads = [];
    
    // Pattern: spread("spreadName", "signalKey") or spread(signalName)
    const spreadPattern = /spread\s*\(\s*["']([^"']+)["'](?:\s*,\s*["']([^"']+)["'])?\s*\)/g;
    let match;
    
    while ((match = spreadPattern.exec(content)) !== null) {
      spreads.push(match[2] || match[1]); // Use signalKey if provided, otherwise spreadName
    }
    
    return spreads;
  }

  /**
   * Extract composite signals from component content
   */
  extractCompositeSignals(content) {
    const composites = [];
    
    // Pattern: signals.signalName && (() => (...))(), delete signals.signalName;
    const compositePattern = /signals\.([a-zA-Z][a-zA-Z0-9]*)\s*&&\s*\(\s*\(\s*\)\s*=>/g;
    let match;
    
    while ((match = compositePattern.exec(content)) !== null) {
      composites.push(match[1]);
    }
    
    return composites;
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
