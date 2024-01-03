import {
  getConfigTemplateLink,
  CONFIG_TEMPLATE_PATH_PREFIX
} from '.'

describe('configTemplateRouteUtils', () => {

  it('returns the correct network config template link', () => {
    const networkPath = 'exampleNetworkPath'
    const result = getConfigTemplateLink(networkPath)
    expect(result).toBe(`${CONFIG_TEMPLATE_PATH_PREFIX}/${networkPath}`)
  })
})
