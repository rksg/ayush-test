import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { renderHook }             from '@acx-ui/test-utils'

import {
  useAclTotalCount,
  useWifiAclTotalCount,
  useSwitchAclTotalCount
} from './counterUtils'

// Mock all service queries
const mockServiceQueries = {
  aclProfile: jest.fn(),
  l2AclProfile: jest.fn(),
  l3AclProfile: jest.fn(),
  deviceProfile: jest.fn(),
  appProfile: jest.fn(),
  switchAcl: jest.fn(),
  switchL2Acl: jest.fn()
}

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetEnhancedAccessControlProfileListQuery:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (args: any, options: any) => mockServiceQueries.aclProfile(args, options),
  useGetEnhancedL2AclProfileListQuery:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (args: any, options: any) => mockServiceQueries.l2AclProfile(args, options),
  useGetEnhancedL3AclProfileListQuery:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (args: any, options: any) => mockServiceQueries.l3AclProfile(args, options),
  useGetEnhancedDeviceProfileListQuery:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (args: any, options: any) => mockServiceQueries.deviceProfile(args, options),
  useGetEnhancedApplicationProfileListQuery:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (args: any, options: any) => mockServiceQueries.appProfile(args, options),
  useAccessControlsCountQuery:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (args: any, options: any) => mockServiceQueries.switchAcl(args, options),
  useGetLayer2AclsQuery:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (args: any, options: any) => mockServiceQueries.switchL2Acl(args, options)
}))

const mockUser = {
  getUserProfile: jest.fn(),
  isCoreTier: jest.fn()
}

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  getUserProfile: () => mockUser.getUserProfile(),
  isCoreTier: (tier: string) => mockUser.isCoreTier(tier)
}))

describe('counterUtils', () => {
  beforeEach(() => {
    mockUser.getUserProfile.mockReturnValue({ accountTier: 'Platinum' })
    mockUser.isCoreTier.mockReturnValue(false)

    Object.values(mockServiceQueries).forEach(mock => {
      mock.mockReturnValue({ data: undefined, isFetching: false })
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('useWifiAclTotalCount', () => {
    it('calculates total count correctly', () => {
      mockServiceQueries.aclProfile.mockReturnValueOnce({
        data: { totalCount: 5 }, isFetching: false
      })
      mockServiceQueries.l2AclProfile.mockReturnValueOnce({
        data: { totalCount: 3 }, isFetching: false
      })
      mockServiceQueries.l3AclProfile.mockReturnValueOnce({
        data: { totalCount: 2 }, isFetching: false
      })
      mockServiceQueries.deviceProfile.mockReturnValueOnce({
        data: { totalCount: 4 }, isFetching: false
      })
      mockServiceQueries.appProfile.mockReturnValueOnce({
        data: { totalCount: 1 }, isFetching: false
      })

      const { result } = renderHook(() => useWifiAclTotalCount())

      expect(result.current.data?.totalCount).toBe(15)
      expect(result.current.data?.aclCount).toBe(5)
      expect(result.current.data?.l2AclCount).toBe(3)
      expect(result.current.data?.l3AclCount).toBe(2)
      expect(result.current.data?.deviceAclCount).toBe(4)
      expect(result.current.data?.appAclCount).toBe(1)
    })

    it('handles undefined data', () => {
      const { result } = renderHook(() => useWifiAclTotalCount())

      expect(result.current.data?.totalCount).toBe(0)
      expect(result.current.data?.aclCount).toBe(0)
    })

    it('skips Application ACL for core tier', () => {
      mockUser.isCoreTier.mockReturnValue(true)

      renderHook(() => useWifiAclTotalCount())

      expect(mockServiceQueries.appProfile).toHaveBeenCalled()
      const [, options] = mockServiceQueries.appProfile.mock.calls[0]
      expect(options.skip).toBe(true)
    })

    it('skips queries when disabled', () => {
      renderHook(() => useWifiAclTotalCount(true))

      expect(mockServiceQueries.aclProfile).toHaveBeenCalled()
      const [, options] = mockServiceQueries.aclProfile.mock.calls[0]
      expect(options.skip).toBe(true)
    })
  })

  describe('useSwitchAclTotalCount', () => {
    it('calculates switch ACL total count', () => {
      mockServiceQueries.switchAcl.mockReturnValueOnce({
        data: 10, isFetching: false
      })
      mockServiceQueries.switchL2Acl.mockReturnValueOnce({
        data: { totalCount: 5 }, isFetching: false
      })

      const { result } = renderHook(() => useSwitchAclTotalCount())

      expect(result.current.data?.totalCount).toBe(15)
      expect(result.current.data?.switchMacAclCount).toBe(10)
      expect(result.current.data?.switchL2AclCount).toBe(5)
    })

    it('handles undefined data', () => {
      const { result } = renderHook(() => useSwitchAclTotalCount())

      expect(result.current.data?.totalCount).toBe(0)
      expect(result.current.data?.switchMacAclCount).toBe(0)
      expect(result.current.data?.switchL2AclCount).toBe(0)
    })

    it('skips queries when disabled', () => {
      renderHook(() => useSwitchAclTotalCount(true))

      expect(mockServiceQueries.switchAcl).toHaveBeenCalled()
      const [, options] = mockServiceQueries.switchAcl.mock.calls[0]
      expect(options.skip).toBe(true)
    })
  })

  describe('useAclTotalCount', () => {
    it('combines WiFi and Switch ACL when switch feature enabled', () => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)

      // Setup WiFi counts
      mockServiceQueries.aclProfile.mockReturnValueOnce({
        data: { totalCount: 5 }, isFetching: false
      })
      mockServiceQueries.l2AclProfile.mockReturnValueOnce({
        data: { totalCount: 3 }, isFetching: false
      })
      mockServiceQueries.l3AclProfile.mockReturnValueOnce({
        data: { totalCount: 2 }, isFetching: false
      })
      mockServiceQueries.deviceProfile.mockReturnValueOnce({
        data: { totalCount: 4 }, isFetching: false
      })
      mockServiceQueries.appProfile.mockReturnValueOnce({
        data: { totalCount: 1 }, isFetching: false
      })

      // Setup Switch counts
      mockServiceQueries.switchAcl.mockReturnValueOnce({
        data: 10, isFetching: false
      })
      mockServiceQueries.switchL2Acl.mockReturnValueOnce({
        data: { totalCount: 5 }, isFetching: false
      })

      const { result } = renderHook(() => useAclTotalCount())

      expect(result.current.data?.totalCount).toBe(30) // WiFi: 15, Switch: 15
    })

    it('returns only WiFi ACL when switch feature disabled', () => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)

      mockServiceQueries.aclProfile.mockReturnValueOnce({
        data: { totalCount: 5 }, isFetching: false
      })
      mockServiceQueries.l2AclProfile.mockReturnValueOnce({
        data: { totalCount: 3 }, isFetching: false
      })
      mockServiceQueries.l3AclProfile.mockReturnValueOnce({
        data: { totalCount: 2 }, isFetching: false
      })
      mockServiceQueries.deviceProfile.mockReturnValueOnce({
        data: { totalCount: 4 }, isFetching: false
      })
      mockServiceQueries.appProfile.mockReturnValueOnce({
        data: { totalCount: 1 }, isFetching: false
      })

      const { result } = renderHook(() => useAclTotalCount())

      expect(result.current.data?.totalCount).toBe(15) // Only WiFi ACL

      expect(mockServiceQueries.switchAcl).toHaveBeenCalled()
      const [, switchOptions] = mockServiceQueries.switchAcl.mock.calls[0]
      expect(switchOptions.skip).toBe(true)

      expect(mockServiceQueries.switchL2Acl).toHaveBeenCalled()
      const [, switchL2Options] = mockServiceQueries.switchL2Acl.mock.calls[0]
      expect(switchL2Options.skip).toBe(true)
    })

    it('skips queries when disabled', () => {
      renderHook(() => useAclTotalCount(true))

      expect(mockServiceQueries.aclProfile).toHaveBeenCalled()
      const [, wifiOptions] = mockServiceQueries.aclProfile.mock.calls[0]
      expect(wifiOptions.skip).toBe(true)

      expect(mockServiceQueries.switchAcl).toHaveBeenCalled()
      const [, switchOptions] = mockServiceQueries.switchAcl.mock.calls[0]
      expect(switchOptions.skip).toBe(true)
    })
  })
})
