// Types pour Storybook
declare module '@storybook/test' {
  import type { TestingLibraryQueries } from '@testing-library/dom';

  export const within: (element: HTMLElement) => TestingLibraryQueries & {
    findByText: (text: string | RegExp, options?: any) => Promise<HTMLElement>;
    getByText: (text: string | RegExp, options?: any) => HTMLElement;
    findByRole: (role: string, options?: any) => Promise<HTMLElement>;
    getByRole: (role: string, options?: any) => HTMLElement;
    findByPlaceholderText: (text: string | RegExp, options?: any) => Promise<HTMLElement>;
    getByPlaceholderText: (text: string | RegExp, options?: any) => HTMLElement;
    getByLabelText: (text: string | RegExp, options?: any) => HTMLElement;
    findAllByRole: (role: string, options?: any) => Promise<HTMLElement[]>;
    findAllByText: (text: string | RegExp, options?: any) => Promise<HTMLElement[]>;
    queryAllByRole: (role: string, options?: any) => HTMLElement[];
    queryByRole: (role: string, options?: any) => HTMLElement | null;
    queryAllByText: (text: string | RegExp, options?: any) => HTMLElement[];
  };

  export const userEvent: {
    click: (element: HTMLElement) => Promise<void>;
    type: (element: HTMLElement, text: string, options?: any) => Promise<void>;
    keyboard: (text: string) => Promise<void>;
    tab: (options?: any) => Promise<void>;
  };

  export const expect: {
    (element: HTMLElement): {
      toBeInTheDocument: () => void;
      toHaveFocus: () => void;
      toHaveValue: (value: string) => void;
      toHaveAttribute: (attr: string, value?: string) => void;
      toBeVisible: () => void;
      not: {
        toBeVisible: () => void;
      };
    };
    (condition: any): {
      toBeGreaterThan: (value: number) => void;
      toHaveLength: (length: number) => void;
    };
  };
}

declare module '@storybook/react' {
  import type { ComponentType } from 'react';

  export interface Meta<Component = ComponentType<any>> {
    title: string;
    component: Component;
    parameters?: {
      layout?: string;
      docs?: {
        description?: {
          component?: string;
          story?: string;
        };
      };
      viewport?: {
        defaultViewport?: string;
      };
      globals?: Record<string, any>;
      chromatic?: {
        delay?: number;
      };
    };
    tags?: string[];
    argTypes?: Record<string, any>;
    decorators?: Array<(Story: ComponentType) => JSX.Element>;
  }

  export type StoryObj<Component = ComponentType<any>> = {
    name?: string;
    args?: any;
    parameters?: any;
    play?: (context: { 
      canvasElement: HTMLElement; 
      step: (name: string, fn: () => Promise<void>) => Promise<void>;
      globals?: Record<string, any>;
    }) => Promise<void>;
  };

  export function within(element: HTMLElement): any;
}