import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { renderHook }             from '@acx-ui/test-utils'

import { useDhcpConsolidationTotalCount, useMdnsProxyConsolidationTotalCount } from './serviceCounterUtils'

const mockedMdnsProxyListQuery = jest.fn()
const mockedEdgeMdnsProxyListQuery = jest.fn()
const mockedDhcpListQuery = jest.fn()
const mockedEdgeDhcpListQuery = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  useGetEnhancedMdnsProxyListQuery: (args: any, options: any) => mockedMdnsProxyListQuery(args, options),
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  useGetEdgeMdnsProxyViewDataListQuery: (args: any, options: any) => mockedEdgeMdnsProxyListQuery(args, options),
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  useGetDHCPProfileListViewModelQuery: (args: any, options: any) => mockedDhcpListQuery(args, options),
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  useGetDhcpStatsQuery: (args: any, options: any) => mockedEdgeDhcpListQuery(args, options)
}))

describe('counterUtils', () => {
  describe('useMdnsProxyConsolidationTotalCount', () => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)

      mockedMdnsProxyListQuery.mockReturnValue({ data: undefined, isFetching: false })
      mockedEdgeMdnsProxyListQuery.mockReturnValue({ data: undefined, isFetching: false })
    })

    afterEach(() => {
      mockedMdnsProxyListQuery.mockClear()
      mockedEdgeMdnsProxyListQuery.mockClear()
    })

    it('returns the correct total count', () => {
      mockedMdnsProxyListQuery.mockReturnValueOnce({ data: { totalCount: 10 }, isFetching: false })
      // eslint-disable-next-line max-len
      mockedEdgeMdnsProxyListQuery.mockReturnValueOnce({ data: { totalCount: 10 }, isFetching: false })
      const { result } = renderHook(() => useMdnsProxyConsolidationTotalCount())
      expect(result.current.data?.totalCount).toBe(20)
      expect(result.current.isFetching).toBe(false)
    })

    // eslint-disable-next-line max-len
    it('returns 0 as the total count when both mdnsProxyData and edgeMdnsProxyData are undefined', () => {
      mockedMdnsProxyListQuery.mockReturnValueOnce({ data: undefined, isFetching: true })
      mockedEdgeMdnsProxyListQuery.mockReturnValueOnce({ data: undefined, isFetching: false })
      const { result } = renderHook(() => useMdnsProxyConsolidationTotalCount())
      expect(result.current.data?.totalCount).toBe(0)
      expect(result.current.isFetching).toBe(true)
    })

    // eslint-disable-next-line max-len
    it('returns the correct total count when only one of mdnsProxyData or edgeMdnsProxyData has a totalCount property', () => {
      mockedMdnsProxyListQuery.mockReturnValueOnce({ data: { totalCount: 10 }, isFetching: false })
      mockedEdgeMdnsProxyListQuery.mockReturnValueOnce({ data: undefined, isFetching: true })
      const { result } = renderHook(() => useMdnsProxyConsolidationTotalCount())
      expect(result.current.data?.totalCount).toBe(10)
      expect(result.current.isFetching).toBe(true)
    })

    it('should skip the query when isDisabled is true', () => {
      renderHook(() => useMdnsProxyConsolidationTotalCount(true))

      expect(mockedMdnsProxyListQuery).toHaveBeenCalled()
      const [, options] = mockedMdnsProxyListQuery.mock.calls[0]
      expect(options.skip).toBe(true)

      expect(mockedEdgeMdnsProxyListQuery).toHaveBeenCalled()
      const [, edgeOptions] = mockedEdgeMdnsProxyListQuery.mock.calls[0]
      expect(edgeOptions.skip).toBe(true)
    })
  })

  describe('useDhcpConsolidationTotalCount', () => {
    beforeEach(() => {
      mockedDhcpListQuery.mockReturnValue({ data: undefined, isFetching: false })
      mockedEdgeDhcpListQuery.mockReturnValue({ data: undefined, isFetching: false })
    })

    afterEach(() => {
      mockedDhcpListQuery.mockClear()
      mockedEdgeDhcpListQuery.mockClear()
    })
    it('returns the correct total count', () => {
      mockedDhcpListQuery.mockReturnValueOnce({ data: { totalCount: 10 }, isFetching: false })
      mockedEdgeDhcpListQuery.mockReturnValueOnce({ data: { totalCount: 10 }, isFetching: false })
      const { result } = renderHook(() => useDhcpConsolidationTotalCount())
      expect(result.current.data?.totalCount).toBe(20)
      expect(result.current.isFetching).toBe(false)
    })

    // eslint-disable-next-line max-len
    it('returns 0 as the total count when both dhcpData and edgeDhcpData are undefined', () => {
      mockedDhcpListQuery.mockReturnValueOnce({ data: undefined, isFetching: true })
      mockedEdgeDhcpListQuery.mockReturnValueOnce({ data: undefined, isFetching: false })
      const { result } = renderHook(() => useDhcpConsolidationTotalCount())
      expect(result.current.data?.totalCount).toBe(0)
      expect(result.current.isFetching).toBe(true)
    })

    // eslint-disable-next-line max-len
    it('returns the correct total count when only one of dhcpData or edgeDhcpData has a totalCount property', () => {
      mockedDhcpListQuery.mockReturnValueOnce({ data: { totalCount: 10 }, isFetching: false })
      mockedEdgeDhcpListQuery.mockReturnValueOnce({ data: undefined, isFetching: true })
      const { result } = renderHook(() => useDhcpConsolidationTotalCount())
      expect(result.current.data?.totalCount).toBe(10)
      expect(result.current.isFetching).toBe(true)
    })

    it('should skip the query when isDisabled is true', () => {
      renderHook(() => useDhcpConsolidationTotalCount(true))

      expect(mockedDhcpListQuery).toHaveBeenCalled()
      const [, options] = mockedDhcpListQuery.mock.calls[0]
      expect(options.skip).toBe(true)

      expect(mockedEdgeDhcpListQuery).toHaveBeenCalled()
      const [, edgeOptions] = mockedEdgeDhcpListQuery.mock.calls[0]
      expect(edgeOptions.skip).toBe(true)
    })
  })
})
