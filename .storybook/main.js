const modifyVars = require('../src/theme/modify-vars')

module.exports = {
  stories: [
    '../src/**/*.stories.mdx',
    '../src/components/**/stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    {
      name: '@storybook/preset-create-react-app',
      options: {
        craOverrides: {
          fileLoaderExcludes: ['less']
        }
      }
    },
    {
      name: '@storybook/preset-ant-design',
      options: {
        lessOptions: {
          modifyVars
        }
      }
    }
  ],
  framework: '@storybook/react',
  core: {
    builder: 'webpack5'
  }
}
