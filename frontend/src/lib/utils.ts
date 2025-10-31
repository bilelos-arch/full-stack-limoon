import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function detectVariables(text: string): string[] {
  const regex = /\(([^)]+)\)/g;
  const matches = text.matchAll(regex);
  return Array.from(matches, match => match[1]);
}
