import { renderHook } from '@testing-library/react'

import { useServicePolicyEnabledWithConfigTemplate } from '@acx-ui/rc/components'
import { ConfigTemplateType }                        from '@acx-ui/rc/utils'
import { hasPermission }                             from '@acx-ui/user'

import { useIsDhcpEnabled } from './BasicInfo'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useServicePolicyEnabledWithConfigTemplate: jest.fn()
}))

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  hasPermission: jest.fn()
}))

// eslint-disable-next-line max-len
const mockedUseServicePolicyEnabledWithConfigTemplate = jest.mocked(useServicePolicyEnabledWithConfigTemplate)
const mockedHasPermission = jest.mocked(hasPermission)

describe('Basicinfo', () => {
  describe('useIsDhcpEnabled', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      mockedUseServicePolicyEnabledWithConfigTemplate.mockReturnValue(true)
      mockedHasPermission.mockReturnValue(true)
    })

    describe('when DHCP config template is enabled', () => {
      beforeEach(() => {
        mockedUseServicePolicyEnabledWithConfigTemplate.mockReturnValue(true)
      })

      it('should return true when user has bind venue DHCP profile permission', () => {
        mockedHasPermission.mockReturnValue(true)

        const { result } = renderHook(() => useIsDhcpEnabled())

        expect(result.current).toBe(true)
        // eslint-disable-next-line max-len
        expect(mockedUseServicePolicyEnabledWithConfigTemplate).toHaveBeenCalledWith(ConfigTemplateType.DHCP)
      })

      it('should return false when user does not have bind venue DHCP profile permission', () => {
        mockedHasPermission.mockReturnValue(false)

        const { result } = renderHook(() => useIsDhcpEnabled())

        expect(result.current).toBe(false)
      })
    })

    describe('when DHCP config template is disabled', () => {
      beforeEach(() => {
        mockedUseServicePolicyEnabledWithConfigTemplate.mockReturnValue(false)
      })

      it('should return false regardless of permission', () => {
        mockedHasPermission.mockReturnValue(true)

        const { result } = renderHook(() => useIsDhcpEnabled())

        expect(result.current).toBe(false)
      })

      it('should return false when user also does not have permission', () => {
        mockedHasPermission.mockReturnValue(false)

        const { result } = renderHook(() => useIsDhcpEnabled())

        expect(result.current).toBe(false)
      })
    })
  })
})
