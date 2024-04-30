import { renderHook } from '@acx-ui/test-utils'

import { PolicyType } from '../../types'

import { PolicyOperation, generatePolicyPageHeaderTitle, getPolicyListRoutePath, getPolicyRoutePath, usePolicyListBreadcrumb } from '.'

const mockedUseConfigTemplate = jest.fn()
jest.mock('../../configTemplate', () => ({
  ...jest.requireActual('../../configTemplate'),
  generateConfigTemplateBreadcrumb: () => [],
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

describe('policyPageUtils', () => {
  beforeEach(() => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
  })

  afterEach(() => {
    mockedUseConfigTemplate.mockRestore()
  })
  it('should generate Policy PageHeader Title correctly', () => {
    expect(generatePolicyPageHeaderTitle(false, false, PolicyType.AAA)).toBe('Add RADIUS Server ')
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
})
