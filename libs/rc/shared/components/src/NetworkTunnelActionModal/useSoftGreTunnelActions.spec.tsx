import { rest } from 'msw'

import { useIsSplitOn }                    from '@acx-ui/feature-toggle'
import { softGreApi }                      from '@acx-ui/rc/services'
import { SoftGreUrls }                     from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import { mockServer, renderHook, waitFor } from '@acx-ui/test-utils'

import { mockedSoftGreScopeVenueMap, mockSoftGreScopeNetworkMap, mockSoftGreTable } from './__tests__/fixtures'
import { useGetSoftGreScopeNetworkMap, useGetSoftGreScopeVenueMap }                 from './useSoftGreTunnelActions'

describe('useSoftGreTunnelActions', () => {
  beforeEach(() => {
    store.dispatch(softGreApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(
        SoftGreUrls.getSoftGreViewDataList.url,
        (_, res, ctx) => {
          return res(ctx.json(mockSoftGreTable))
        })
    )}
  )

  it('useGetSoftGreScopeVenueMap', async () => {
    const { result } = renderHook(() => useGetSoftGreScopeVenueMap(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    await waitFor(() => expect(result.current).toEqual(mockedSoftGreScopeVenueMap))
  })

  it('useGetSoftGreScopeNetworkMap', async () => {
    const { result } = renderHook(() => useGetSoftGreScopeNetworkMap('network_1'), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    await waitFor(() => expect(result.current).toEqual(mockSoftGreScopeNetworkMap))
  })

})