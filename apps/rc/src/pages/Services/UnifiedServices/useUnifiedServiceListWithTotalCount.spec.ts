import { rest } from 'msw'

import { Features, useIsSplitOn }                                                  from '@acx-ui/feature-toggle'
import { AaaUrls, AccessControlUrls, DHCPUrls, DpskUrls, PolicyType, ServiceType } from '@acx-ui/rc/utils'
import { Provider }                                                                from '@acx-ui/store'
import { mockServer, renderHook, waitFor }                                         from '@acx-ui/test-utils'

import { mockedAvailableUnifiedServicesList }                                       from './__tests__/fixtures'
import { useMdnsProxyConsolidationTotalCount, useUnifiedServiceListWithTotalCount } from './useUnifiedServiceListWithTotalCount'


const mockedUseAvailableUnifiedServicesList = jest.fn(() => mockedAvailableUnifiedServicesList)
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useAvailableUnifiedServicesList: () => mockedUseAvailableUnifiedServicesList()
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => ({ tenantId: 'TENANT_ID' }))
}))

const mockedMdnsProxyListQuery = jest.fn()
const mockedEdgeMdnsProxyListQuery = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  useGetEnhancedMdnsProxyListQuery: (args: any, options: any) => mockedMdnsProxyListQuery(args, options),
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  useGetEdgeMdnsProxyViewDataListQuery: (args: any, options: any) => mockedEdgeMdnsProxyListQuery(args, options)
}))

describe('useUnifiedServiceListWithTotalCount', () => {

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)

    mockedMdnsProxyListQuery.mockReturnValue({ data: undefined, isFetching: false })
    mockedEdgeMdnsProxyListQuery.mockReturnValue({ data: undefined, isFetching: false })
  })

  beforeEach(() => {
    mockServer.use(
      rest.post(
        AaaUrls.queryAAAPolicyList.url,
        (_, res, ctx) => {
          return res(ctx.json({ totalCount: 2, data: [] }))
        }
      ),
      rest.post(
        AccessControlUrls.getAccessControlProfileQueryList.url,
        (_, res, ctx) => res(ctx.json({ totalCount: 1, data: [] }))
      ),
      rest.post(
        DHCPUrls.queryDhcpProfiles.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.get(DpskUrls.getDpskList.url.split('?')[0],
        (_, res, ctx) => res(ctx.json({
          content: [],
          pageable: {
            pageNumber: 0,
            pageSize: 10
          },
          totalElements: 5
        }))
      )
    )
  })

  afterEach(() => {
    mockedMdnsProxyListQuery.mockClear()
    mockedEdgeMdnsProxyListQuery.mockClear()
  })

  it('should return unified services with correct totalCount', async () => {
    const { result } = renderHook(() => useUnifiedServiceListWithTotalCount(),
      { wrapper: Provider })

    await waitFor(() => {
      // eslint-disable-next-line max-len
      const aaaService = result.current.unifiedServiceListWithTotalCount.find(s => s.type === PolicyType.AAA)
      expect(aaaService?.totalCount).toBe(2)
    })

    // eslint-disable-next-line max-len
    const dhcpService = result.current.unifiedServiceListWithTotalCount.find(s => s.type === ServiceType.DHCP)
    expect(dhcpService).toBeUndefined()
  })

  describe('useMdnsProxyConsolidationTotalCount', () => {
    it('returns the correct total count', () => {
      mockedMdnsProxyListQuery.mockReturnValueOnce({ data: { totalCount: 10 }, isFetching: false })
      // eslint-disable-next-line max-len
      mockedEdgeMdnsProxyListQuery.mockReturnValueOnce({ data: { totalCount: 10 }, isFetching: false })
      const { result } = renderHook(() => useMdnsProxyConsolidationTotalCount({}))
      expect(result.current.data?.totalCount).toBe(20)
      expect(result.current.isFetching).toBe(false)
    })

    // eslint-disable-next-line max-len
    it('returns 0 as the total count when both mdnsProxyData and edgeMdnsProxyData are undefined', () => {
      mockedMdnsProxyListQuery.mockReturnValueOnce({ data: undefined, isFetching: true })
      mockedEdgeMdnsProxyListQuery.mockReturnValueOnce({ data: undefined, isFetching: false })
      const { result } = renderHook(() => useMdnsProxyConsolidationTotalCount({}))
      expect(result.current.data?.totalCount).toBe(0)
      expect(result.current.isFetching).toBe(true)
    })

    // eslint-disable-next-line max-len
    it('returns the correct total count when only one of mdnsProxyData or edgeMdnsProxyData has a totalCount property', () => {
      mockedMdnsProxyListQuery.mockReturnValueOnce({ data: { totalCount: 10 }, isFetching: false })
      mockedEdgeMdnsProxyListQuery.mockReturnValueOnce({ data: undefined, isFetching: true })
      const { result } = renderHook(() => useMdnsProxyConsolidationTotalCount({}))
      expect(result.current.data?.totalCount).toBe(10)
      expect(result.current.isFetching).toBe(true)
    })

    it('should skip the query when isDisabled is true', () => {
      renderHook(() => useMdnsProxyConsolidationTotalCount({}, true))

      expect(mockedMdnsProxyListQuery).toHaveBeenCalledWith({}, { skip: true })
      expect(mockedEdgeMdnsProxyListQuery).toHaveBeenCalledWith({}, { skip: true })
    })
  })
})
