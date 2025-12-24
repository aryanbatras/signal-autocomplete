// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const ComponentScanner = require('./componentScanner');

/**
 * Signal UI Autocomplete Provider
 */
class SignalCompletionProvider {
  constructor() {
    this.scanner = new ComponentScanner();
  }

  async provideCompletionItems(document, position) {
    const line = document.lineAt(position);
    const lineText = line.text.substring(0, position.character);
    
    console.log(`Completion requested at line ${position.line + 1}, char ${position.character}`);
    console.log(`Line text: "${lineText}"`);
    
    // Check if we're inside a JSX component prop
    const inJSXProp = this.isInJSXProp(lineText, document, position);
    console.log(`In JSX prop: ${inJSXProp}`);
    
    if (!inJSXProp) {
      return undefined;
    }

    // Get the component name
    const componentName = this.extractComponentName(document, position);
    console.log(`Component name: ${componentName}`);
    
    if (!componentName) {
      return undefined;
    }

    // Get the current word being typed
    const wordRange = document.getWordRangeAtPosition(position, /[a-zA-Z0-9]+/);
    const currentWord = wordRange ? document.getText(wordRange) : '';
    console.log(`Current word: "${currentWord}"`);

    // Get signals for this specific component
    const signals = await this.scanner.getSignalsForComponent(componentName);
    console.log(`Signals found: ${signals.length}`);
    
    // Return signal suggestions - show all if no word is being typed, filter if typing
    return this.getSignalCompletions(signals, currentWord);
  }

  /**
   * Extract component name from current context
   */
  extractComponentName(document, position) {
    const textBeforeCursor = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
    
    // Pattern to find the current JSX opening tag
    const tagMatch = textBeforeCursor.match(/<([A-Z][a-zA-Z0-9]*)[^>]*$/);
    if (tagMatch) {
      return tagMatch[1];
    }
    
    // Pattern to find self-closing tag
    const selfClosingMatch = textBeforeCursor.match(/<([A-Z][a-zA-Z0-9]*)[^>]*\/>$/);
    if (selfClosingMatch) {
      return selfClosingMatch[1];
    }
    
    return null;
  }

  isInJSXProp(lineText, document, position) {
  // Check if current file is JavaScript/TypeScript
  if (!['javascript', 'typescript', 'typescriptreact', 'javascriptreact'].includes(document.languageId)) {
    return false;
  }

  // Get full context around cursor
  const textBeforeCursor = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
  
  console.log('Checking JSX prop detection...');
  console.log(`Text before cursor: "${textBeforeCursor.slice(-100)}"`);
  
  // Simple pattern: look for <ComponentName ... where cursor is after opening tag
  const jsxPattern = /<([A-Z][a-zA-Z0-9]*)\s+[^>]*$/;
  const match = textBeforeCursor.match(jsxPattern);
  
  if (match) {
    console.log(`Inside JSX props of component: ${match[1]}`);
    return true;
  }
  
  console.log('Not inside JSX props area');
  return false;
}

  getSignalCompletions(signals, currentWord) {
    const completions = [];

    signals.forEach(signal => {
      // Show all signals if no current word, otherwise filter by current word
      if (currentWord && !signal.name.toLowerCase().includes(currentWord.toLowerCase())) {
        return;
      }

      const completion = new vscode.CompletionItem(
        signal.name,
        vscode.CompletionItemKind.Property
      );

      completion.detail = signal.description;
      completion.documentation = new vscode.MarkdownString(
        `**${signal.name}** - ${signal.description}\n\nCategory: ${signal.category}`
      );

      // Add insert text with proper formatting
      completion.insertText = signal.name;

      // Set priority for common signals
      if (['primary', 'secondary', 'sm', 'md', 'lg', 'hoverEnlarge'].includes(signal.name)) {
        completion.sortText = `0${signal.name}`;
      } else {
        completion.sortText = `1${signal.name}`;
      }

      completions.push(completion);
    });

    return completions;
  }
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Signal UI Autocomplete is now active!');

  // Register completion provider
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    // Support JavaScript, TypeScript, and JSX/TSX files
    ['javascript', 'typescript', 'typescriptreact', 'javascriptreact'],
    new SignalCompletionProvider(),
    // Trigger on letters and numbers only
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  );

  context.subscriptions.push(completionProvider);

  // Add status bar indicator
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = '$(pulse) Signal UI';
  statusBarItem.tooltip = 'Signal UI Autocomplete Active';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  vscode.window.showInformationMessage('Signal UI Autocomplete activated! Start typing in component props.');
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
}
