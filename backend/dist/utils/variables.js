"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectVariables = detectVariables;
exports.parseVariablesFromEditorElements = parseVariablesFromEditorElements;
function detectVariables(text) {
    const regex = /\(([^)]+)\)/g;
    const matches = text.matchAll(regex);
    return Array.from(matches, match => match[1]);
}
function parseVariablesFromEditorElements(editorElements) {
    const variables = new Set();
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
        }
        else if (element.type === 'image' && element.variableName) {
            console.log('Found image variable:', element.variableName);
            variables.add(element.variableName);
        }
    }
    const result = Array.from(variables);
    console.log('Final variables list:', result);
    return result;
}
function parseVariablesFromText(text) {
    const variableRegex = /\(([^)]+)\)/g;
    const variables = [];
    let match;
    while ((match = variableRegex.exec(text)) !== null) {
        const variable = match[1].trim();
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
//# sourceMappingURL=variables.js.map