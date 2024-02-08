import { ConfigTemplateType } from '../types'

import {
  getConfigTemplatePath,
  CONFIG_TEMPLATE_PATH_PREFIX,
  getConfigTemplateEditPath
} from '.'

describe('configTemplateRouteUtils', () => {

  it('returns the correct network config template link', () => {
    const networkPath = 'exampleNetworkPath'
    const result = getConfigTemplatePath(networkPath)
    expect(result).toBe(`${CONFIG_TEMPLATE_PATH_PREFIX}/${networkPath}`)

    const rootPath = getConfigTemplatePath()
    expect(rootPath).toBe(CONFIG_TEMPLATE_PATH_PREFIX)
  })

  it('returns the correct edit path', () => {
    const templateId = '123456'

    // eslint-disable-next-line max-len
    expect(getConfigTemplateEditPath(ConfigTemplateType.RADIUS, templateId)).toBe(`configTemplates/policies/aaa/${templateId}/edit`)

    // eslint-disable-next-line max-len
    expect(getConfigTemplateEditPath(ConfigTemplateType.NETWORK, templateId)).toBe(`configTemplates/networks/wireless/${templateId}/edit`)
  })
})
