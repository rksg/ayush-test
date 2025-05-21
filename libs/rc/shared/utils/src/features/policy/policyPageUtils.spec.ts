import { TierFeatures, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { renderHook }                     from '@acx-ui/test-utils'

import { PolicyType, PolicyOperation } from '../../types'

import { getPolicyListRoutePath, getPolicyRoutePath, usePolicyListBreadcrumb, usePolicyPageHeaderTitle } from '.'

const mockedUseConfigTemplate = jest.fn()
jest.mock('../../configTemplate', () => ({
  ...jest.requireActual('../../configTemplate'),
  generateConfigTemplateBreadcrumb: () => [],
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

const mockedLocationFrom = { pathname: '/test' }
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useLocation: () => ({ state: { from: mockedLocationFrom } })
}))

const mockedGenerateUnifiedServicesBreadcrumb = jest.fn().mockReturnValue([])
jest.mock('../unifiedServices', () => ({
  ...jest.requireActual('../unifiedServices'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generateUnifiedServicesBreadcrumb: (from: any) => mockedGenerateUnifiedServicesBreadcrumb(from)
}))

describe('policyPageUtils', () => {
  beforeEach(() => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    jest.mocked(useIsTierAllowed).mockReturnValue(false)
  })

  afterEach(() => {
    mockedUseConfigTemplate.mockRestore()
    mockedGenerateUnifiedServicesBreadcrumb.mockClear()
  })

  it('should generate Policy PageHeader Title correctly', () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    const { result } = renderHook(() => usePolicyPageHeaderTitle(false, PolicyType.AAA))
    expect(result.current).toBe('Add RADIUS Server Template')

    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    // eslint-disable-next-line max-len
    const { result: nonTemplateResult } = renderHook(() => usePolicyPageHeaderTitle(false, PolicyType.AAA))
    expect(nonTemplateResult.current).toBe('Add RADIUS Server ')
  })

  it('usePolicyListBreadcrumb when isTemplate is true', () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    const { result } = renderHook(() => usePolicyListBreadcrumb(PolicyType.AAA))

    expect(result.current).toEqual([])
  })

  it('usePolicyListBreadcrumb when isTemplate is false', () => {
    const targetPolicyType = PolicyType.AAA
    const { result } = renderHook(() => usePolicyListBreadcrumb(targetPolicyType))

    expect(result.current).toEqual([
      { text: 'Network Control' },
      {
        text: 'Policies & Profiles',
        link: getPolicyListRoutePath(true)
      },
      { text: 'RADIUS Server',
        link: getPolicyRoutePath({ type: targetPolicyType, oper: PolicyOperation.LIST })
      }
    ])
  })

  it('usePolicyListBreadcrumb when isNewServiceCatalogEnabled is true', () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.SERVICE_CATALOG_UPDATED)

    renderHook(() => usePolicyListBreadcrumb(PolicyType.AAA))

    // eslint-disable-next-line max-len
    expect(mockedGenerateUnifiedServicesBreadcrumb).toHaveBeenCalledWith(mockedLocationFrom)
  })
})
