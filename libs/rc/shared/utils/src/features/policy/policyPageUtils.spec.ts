import { useIsTierAllowed } from '@acx-ui/feature-toggle'
import { renderHook }       from '@acx-ui/test-utils'

import { PolicyType, PolicyOperation } from '../../types'

import { getPolicyListRoutePath, getPolicyRoutePath, useAfterPolicySaveRedirectPath, usePolicyListBreadcrumb, usePolicyPageHeaderTitle } from '.'

const mockedUseConfigTemplate = jest.fn()
jest.mock('../../configTemplate', () => ({
  ...jest.requireActual('../../configTemplate'),
  generateConfigTemplateBreadcrumb: () => [],
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

const generalPreviousPath = '/test'
const mockedLocationFrom = { pathname: generalPreviousPath }
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useLocation: () => ({ state: { from: mockedLocationFrom } }),
  useTenantLink: (path: string) => path
}))

const mockedGenerateUnifiedServicesBreadcrumb = jest.fn().mockReturnValue([])
const mockedUseIsNewServicesCatalogEnabled = jest.fn(() => false)
jest.mock('../unifiedServices', () => ({
  ...jest.requireActual('../unifiedServices'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generateUnifiedServicesBreadcrumb: (from: any) => mockedGenerateUnifiedServicesBreadcrumb(from),
  useIsNewServicesCatalogEnabled: () => mockedUseIsNewServicesCatalogEnabled()
}))

describe('policyPageUtils', () => {
  beforeEach(() => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    jest.mocked(useIsTierAllowed).mockReturnValue(false)
  })

  afterEach(() => {
    mockedUseConfigTemplate.mockRestore()
    mockedGenerateUnifiedServicesBreadcrumb.mockClear()
    mockedUseIsNewServicesCatalogEnabled.mockRestore()
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
    mockedUseIsNewServicesCatalogEnabled.mockReturnValue(true)

    renderHook(() => usePolicyListBreadcrumb(PolicyType.AAA))

    // eslint-disable-next-line max-len
    expect(mockedGenerateUnifiedServicesBreadcrumb).toHaveBeenCalledWith(mockedLocationFrom)
  })

  describe('useAfterPolicySaveRedirectPath', () => {
    it('should return routeToList when isNewServiceCatalogEnabled is true and isTemplate is false', () => {
      mockedUseIsNewServicesCatalogEnabled.mockReturnValue(true)
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
      const routeToList = getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST })

      const { result } = renderHook(() =>
        useAfterPolicySaveRedirectPath(PolicyType.AAA)
      )

      expect(result.current).toBe(routeToList)
    })

    it('should return previousPath when isNewServiceCatalogEnabled is true and isTemplate is true', () => {
      mockedUseIsNewServicesCatalogEnabled.mockReturnValue(true)
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

      const { result } = renderHook(() =>
        useAfterPolicySaveRedirectPath(PolicyType.AAA)
      )

      expect(result.current).toBe(generalPreviousPath)
    })

    it('should return previousPath when isNewServiceCatalogEnabled is false and isTemplate is true', () => {
      mockedUseIsNewServicesCatalogEnabled.mockReturnValue(false)
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

      const { result } = renderHook(() =>
        useAfterPolicySaveRedirectPath(PolicyType.AAA)
      )

      expect(result.current).toBe(generalPreviousPath)
    })

    it('should return routeToList when isNewServiceCatalogEnabled is false and isTemplate is false', () => {
      mockedUseIsNewServicesCatalogEnabled.mockReturnValue(false)
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
      const routeToList = getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST })

      const { result } = renderHook(() =>
        useAfterPolicySaveRedirectPath(PolicyType.AAA)
      )

      expect(result.current).toBe(routeToList)
    })
  })
})
