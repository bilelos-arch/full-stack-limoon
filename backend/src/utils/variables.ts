//backend/src/utils/variables.ts
import { EditorElement } from '../editor-element.schema';

export function detectVariables(text: string): string[] {
  const regex = /\(([^)]+)\)/g;
  const matches = text.matchAll(regex);
  return Array.from(matches, match => match[1]);
}

export function parseVariablesFromEditorElements(editorElements: EditorElement[]): string[] {
  const variables = new Set<string>();

  for (const element of editorElements) {
    if (element.type === 'text' && element.textContent) {
      const foundVariables = parseVariablesFromText(element.textContent);
      foundVariables.forEach(variable => variables.add(variable));
    }
  }

  return Array.from(variables);
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