import { generateConfigTemplateBreadcrumb, generateConfigTemplatePayload } from './configTemplateUtils'

describe('config-template-utils', () => {
  it('should generate correct breadcrumb for config template', () => {
    const breadcrumb = generateConfigTemplateBreadcrumb()
    expect(breadcrumb).toEqual([
      {
        text: 'Configuration Templates',
        link: 'configTemplates/templates',
        tenantType: 'v'
      }
    ])
  })

  it('should generate correct payload for config template', () => {
    const payload = { key: 'value' }
    const configTemplatePayload = generateConfigTemplatePayload(payload)

    expect(configTemplatePayload).toEqual({ ...payload, isTemplate: true })
  })
})
