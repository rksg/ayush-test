import { rest } from 'msw'

import { useIsSplitOn }                    from '@acx-ui/feature-toggle'
import { softGreApi }                      from '@acx-ui/rc/services'
import { SoftGreUrls }                     from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import { mockServer, renderHook, waitFor } from '@acx-ui/test-utils'

import { mockedSoftGreScopeVenueMap, mockSoftGreScopeNetworkMap, mockSoftGreTable }          from './__tests__/fixtures'
import { NetworkTunnelActionForm, NetworkTunnelTypeEnum }                                    from './types'
import { useGetSoftGreScopeNetworkMap, useGetSoftGreScopeVenueMap, useSoftGreTunnelActions } from './useSoftGreTunnelActions'

describe('useSoftGreTunnelActions', () => {
  const mockedActivateSoftGre = jest.fn()
  const mockedDeactivateSoftGre = jest.fn()
  beforeEach(() => {
    store.dispatch(softGreApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockedActivateSoftGre.mockClear()
    mockedDeactivateSoftGre.mockClear()
    mockServer.use(
      rest.post(
        SoftGreUrls.getSoftGreViewDataList.url,
        (_, res, ctx) => {
          return res(ctx.json(mockSoftGreTable))
        }),
      rest.put(
        SoftGreUrls.activateSoftGre.url,
        (_, res, ctx) => {
          mockedActivateSoftGre()
          return res(ctx.status(202))
        }),
      rest.delete(
        SoftGreUrls.dectivateSoftGre.url,
        (_, res, ctx) => {
          mockedDeactivateSoftGre()
          return res(ctx.status(202))
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

  describe('useSoftGreTunnelActions actions', () => {
    const venueId = 'venue_1'
    const networkId = 'network_1'
    it('activateSoftGreTunnel', async () => {
      const formValues = {
        tunnelType: NetworkTunnelTypeEnum.SoftGre,
        sdLan: { isGuestTunnelEnabled: false },
        softGre: { newProfileId: 'profile_1',
          newProfileName: 'profile_name_1',
          oldProfileId: 'profile_2'
        }
      } as NetworkTunnelActionForm
      const { result } = renderHook(() => useSoftGreTunnelActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      await result.current.activateSoftGreTunnel(venueId, networkId, formValues)
      expect(mockedActivateSoftGre).toHaveBeenCalled()
    })

    it('dectivateSoftGreTunnel', async () => {
      const formValues = {
        tunnelType: NetworkTunnelTypeEnum.None,
        sdLan: { isGuestTunnelEnabled: false },
        softGre: { newProfileId: '',
          newProfileName: '',
          oldProfileId: 'profile_2'
        }
      } as NetworkTunnelActionForm
      const { result } = renderHook(() => useSoftGreTunnelActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      await result.current.dectivateSoftGreTunnel(venueId, networkId, formValues)
      expect(mockedDeactivateSoftGre).toHaveBeenCalled()
    })
  })

})