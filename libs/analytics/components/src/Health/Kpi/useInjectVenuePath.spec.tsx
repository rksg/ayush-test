import { rest } from 'msw'

import { AnalyticsFilter }                 from '@acx-ui/analytics/utils'
import { CommonUrlsInfo }                  from '@acx-ui/rc/utils'
import { Provider }                        from '@acx-ui/store'
import { mockServer, renderHook, waitFor } from '@acx-ui/test-utils'

import { useInjectVenuePath } from './useInjectVenuePath'

describe('useInjectVenuePath', () => {
  it('should return injected venueId on apPath', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ data: [{ venueId: 'testVenueId' }] }))
      )
    )
    const path = [{ type: 'ap' as 'ap', name: 'testAp' }]
    const filters = {
      path
    } as unknown as AnalyticsFilter
    const { result } = renderHook(() => useInjectVenuePath(filters),
      { wrapper: Provider, route: { params: { tenantId: 'test' }, path: '/:tenantId' } })
    await waitFor(() => expect(result.current).toHaveLength(2))
    await waitFor(() => expect(result.current[0].name).toMatch('testVenueId'))
    await waitFor(() => expect(result.current[0].type).toMatch('zone'))
  })

  it('should return path without injection on non-apPaths', async () => {
    const path = [{ type: 'network' as 'network', name: 'Network' }]
    const filters = {
      path
    } as unknown as AnalyticsFilter
    const { result } = renderHook(() => useInjectVenuePath(filters),
      { wrapper: Provider, route: { params: { tenantId: 'test' }, path: '/:tenantId' } })
    await waitFor(() => expect(result.current).toHaveLength(1))
    await waitFor(() => expect(result.current[0].name).toMatch('Network'))
    await waitFor(() => expect(result.current[0].type).toMatch('network'))
  })
})
