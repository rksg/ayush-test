import { renderHook } from '@testing-library/react'

import { useIsEdgeFeatureReady } from '@acx-ui/rc/utils'
import { useUserProfileContext } from '@acx-ui/user'

import { useIsEdgeDelegationPermitted } from './useIsEdgeDelegationPermitted'

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: jest.fn()
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: jest.fn()
}))

describe('useIsEdgeDelegationPermitted', () => {
  it('returns true when isEdgeDelegationEnabled is true and tenantType is MSP', () => {
    (useUserProfileContext as jest.Mock).mockReturnValue({ tenantType: 'MSP' });
    (useIsEdgeFeatureReady as jest.Mock).mockReturnValue(true)
    const { result } = renderHook(() => useIsEdgeDelegationPermitted())
    expect(result.current).toBe(true)
  })

  it('returns true when isEdgeDelegationEnabled is true and tenantType is MSP_NON_VAR', () => {
    (useUserProfileContext as jest.Mock).mockReturnValue({ tenantType: 'MSP_NON_VAR' });
    (useIsEdgeFeatureReady as jest.Mock).mockReturnValue(true)
    const { result } = renderHook(() => useIsEdgeDelegationPermitted())
    expect(result.current).toBe(true)
  })

  // eslint-disable-next-line max-len
  it('returns false when isEdgeDelegationEnabled is true and tenantType is not MSP or MSP_NON_VAR', () => {
    (useUserProfileContext as jest.Mock).mockReturnValue({ tenantType: 'OTHER' });
    (useIsEdgeFeatureReady as jest.Mock).mockReturnValue(true)
    const { result } = renderHook(() => useIsEdgeDelegationPermitted())
    expect(result.current).toBe(false)
  })

  it('returns false when isEdgeDelegationEnabled is false', () => {
    (useUserProfileContext as jest.Mock).mockReturnValue({ tenantType: 'MSP' });
    (useIsEdgeFeatureReady as jest.Mock).mockReturnValue(false)
    const { result } = renderHook(() => useIsEdgeDelegationPermitted())
    expect(result.current).toBe(false)
  })
})