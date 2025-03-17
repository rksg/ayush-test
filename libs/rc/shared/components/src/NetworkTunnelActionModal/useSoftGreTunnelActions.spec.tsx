import { rest } from 'msw'

import { useIsSplitOn }                    from '@acx-ui/feature-toggle'
import { softGreApi }                      from '@acx-ui/rc/services'
import { SoftGreUrls }                     from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import { mockServer, renderHook, waitFor } from '@acx-ui/test-utils'
import { RequestPayload }                  from '@acx-ui/types'

import { mockedSoftGreScopeVenueMap, mockSoftGreScopeNetworkMap, mockSoftGreTable }          from './__tests__/fixtures'
import { NetworkTunnelActionForm, NetworkTunnelTypeEnum }                                    from './types'
import { useGetSoftGreScopeNetworkMap, useGetSoftGreScopeVenueMap, useSoftGreTunnelActions } from './useSoftGreTunnelActions'


const mockedActivateSoftGre = jest.fn()
const mockedDeactivateSoftGre = jest.fn()
const mockedActivateIpsec = jest.fn()
const mockedDeactivateIpsec = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useActivateSoftGreMutation: jest.fn().mockImplementation(() => [mockedActivateSoftGre]),
  useDectivateSoftGreMutation: jest.fn().mockImplementation(() => [mockedDeactivateSoftGre]),
  useActivateIpsecMutation: jest.fn().mockImplementation(() => [mockedActivateIpsec]),
  useDectivateIpsecMutation: jest.fn().mockImplementation(() => [mockedDeactivateIpsec])
}))

describe('useSoftGreTunnelActions', () => {

  beforeEach(() => {
    store.dispatch(softGreApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    mockedActivateSoftGre.mockImplementation((req: RequestPayload) => {
      return { unwrap: () => new Promise((resolve) => {
        resolve(true)
        setTimeout(() => {
          (req.callback as Function)({
            response: { id: 'mocked_service_id' }
          })
        }, 300)
      }) }
    })
    mockedDeactivateSoftGre.mockImplementation((req: RequestPayload) => {
      return { unwrap: () => new Promise((resolve) => {
        resolve(true)
        setTimeout(() => {
          (req.callback as Function)({
            response: { id: 'mocked_service_id' }
          })
        }, 300)
      }) }
    })

    mockedActivateIpsec.mockImplementation((req: RequestPayload) => {
      return { unwrap: () => new Promise((resolve) => {
        resolve(true)
        setTimeout(() => {
          (req.callback as Function)({
            response: { id: 'mocked_service_id' }
          })
        }, 300)
      }) }
    })
    mockedDeactivateIpsec.mockImplementation((req: RequestPayload) => {
      return { unwrap: () => new Promise((resolve) => {
        resolve(true)
        setTimeout(() => {
          (req.callback as Function)({
            response: { id: 'mocked_service_id' }
          })
        }, 300)
      }) }
    })

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

    it('activateSoftGreTunnel failed', async () => {
      jest.mocked(mockedActivateSoftGre).mockImplementation(() => {
        return [() => {
          return { unwrap: () => new Promise((_resolve, reject) => {
            reject()
          }) }
        }]
      })
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

      let isFailed = false
      try {
        await result.current.activateSoftGreTunnel(venueId, networkId, formValues)
      } catch(err) {
        isFailed = true
      }

      expect(isFailed).toBe(true)
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

  describe('IpSecOverSoftGre actions', () => {
    const venueId = 'venue_1'
    const networkId = 'network_1'
    it('activateIpSecOverSoftGre', async () => {
      const formValues = {
        tunnelType: NetworkTunnelTypeEnum.SoftGre,
        sdLan: { isGuestTunnelEnabled: false },
        softGre: {
          newProfileId: 'softGre_profile_1',
          newProfileName: 'softGre_profile_name_1'
        },
        ipsec: {
          enableIpsec: true,
          newProfileId: 'profile_1',
          newProfileName: 'ipsec_profile_name_1',
          oldProfileId: 'profile_2'
        }
      } as NetworkTunnelActionForm
      const { result } = renderHook(() => useSoftGreTunnelActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      await result.current.activateIpSecOverSoftGre(venueId, networkId, formValues)
      expect(mockedActivateIpsec).toHaveBeenCalled()
    })

    it('activateIpSecOverSoftGre failed', async () => {
      jest.mocked(mockedActivateIpsec).mockImplementation(() => {
        return [() => {
          return { unwrap: () => new Promise((_resolve, reject) => {
            reject()
          }) }
        }]
      })
      const formValues = {
        tunnelType: NetworkTunnelTypeEnum.SoftGre,
        sdLan: { isGuestTunnelEnabled: false },
        softGre: {
          newProfileId: 'softGre_profile_1',
          newProfileName: 'softGre_profile_name_1'
        },
        ipsec: {
          enableIpsec: true,
          newProfileId: 'ipsec_profile_1',
          newProfileName: 'ipsec_profile_name_1',
          oldProfileId: 'profile_2'
        }
      } as NetworkTunnelActionForm
      const { result } = renderHook(() => useSoftGreTunnelActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      let isFailed = false
      try {
        await result.current.activateIpSecOverSoftGre(venueId, networkId, formValues)
      } catch(err) {
        isFailed = true
      }

      expect(isFailed).toBe(true)
    })

    it('deactivateIpSecOverSoftGre', async () => {
      const formValues = {
        tunnelType: NetworkTunnelTypeEnum.None,
        sdLan: { isGuestTunnelEnabled: false },
        softGre: {
          newProfileId: 'softGre_profile_1',
          newProfileName: 'softGre_profile_name_1'
        },
        ipsec: {
          enableIpsec: true,
          newProfileId: '',
          newProfileName: '',
          oldProfileId: 'profile_2'
        }
      } as NetworkTunnelActionForm
      const { result } = renderHook(() => useSoftGreTunnelActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      await result.current.deactivateIpSecOverSoftGre(venueId, networkId, formValues)
      expect(mockedDeactivateIpsec).toHaveBeenCalled()
    })
  })
})