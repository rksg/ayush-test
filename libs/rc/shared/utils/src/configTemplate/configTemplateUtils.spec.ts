import { CONFIG_TEMPLATE_LIST_PATH }                                 from './configTemplateRouteUtils'
import { generateConfigTemplateBreadcrumb, hasConfigTemplateAccess } from './configTemplateUtils'

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

  it('should return correct access for config template', () => {
    expect(hasConfigTemplateAccess(true, 'MSP')).toBe(true)
    expect(hasConfigTemplateAccess(false, 'MSP')).toBe(false)
    expect(hasConfigTemplateAccess(true, 'MSP_NON_VAR')).toBe(true)
    expect(hasConfigTemplateAccess(false, 'MSP_NON_VAR')).toBe(false)
    expect(hasConfigTemplateAccess(true, 'MSP_REC')).toBe(false)
    expect(hasConfigTemplateAccess(true, 'MSP_INTEGRATOR')).toBe(false)
  })
})
