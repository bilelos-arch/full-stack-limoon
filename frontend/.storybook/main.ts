import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/nextjs',
    options: {
      fastRefresh: true,
    },
  },
  stories: [
    '../src/components/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/hooks/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
  ],
  staticDirs: ['../public'],
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => {
        if (prop.parent) {
          return !/node_modules/.test(prop.parent.fileName);
        }
        return true;
      },
    },
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;