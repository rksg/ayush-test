import { CONFIG_TEMPLATE_LIST_PATH, generateConfigTemplateBreadcrumb } from './configTemplateUtils'

describe('config-template-utils', () => {
  it('should generate correct breadcrumb for config template', () => {
    const breadcrumb = generateConfigTemplateBreadcrumb()
    expect(breadcrumb).toEqual([
      {
        text: 'Configuration Templates',
        link: CONFIG_TEMPLATE_LIST_PATH,
        tenantType: 'v'
      }
    ])
  })
})
