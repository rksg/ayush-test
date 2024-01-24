import { renderHook } from '@acx-ui/test-utils'

import { PolicyType } from '../../types'

import { PolicyOperation, generatePolicyPageHeaderTitle, getPolicyListRoutePath, getPolicyRoutePath, usePolicyBreadcrumb } from '.'

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

  it('usePolicyBreadcrumb when isTemplate is true', () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    const { result } = renderHook(() => usePolicyBreadcrumb(PolicyType.AAA, PolicyOperation.CREATE))

    expect(result.current).toEqual([])
  })

  it('usePolicyBreadcrumb when isTemplate is false', () => {
    const targetPolicyType = PolicyType.AAA
    const targetPolicyOper = PolicyOperation.CREATE
    const { result } = renderHook(() => usePolicyBreadcrumb(targetPolicyType, targetPolicyOper))

    expect(result.current).toEqual([
      { text: 'Network Control' },
      {
        text: 'Policies & Profiles',
        link: getPolicyListRoutePath(true)
      },
      { text: 'RADIUS Server',
        link: getPolicyRoutePath({ type: targetPolicyType, oper: targetPolicyOper })
      }
    ])
  })
})
