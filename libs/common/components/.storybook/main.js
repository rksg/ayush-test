const rootMain = require('../../../../.storybook/main');
const modifyVars = require('../src/theme/modify-vars');

module.exports = {
  ...rootMain,

  core: { ...rootMain.core, builder: 'webpack5' },

  stories: [
    ...rootMain.stories,
    '../src/components/**/*.stories.mdx',
    '../src/components/**/stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    ...rootMain.addons,
    '@nrwl/react/plugins/storybook',
    '@storybook/addon-knobs',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    {
      name: '@storybook/preset-ant-design',
      options: {
        lessOptions: {
          modifyVars
        }
      }
    }
  ],
  webpackFinal: async (config, { configType }) => {
    // apply any global webpack configs that might have been specified in .storybook/main.js
    if (rootMain.webpackFinal) {
      config = await rootMain.webpackFinal(config, { configType });
    }

    // Remove the rules that handles all styles by default
    config.module.rules = config.module.rules.filter(
      f => !f.test.toString().includes('|\\.less$|')
    );

    // add your own webpack tweaks if needed
    return config;
  },
};
