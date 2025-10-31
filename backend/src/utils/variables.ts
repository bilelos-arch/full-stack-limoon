export function detectVariables(text: string): string[] {
  const regex = /\(([^)]+)\)/g;
  const matches = text.matchAll(regex);
  return Array.from(matches, match => match[1]);
}