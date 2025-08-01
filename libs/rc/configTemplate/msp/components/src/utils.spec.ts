import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { renderHook }             from '@acx-ui/test-utils'
import { hasRoles }               from '@acx-ui/user'
import { isDelegationMode }       from '@acx-ui/utils'

import { useEcFilters } from './utils'

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: () => ({ data: { adminId: 'adminId' } }),
  hasRoles: jest.fn()
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  isDelegationMode: jest.fn()
}))

describe('ConfigTemplates utils', () => {
  beforeEach(() => {
    jest.mocked(hasRoles).mockReturnValue(true)
  })
  it('should get the ecFilters correctly', async () => {
    const { result } = renderHook(() => useEcFilters())

    expect(result.current).toEqual({
      tenantType: ['MSP_EC', 'MSP_REC']
    })
  })

  it('should get the ecFilters correctly when the delegation mode is false', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SUPPORT_DELEGATE_MSP_DASHBOARD_TOGGLE)
    jest.mocked(isDelegationMode).mockReturnValue(false)
    jest.mocked(hasRoles).mockReturnValue(false)

    const { result } = renderHook(() => useEcFilters())

    expect(result.current).toEqual({
      mspAdmins: ['adminId'],
      tenantType: ['MSP_EC', 'MSP_REC']
    })
  })
})
