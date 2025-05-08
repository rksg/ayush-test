import { rest } from 'msw'

import { Features, useIsSplitOn }                                                  from '@acx-ui/feature-toggle'
import { AaaUrls, AccessControlUrls, DHCPUrls, DpskUrls, PolicyType, ServiceType } from '@acx-ui/rc/utils'
import { Provider }                                                                from '@acx-ui/store'
import { mockServer, renderHook, waitFor }                                         from '@acx-ui/test-utils'

import { mockedAvailableUnifiedServicesList }  from './__tests__/fixtures'
import { useUnifiedServiceListWithTotalCount } from './useUnifiedServiceListWithTotalCount'


const mockedUseAvailableUnifiedServicesList = jest.fn(() => mockedAvailableUnifiedServicesList)
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useAvailableUnifiedServicesList: () => mockedUseAvailableUnifiedServicesList()
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => ({ tenantId: 'TENANT_ID' }))
}))

describe('useUnifiedServiceListWithTotalCount', () => {

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
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
  it('should return unified services with correct totalCount', async () => {
    const { result } = renderHook(() => useUnifiedServiceListWithTotalCount(),
      { wrapper: Provider })

    await waitFor(() => {
      const aaaService = result.current.find(s => s.type === PolicyType.AAA)
      expect(aaaService?.totalCount).toBe(2)
    })

    const dhcpService = result.current.find(s => s.type === ServiceType.DHCP)
    expect(dhcpService).toBeUndefined()
  })
})
