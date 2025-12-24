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
    
    // Check if we're inside a JSX component prop
    if (!this.isInJSXProp(lineText, document, position)) {
      return undefined;
    }

    // Get the component name
    const componentName = this.extractComponentName(document, position);
    if (!componentName) {
      return undefined;
    }

    // Get the current word being typed
    const wordRange = document.getWordRangeAtPosition(position, /[a-zA-Z0-9]+/);
    const currentWord = wordRange ? document.getText(wordRange) : '';

    // Get signals for this specific component
    const signals = await this.scanner.getSignalsForComponent(componentName);
    
    // Return signal suggestions
    return this.getSignalCompletions(signals, currentWord);
  }

  isInJSXProp(lineText, document, position) {
    // Check if current file is JavaScript/TypeScript
    if (!['javascript', 'typescript', 'typescriptreact', 'javascriptreact'].includes(document.languageId)) {
      return false;
    }

    // Get full context around cursor for better detection
    const textBeforeCursor = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
    
    // Pattern 1: Inside opening tag with props (e.g., <Button |)
    if (/<([A-Z][a-zA-Z0-9]*)\s+(?:[a-zA-Z][a-zA-Z0-9]*\s*=\s*["'][^"']*["']\s*)*[a-zA-Z]*$/.test(textBeforeCursor)) {
      return true;
    }
    
    // Pattern 2: After prop name equals sign (e.g., <Button primary=|)
    if (/<([A-Z][a-zA-Z0-9]*)[^>]*[a-zA-Z][a-zA-Z0-9]*\s*=\s*["']?$/.test(textBeforeCursor)) {
      return true;
    }

    // Pattern 3: Between props (e.g., <Button primary |)
    if (/<([A-Z][a-zA-Z0-9]*)[^>]*\s+[a-zA-Z]*$/.test(textBeforeCursor)) {
      // Ensure we're not inside a string literal
      const lastQuote = textBeforeCursor.lastIndexOf('"');
      const lastSingleQuote = textBeforeCursor.lastIndexOf("'");
      if (lastQuote === -1 && lastSingleQuote === -1) return true;
      
      // Check if cursor is after an even number of quotes (outside strings)
      const doubleQuoteCount = (textBeforeCursor.match(/"/g) || []).length;
      const singleQuoteCount = (textBeforeCursor.match(/'/g) || []).length;
      return doubleQuoteCount % 2 === 0 && singleQuoteCount % 2 === 0;
    }

    return false;
  }

  getSignalCompletions(currentWord) {
    const signals = getAllSignals();
    const completions = [];

    signals.forEach(signal => {
      // Filter by current word if user is typing
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
    // Trigger on letters and numbers
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
