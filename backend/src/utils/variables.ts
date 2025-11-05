//backend/src/utils/variables.ts
import { EditorElement } from '../editor-element.schema';

export function detectVariables(text: string): string[] {
  const regex = /\(([^)]+)\)/g;
  const matches = text.matchAll(regex);
  return Array.from(matches, match => match[1]);
}

export function parseVariablesFromEditorElements(editorElements: EditorElement[]): string[] {
  const variables = new Set<string>();

  console.log('=== PARSING VARIABLES FROM ELEMENTS ===');
  console.log('Number of editor elements:', editorElements.length);

  for (const element of editorElements) {
    console.log('Processing element:', {
      id: element._id,
      type: element.type,
      textContent: element.textContent,
      variableName: element.variableName
    });

    if (element.type === 'text' && element.textContent) {
      const foundVariables = parseVariablesFromText(element.textContent);
      console.log('Found text variables:', foundVariables);
      foundVariables.forEach(variable => variables.add(variable));
    } else if (element.type === 'image' && element.variableName) {
      // Add image element variables
      console.log('Found image variable:', element.variableName);
      variables.add(element.variableName);
    }
  }

  const result = Array.from(variables);
  console.log('Final variables list:', result);
  return result;
}

function parseVariablesFromText(text: string): string[] {
  const variableRegex = /\(([^)]+)\)/g;
  const variables: string[] = [];
  let match;

  while ((match = variableRegex.exec(text)) !== null) {
    const variable = match[1].trim();
    // Filter out variables that are not simple words (likely medical/technical terms)
    // Only keep variables that are single words, alphabetic, and common story variables
    if (variable &&
        variable.length > 0 &&
        variable.length < 20 &&
        !variable.includes(' ') &&
        /^[a-zA-ZàâäéèêëïîôöùûüÿñçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+$/.test(variable) &&
        !variable.includes('-') &&
        !variable.includes('®') &&
        !variables.includes(variable)) {
      variables.push(variable);
    }
  }

  return variables;
}