import userEvent              from '@testing-library/user-event'
import { groupBy, cloneDeep } from 'lodash'
import { rest }               from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { edgeSdLanApi }           from '@acx-ui/rc/services'
import {
  EdgeSdLanUrls,
  EdgeSdLanSettingP2,
  CommonErrorsResult,
  CatchErrorDetails,
  EdgeSdLanFixtures,
  EdgeMvSdLanExtended
} from '@acx-ui/rc/utils'
import { Provider, store }                         from '@acx-ui/store'
import { mockServer, renderHook, waitFor, screen } from '@acx-ui/test-utils'
import { RequestPayload }                          from '@acx-ui/types'

import {
  useGetEdgeSdLanByEdgeOrClusterId,
  checkSdLanScopedNetworkDeactivateAction,
  useEdgeSdLanActions,
  useSdLanScopedVenueNetworks,
  useSdLanScopedNetworkVenues,
  useEdgeMvSdLanActions
} from './useEdgeSdLanActions'

const { mockedSdLanDataListP2, mockedMvSdLanDataList } = EdgeSdLanFixtures
const mockedCallback = jest.fn()
const mockedActivateEdgeSdLanDmzClusterReq = jest.fn()
const mockedDeactivateEdgeSdLanDmzClusterReq = jest.fn()
const mockedActivateDmzTunnelReq = jest.fn()
const mockedDeactivateDmzTunnelReq = jest.fn()
const mockedActivateNetworkReq = jest.fn()
const mockedDeactivateNetworkReq = jest.fn()
const mockedToggleDmzReq = jest.fn()
const mockedUpdateReq = jest.fn()

const mockedActivateMvNetworkReq = jest.fn()
const mockedDeactivateMvNetworkReq = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useAddEdgeMvSdLanMutation: () => {
    return [(req: RequestPayload) => {
      return { unwrap: () => new Promise((resolve) => {
        resolve(true)
        setTimeout(() => {
          (req.callback as Function)({
            response: { id: 'mocked_service_id' }
          })
        }, 300)
      }) }
    }]
  },
  useAddEdgeSdLanP2Mutation: () => {
    return [(req: RequestPayload) => {
      return { unwrap: () => new Promise((resolve) => {
        resolve(true)
        setTimeout(() => {
          (req.callback as Function)({
            response: { id: 'mocked_service_id' }
          })
        }, 300)
      }) }
    }]
  }
}))

describe('useEdgeMvSdLanActions', () => {
  beforeEach(() => {
    store.dispatch(edgeSdLanApi.util.resetApiState())

    mockedCallback.mockClear()
    mockedActivateEdgeSdLanDmzClusterReq.mockClear()
    mockedDeactivateEdgeSdLanDmzClusterReq.mockClear()
    mockedActivateDmzTunnelReq.mockClear()
    mockedDeactivateDmzTunnelReq.mockClear()
    mockedActivateMvNetworkReq.mockClear()
    mockedDeactivateMvNetworkReq.mockClear()
    mockedToggleDmzReq.mockClear()
    mockedUpdateReq.mockClear()

    mockServer.use(
      rest.patch(
        EdgeSdLanUrls.updateEdgeSdLanPartial.url,
        (req, res, ctx) => {
          mockedUpdateReq(req.body)
          return res(ctx.status(202))
        }
      ),
      rest.put(
        EdgeSdLanUrls.activateEdgeSdLanDmzCluster.url,
        (req, res, ctx) => {
          mockedActivateEdgeSdLanDmzClusterReq(req.params)
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeSdLanUrls.deactivateEdgeSdLanDmzCluster.url,
        (req, res, ctx) => {
          mockedDeactivateEdgeSdLanDmzClusterReq(req.params)
          return res(ctx.status(202))
        }
      ),
      rest.put(
        EdgeSdLanUrls.activateEdgeSdLanDmzTunnelProfile.url,
        (req, res, ctx) => {
          mockedActivateDmzTunnelReq(req.params)
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeSdLanUrls.deactivateEdgeSdLanDmzTunnelProfile.url,
        (req, res, ctx) => {
          mockedDeactivateDmzTunnelReq(req.params)
          return res(ctx.status(202))
        }
      ),
      rest.put(
        EdgeSdLanUrls.activateEdgeMvSdLanNetwork.url,
        (req, res, ctx) => {
          mockedActivateMvNetworkReq(req.params, req.body)
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeSdLanUrls.deactivateEdgeMvSdLanNetwork.url,
        (req, res, ctx) => {
          mockedDeactivateMvNetworkReq(req.params)
          return res(ctx.status(202))
        }
      ),
      rest.patch(
        EdgeSdLanUrls.toggleEdgeSdLanDmz.url,
        (req, res, ctx) => {
          mockedToggleDmzReq(req.params, req.body)
          return res(ctx.status(202))
        }
      )
    )
  })
  describe('addSdLan', () => {
    const mockedAddData = {
      name: 'testAddDMZSdLanService',
      venueId: 'mocked_venue_id',
      edgeClusterId: '0000000002',
      networks: { mocked_venue_id: ['network_1'] },
      tunnelProfileId: 't-tunnelProfile-id',
      isGuestTunnelEnabled: true,
      guestEdgeClusterId: '0000000005',
      guestEdgeClusterVenueId: 'mocked_venue_id',
      guestTunnelProfileId: 't-tunnelProfile-id-2',
      guestNetworks: { mocked_venue_id: ['network_1'] }
    } as EdgeMvSdLanExtended

    it('should add guest settings successfully', async () => {
      const mockedData = {
        ...mockedAddData,
        networks: { mocked_venue_id: ['network_1', 'network_3'] }
      }
      const { result } = renderHook(() => useEdgeMvSdLanActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { addEdgeSdLan } = result.current
      await addEdgeSdLan({
        payload: mockedData,
        callback: mockedCallback
      })
      await waitFor(() =>
        expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledWith({
          edgeClusterId: '0000000005',
          serviceId: 'mocked_service_id',
          venueId: 'mocked_venue_id'
        }))
      expect(mockedToggleDmzReq).not.toBeCalled()
      await waitFor(() =>
        expect(mockedActivateDmzTunnelReq).toBeCalledWith({
          tunnelProfileId: 't-tunnelProfile-id-2',
          serviceId: 'mocked_service_id'
        }))
      await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
      expect(mockedToggleDmzReq).toBeCalledWith({
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelEnabled: true })

      expect(mockedActivateMvNetworkReq).toBeCalledTimes(2)
      expect(mockedActivateMvNetworkReq).toBeCalledWith({
        venueId: 'mocked_venue_id',
        wifiNetworkId: 'network_3',
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelUtilized: false })
      expect(mockedActivateMvNetworkReq).toBeCalledWith({
        venueId: 'mocked_venue_id',
        wifiNetworkId: 'network_1',
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelUtilized: true })
    })

    it('should not trigger guest settings when it not enabled', async () => {
      const mockData = cloneDeep(mockedAddData)
      mockData.isGuestTunnelEnabled = false
      const { result } = renderHook(() => useEdgeMvSdLanActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { addEdgeSdLan } = result.current
      await addEdgeSdLan({
        payload: mockData,
        callback: mockedCallback
      })

      await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
      expect(mockedToggleDmzReq).toBeCalledTimes(0)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedActivateMvNetworkReq).toBeCalledTimes(1)
      expect(mockedActivateMvNetworkReq).toBeCalledWith({
        venueId: 'mocked_venue_id',
        wifiNetworkId: 'network_1',
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelUtilized: false })
    })

    it('should not send guest tunnel enabled request when mandatory request failed', async () => {
      const mockedDMZClusterReq = jest.fn()
      mockServer.use(
        rest.put(
          EdgeSdLanUrls.activateEdgeSdLanDmzCluster.url,
          (req, res, ctx) => {
            mockedDMZClusterReq(req.params)
            return res(ctx.status(403), ctx.json({
              requestId: 'failed_req_id',
              errors: [{
                code: 'EDGE-00000',
                message: 'test failed'
              }]
            }))
          }
        ))

      const mockedCallbackInnerFn = jest.fn()
      const mockedCBFn = jest.fn()
        .mockImplementation((response: CommonErrorsResult<CatchErrorDetails>) => {
          mockedCallbackInnerFn(response.data.errors[0].code)
        })
      const { result } = renderHook(() => useEdgeMvSdLanActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { addEdgeSdLan } = result.current
      await addEdgeSdLan({
        payload: mockedAddData,
        callback: mockedCBFn
      })

      await waitFor(() => expect(mockedCBFn).toBeCalledTimes(1))
      expect(mockedCallbackInnerFn).toBeCalledWith('EDGE-00000')
      expect(mockedDMZClusterReq).toBeCalledWith({
        edgeClusterId: '0000000005',
        serviceId: 'mocked_service_id',
        venueId: 'mocked_venue_id'
      })
      // other mandatory field is trigger at same time.
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(1)
      expect(mockedToggleDmzReq).toBeCalledTimes(0)
      expect(mockedActivateMvNetworkReq).toBeCalledTimes(0)
    })
  })

  describe('editSdLan', () => {
    const mockedEditData = {
      id: 'mocked_service_id',
      name: 'testEditDMZSdLanService',
      venueId: 'mocked_venue_id',
      edgeClusterId: '0000000002',
      networks: { mocked_venue_id: ['network_4'] },
      tunnelProfileId: 't-tunnelProfile-id',
      isGuestTunnelEnabled: true,
      guestEdgeClusterId: '0000000003',
      guestEdgeClusterVenueId: 'mocked_venue_id',
      guestTunnelProfileId: 't-tunnelProfile-id-2',
      guestNetworks: { mocked_venue_id: ['network_4'] }
    } as EdgeMvSdLanExtended

    // eslint-disable-next-line max-len
    const prepareTesting = async (originData: EdgeMvSdLanExtended, submitData: EdgeMvSdLanExtended) => {
      const { result } = renderHook(() => useEdgeMvSdLanActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { editEdgeSdLan } = result.current
      await editEdgeSdLan(originData, {
        payload: submitData,
        callback: mockedCallback
      })
    }

    it('should edit guest settings successfully', async () => {
      const mockedData = cloneDeep(mockedEditData)
      const mockedPayload = {
        ...mockedData,
        networks: { mocked_venue_id: ['network_4', 'network_5'] },
        guestTunnelProfileId: 't-tunnelProfile-id-3',
        guestNetworks: { mocked_venue_id: ['network_4','network_5'] }
      }

      await prepareTesting(mockedData,mockedPayload)

      // handle dmz tunnel changes
      await waitFor(() => expect(mockedActivateDmzTunnelReq).toBeCalledWith({
        tunnelProfileId: 't-tunnelProfile-id-3',
        serviceId: 'mocked_service_id'
      }))

      // should activate guest network
      expect(mockedActivateMvNetworkReq).toBeCalledTimes(1)
      expect(mockedActivateMvNetworkReq).toBeCalledWith({
        venueId: 'mocked_venue_id',
        wifiNetworkId: 'network_5',
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelUtilized: true })

      expect(mockedCallback).toBeCalledTimes(1)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedDeactivateMvNetworkReq).toBeCalledTimes(0)
      expect(mockedToggleDmzReq).toBeCalledTimes(0)
    })

    it('change DC to DMZ scenario', async () => {
      const mockedData = cloneDeep(mockedEditData)
      mockedData.isGuestTunnelEnabled = false
      mockedData.guestEdgeClusterId = ''
      mockedData.guestTunnelProfileId = ''
      mockedData.guestNetworks = {}
      const mockedPayload = {
        ...mockedData,
        isGuestTunnelEnabled: true,
        networks: { mocked_venue_id: ['network_1', 'network_3'] },
        guestEdgeClusterId: '0000000003',
        guestTunnelProfileId: 't-tunnelProfile-id-3',
        guestNetworks: { mocked_venue_id: ['network_1','network_3'] }
      }

      await prepareTesting(mockedData,mockedPayload)

      await waitFor(() => expect(mockedToggleDmzReq).toBeCalledTimes(1))
      expect(mockedToggleDmzReq).toBeCalledWith({
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelEnabled: true })

      expect(mockedCallback).toBeCalledTimes(1)
      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(1)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledWith({
        edgeClusterId: '0000000003',
        serviceId: 'mocked_service_id',
        venueId: 'mocked_venue_id'
      })
      expect(mockedDeactivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedActivateDmzTunnelReq).toBeCalledWith({
        tunnelProfileId: 't-tunnelProfile-id-3',
        serviceId: 'mocked_service_id'
      })
      expect(mockedDeactivateMvNetworkReq).toBeCalledTimes(1)
      expect(mockedDeactivateMvNetworkReq).toBeCalledWith({
        venueId: 'mocked_venue_id',
        wifiNetworkId: 'network_4',
        serviceId: 'mocked_service_id'
      })
      expect(mockedActivateMvNetworkReq).toBeCalledTimes(2)
      Object.entries(mockedPayload.guestNetworks).forEach(([venueId, networkIds]) => {
        networkIds.forEach(network => {
          expect(mockedActivateMvNetworkReq).toBeCalledWith({
            venueId,
            wifiNetworkId: network,
            serviceId: 'mocked_service_id'
          }, { isGuestTunnelUtilized: true })
        })
      })
    })

    it('should only deactivate dmz network and activate dc network', async () => {
      const mockedData = cloneDeep(mockedEditData)
      const mockedPayload = {
        ...mockedData,
        networks: { mocked_venue_id: ['network_4','network_3'] },
        guestTunnelProfileId: 't-tunnelProfile-id-2',
        guestNetworks: {}
      }

      await prepareTesting(mockedData, mockedPayload)

      await waitFor(() => expect(mockedActivateMvNetworkReq).toBeCalledTimes(2))
      expect(mockedCallback).toBeCalledTimes(1)
      expect(mockedToggleDmzReq).toBeCalledTimes(0)
      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedDeactivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateMvNetworkReq).toBeCalledTimes(0)

      Object.entries(mockedPayload.networks).forEach(([venueId, networkIds]) => {
        networkIds.forEach(network => {
          expect(mockedActivateMvNetworkReq).toBeCalledWith({
            venueId,
            wifiNetworkId: network,
            serviceId: 'mocked_service_id'
          }, { isGuestTunnelUtilized: false })
        })
      })
    })

    it('should only enable dmz when change from DC again', async () => {
      const mockedData = cloneDeep(mockedEditData)
      mockedData.isGuestTunnelEnabled = false
      const mockedPayload = {
        ...mockedData,
        isGuestTunnelEnabled: true
      }

      await prepareTesting(mockedData, mockedPayload)

      await waitFor(() => expect(mockedToggleDmzReq).toBeCalledWith({
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelEnabled: true }))
      expect(mockedCallback).toBeCalledTimes(1)
      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateMvNetworkReq).toBeCalledTimes(0)
      expect(mockedActivateMvNetworkReq).toBeCalledTimes(0)
    })

    // eslint-disable-next-line max-len
    it('should only activate dmz tunnel when change from DC again and it is originaly empty', async () => {
      const mockedData = cloneDeep(mockedEditData)
      mockedData.isGuestTunnelEnabled = false
      mockedData.guestTunnelProfileId = ''
      const mockedPayload = {
        ...mockedData,
        isGuestTunnelEnabled: true,
        guestTunnelProfileId: 'mock_guestTunnelId'
      }

      await prepareTesting(mockedData, mockedPayload)

      await waitFor(() => expect(mockedToggleDmzReq).toBeCalledWith({
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelEnabled: true }))
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(1)
      expect(mockedActivateDmzTunnelReq).toBeCalledWith({
        serviceId: mockedPayload.id,
        tunnelProfileId: mockedPayload.guestTunnelProfileId
      })
      expect(mockedCallback).toBeCalledTimes(1)
      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedDeactivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateMvNetworkReq).toBeCalledTimes(0)
      expect(mockedActivateMvNetworkReq).toBeCalledTimes(0)
    })

    it('should be able to change dmz cluster', async () => {
      const mockedData = cloneDeep(mockedEditData)
      const mockedPayload = {
        ...mockedData,
        guestEdgeClusterId: '0000000005'
      }

      await prepareTesting(mockedData, mockedPayload)

      await waitFor(() => expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(1))
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledWith({
        edgeClusterId: '0000000005',
        serviceId: 'mocked_service_id',
        venueId: 'mocked_venue_id'
      })
      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedToggleDmzReq).toBeCalledTimes(0)
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedCallback).toBeCalledTimes(1)
      expect(mockedDeactivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateMvNetworkReq).toBeCalledTimes(0)
      expect(mockedActivateMvNetworkReq).toBeCalledTimes(0)
    })

    it('should be able to change dmz cluster when change from DC to DMZ', async () => {
      const mockedData = cloneDeep(mockedEditData)
      mockedData.isGuestTunnelEnabled = false
      const mockedPayload = {
        ...mockedData,
        isGuestTunnelEnabled: true,
        guestEdgeClusterId: '0000000005'
      }

      await prepareTesting(mockedData, mockedPayload)

      await waitFor(() => expect(mockedToggleDmzReq).toBeCalledWith({
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelEnabled: true }))
      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(1)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledWith({
        edgeClusterId: '0000000005',
        serviceId: 'mocked_service_id',
        venueId: 'mocked_venue_id'
      })
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedCallback).toBeCalledTimes(1)
      expect(mockedDeactivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateMvNetworkReq).toBeCalledTimes(0)
      expect(mockedActivateMvNetworkReq).toBeCalledTimes(0)
    })

    it('should skip update porfile when no change', async () => {
      const mockedData = cloneDeep(mockedEditData)
      mockedData.isGuestTunnelEnabled = false
      const mockedPayload = {
        ...mockedData,
        networks: { mocked_venue_id: ['network_4','network_3'] },
        isGuestTunnelEnabled: true
      }

      await prepareTesting(mockedData, mockedPayload)

      await waitFor(() => expect(mockedToggleDmzReq).toBeCalledWith({
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelEnabled: true }))

      expect(mockedUpdateReq).toBeCalledTimes(0)
      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateMvNetworkReq).toBeCalledTimes(0)
      expect(mockedActivateMvNetworkReq).toBeCalledTimes(1)
      expect(mockedActivateMvNetworkReq).toBeCalledWith({
        venueId: 'mocked_venue_id',
        wifiNetworkId: 'network_3',
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelUtilized: false })
      expect(mockedCallback).toBeCalledTimes(1)
    })

    it('should update porfile name', async () => {
      const mockedData = cloneDeep(mockedEditData)
      mockedData.name = 'newTestName'

      await prepareTesting(mockedEditData, mockedData)

      await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
      expect(mockedUpdateReq).toBeCalledTimes(1)
      expect(mockedToggleDmzReq).toBeCalledTimes(0)
      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateMvNetworkReq).toBeCalledTimes(0)
      expect(mockedActivateMvNetworkReq).toBeCalledTimes(0)
    })

    it('should handle relation requests failed', async () => {
      const mockedReq = jest.fn()
      mockServer.use(
        rest.put(
          EdgeSdLanUrls.activateEdgeMvSdLanNetwork.url,
          (req, res, ctx) => {
            mockedReq(req.params)
            return res(ctx.status(403), ctx.json({
              requestId: 'failed_req_id',
              errors: [{
                code: 'EDGE-00000',
                message: 'test failed'
              }]
            }))
          }
        ))

      const mockedCBFn = jest.fn()
      const mockedPayload = {
        ...mockedEditData,
        networks: { mocked_venue_id: ['network_1', 'network_3'] },
        guestNetworks: { mocked_venue_id: ['network_1','network_3'] }
      }
      const { result } = renderHook(() => useEdgeMvSdLanActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      const { editEdgeSdLan } = result.current
      let errResult
      try {
        await editEdgeSdLan(mockedEditData, {
          payload: mockedPayload,
          callback: mockedCBFn
        })
      } catch(err) {
        errResult = (err as CommonErrorsResult<CatchErrorDetails>).data.errors[0].code
      }

      expect(errResult).toBe('EDGE-00000')
      expect(mockedReq).toBeCalledWith({
        venueId: 'mocked_venue_id',
        serviceId: 'mocked_service_id',
        wifiNetworkId: 'network_1'
      })
      expect(mockedCBFn).toBeCalledTimes(0)
      expect(mockedReq).toBeCalledWith({
        venueId: 'mocked_venue_id',
        serviceId: 'mocked_service_id',
        wifiNetworkId: 'network_3'
      })
    })

    it('should handle profile update failed', async () => {
      const mockedCBFn = jest.fn()
      mockServer.use(
        rest.patch(
          EdgeSdLanUrls.updateEdgeSdLanPartial.url,
          (_req, res, ctx) => {
            return res(ctx.text('test rename failed'), ctx.status(500))
          }
        )
      )
      const { result } = renderHook(() => useEdgeMvSdLanActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      const { editEdgeSdLan } = result.current
      let errResult
      try {
        await editEdgeSdLan(mockedEditData, {
          payload: {
            ...mockedEditData,
            name: 'testRename'
          },
          callback: mockedCBFn
        })
      } catch(err) {
        errResult = err
      }

      await waitFor(() => expect(mockedCBFn).toBeCalledTimes(1))
      expect(errResult.data).toBe('test rename failed')
    })
  })
})

describe('useEdgeSdLanActions', () => {
  beforeEach(() => {
    store.dispatch(edgeSdLanApi.util.resetApiState())
    mockedCallback.mockClear()
    mockedActivateEdgeSdLanDmzClusterReq.mockClear()
    mockedDeactivateEdgeSdLanDmzClusterReq.mockClear()
    mockedActivateDmzTunnelReq.mockClear()
    mockedDeactivateDmzTunnelReq.mockClear()
    mockedActivateNetworkReq.mockClear()
    mockedDeactivateNetworkReq.mockClear()
    mockedToggleDmzReq.mockClear()
    mockedUpdateReq.mockClear()

    mockServer.use(
      rest.patch(
        EdgeSdLanUrls.updateEdgeSdLanPartial.url,
        (req, res, ctx) => {
          mockedUpdateReq(req.body)
          return res(ctx.status(202))
        }
      ),
      rest.put(
        EdgeSdLanUrls.activateEdgeSdLanDmzCluster.url,
        (req, res, ctx) => {
          mockedActivateEdgeSdLanDmzClusterReq(req.params)
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeSdLanUrls.deactivateEdgeSdLanDmzCluster.url,
        (req, res, ctx) => {
          mockedDeactivateEdgeSdLanDmzClusterReq(req.params)
          return res(ctx.status(202))
        }
      ),
      rest.put(
        EdgeSdLanUrls.activateEdgeSdLanDmzTunnelProfile.url,
        (req, res, ctx) => {
          mockedActivateDmzTunnelReq(req.params)
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeSdLanUrls.deactivateEdgeSdLanDmzTunnelProfile.url,
        (req, res, ctx) => {
          mockedDeactivateDmzTunnelReq(req.params)
          return res(ctx.status(202))
        }
      ),
      rest.put(
        EdgeSdLanUrls.activateEdgeSdLanNetwork.url,
        (req, res, ctx) => {
          mockedActivateNetworkReq(req.params, req.body)
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeSdLanUrls.deactivateEdgeSdLanNetwork.url,
        (req, res, ctx) => {
          mockedDeactivateNetworkReq(req.params)
          return res(ctx.status(202))
        }
      ),
      rest.patch(
        EdgeSdLanUrls.toggleEdgeSdLanDmz.url,
        (req, res, ctx) => {
          mockedToggleDmzReq(req.params, req.body)
          return res(ctx.status(202))
        }
      )
    )
  })
  describe('addSdLan', () => {
    const mockedAddData = {
      name: 'testAddDMZSdLanService',
      venueId: 'mocked_venue_id',
      edgeClusterId: '0000000002',
      networkIds: ['network_1'],
      tunnelProfileId: 't-tunnelProfile-id',
      isGuestTunnelEnabled: true,
      guestEdgeClusterId: '0000000005',
      guestTunnelProfileId: 't-tunnelProfile-id-2',
      guestNetworkIds: ['network_1']
    } as EdgeSdLanSettingP2

    it('should add guest settings successfully', async () => {
      const mockedData = {
        ...mockedAddData,
        networkIds: ['network_1', 'network_3']
      }
      const { result } = renderHook(() => useEdgeSdLanActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { addEdgeSdLan } = result.current
      await addEdgeSdLan({
        payload: mockedData,
        callback: mockedCallback
      })
      await waitFor(() =>
        expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledWith({
          edgeClusterId: '0000000005',
          serviceId: 'mocked_service_id',
          venueId: 'mocked_venue_id'
        }))
      expect(mockedToggleDmzReq).not.toBeCalled()
      await waitFor(() =>
        expect(mockedActivateDmzTunnelReq).toBeCalledWith({
          tunnelProfileId: 't-tunnelProfile-id-2',
          serviceId: 'mocked_service_id'
        }))
      await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
      expect(mockedToggleDmzReq).toBeCalledWith({
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelEnabled: true })

      expect(mockedActivateNetworkReq).toBeCalledTimes(2)
      expect(mockedActivateNetworkReq).toBeCalledWith({
        wifiNetworkId: 'network_3',
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelUtilized: false })
      expect(mockedActivateNetworkReq).toBeCalledWith({
        wifiNetworkId: 'network_1',
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelUtilized: true })
    })

    it('should not trigger guest settings when it not enabled', async () => {
      const mockData = cloneDeep(mockedAddData)
      mockData.isGuestTunnelEnabled = false
      const { result } = renderHook(() => useEdgeSdLanActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { addEdgeSdLan } = result.current
      await addEdgeSdLan({
        payload: mockData,
        callback: mockedCallback
      })

      await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
      expect(mockedToggleDmzReq).toBeCalledTimes(0)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedActivateNetworkReq).toBeCalledTimes(1)
      expect(mockedActivateNetworkReq).toBeCalledWith({
        wifiNetworkId: 'network_1',
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelUtilized: false })
    })

    it('should not send guest tunnel enabled request when mandatory request failed', async () => {
      const mockedDMZClusterReq = jest.fn()
      mockServer.use(
        rest.put(
          EdgeSdLanUrls.activateEdgeSdLanDmzCluster.url,
          (req, res, ctx) => {
            mockedDMZClusterReq(req.params)
            return res(ctx.status(403), ctx.json({
              requestId: 'failed_req_id',
              errors: [{
                code: 'EDGE-00000',
                message: 'test failed'
              }]
            }))
          }
        ))

      const mockedCallbackInnerFn = jest.fn()
      const mockedCBFn = jest.fn()
        .mockImplementation((response: CommonErrorsResult<CatchErrorDetails>) => {
          mockedCallbackInnerFn(response.data.errors[0].code)
        })
      const { result } = renderHook(() => useEdgeSdLanActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { addEdgeSdLan } = result.current
      await addEdgeSdLan({
        payload: mockedAddData,
        callback: mockedCBFn
      })

      await waitFor(() => expect(mockedCBFn).toBeCalledTimes(1))
      expect(mockedCallbackInnerFn).toBeCalledWith('EDGE-00000')
      expect(mockedDMZClusterReq).toBeCalledWith({
        edgeClusterId: '0000000005',
        serviceId: 'mocked_service_id',
        venueId: 'mocked_venue_id'
      })
      // other mandatory field is trigger at same time.
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(1)
      expect(mockedToggleDmzReq).toBeCalledTimes(0)
      expect(mockedActivateNetworkReq).toBeCalledTimes(0)
    })
  })

  describe('editSdLan', () => {
    const mockedEditData = {
      id: 'mocked_service_id',
      name: 'testEditDMZSdLanService',
      venueId: 'mocked_venue_id',
      edgeClusterId: '0000000002',
      networkIds: ['network_4'],
      tunnelProfileId: 't-tunnelProfile-id',
      isGuestTunnelEnabled: true,
      guestEdgeClusterId: '0000000003',
      guestTunnelProfileId: 't-tunnelProfile-id-2',
      guestNetworkIds: ['network_4']
    } as EdgeSdLanSettingP2

    const prepareTest = async (originData: EdgeSdLanSettingP2, submitData: EdgeSdLanSettingP2) => {
      const { result } = renderHook(() => useEdgeSdLanActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { editEdgeSdLan } = result.current
      await editEdgeSdLan(originData, {
        payload: submitData,
        callback: mockedCallback
      })
    }

    it('should edit guest settings successfully', async () => {
      const mockedData = cloneDeep(mockedEditData)
      const mockedPayload = {
        ...mockedData,
        networkIds: ['network_4', 'network_5'],
        guestTunnelProfileId: 't-tunnelProfile-id-3',
        guestNetworkIds: ['network_4','network_5']
      }

      await prepareTest(mockedData, mockedPayload)
      await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
      expect(mockedUpdateReq).toBeCalledTimes(0)
      // handle dmz tunnel changes
      expect(mockedActivateDmzTunnelReq).toBeCalledWith({
        tunnelProfileId: 't-tunnelProfile-id-3',
        serviceId: 'mocked_service_id'
      })

      // should activate guest network
      expect(mockedActivateNetworkReq).toBeCalledTimes(1)
      expect(mockedActivateNetworkReq).toBeCalledWith({
        wifiNetworkId: 'network_5',
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelUtilized: true })

      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
      expect(mockedToggleDmzReq).toBeCalledTimes(0)
    })

    it('change DC to DMZ scenario', async () => {
      const mockedData = cloneDeep(mockedEditData)
      mockedData.isGuestTunnelEnabled = false
      mockedData.guestEdgeClusterId = ''
      mockedData.guestTunnelProfileId = ''
      mockedData.guestNetworkIds = []
      const mockedPayload = {
        ...mockedData,
        isGuestTunnelEnabled: true,
        networkIds: ['network_1', 'network_3'],
        guestEdgeClusterId: '0000000003',
        guestTunnelProfileId: 't-tunnelProfile-id-3',
        guestNetworkIds: ['network_1','network_3']
      }

      await prepareTest(mockedData, mockedPayload)
      await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
      expect(mockedToggleDmzReq).toBeCalledTimes(1)
      expect(mockedToggleDmzReq).toBeCalledWith({
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelEnabled: true })

      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(1)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledWith({
        edgeClusterId: '0000000003',
        serviceId: 'mocked_service_id',
        venueId: 'mocked_venue_id'
      })
      expect(mockedDeactivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedActivateDmzTunnelReq).toBeCalledWith({
        tunnelProfileId: 't-tunnelProfile-id-3',
        serviceId: 'mocked_service_id'
      })
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(1)
      expect(mockedDeactivateNetworkReq).toBeCalledWith({
        wifiNetworkId: 'network_4',
        serviceId: 'mocked_service_id'
      })
      expect(mockedActivateNetworkReq).toBeCalledTimes(2)
      mockedPayload.guestNetworkIds.forEach(network => {
        expect(mockedActivateNetworkReq).toBeCalledWith({
          wifiNetworkId: network,
          serviceId: 'mocked_service_id'
        }, { isGuestTunnelUtilized: true })
      })
    })

    it('should only deactivate dmz network and activate dc network', async () => {
      const mockedData = cloneDeep(mockedEditData)
      const mockedPayload = {
        ...mockedData,
        networkIds: ['network_4', 'network_3'],
        guestTunnelProfileId: 't-tunnelProfile-id-2',
        guestNetworkIds: []
      }

      await prepareTest(mockedData, mockedPayload)
      await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
      expect(mockedToggleDmzReq).toBeCalledTimes(0)
      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedDeactivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
      expect(mockedActivateNetworkReq).toBeCalledTimes(2)
      mockedPayload.networkIds.forEach(network => {
        expect(mockedActivateNetworkReq).toBeCalledWith({
          wifiNetworkId: network,
          serviceId: 'mocked_service_id'
        }, { isGuestTunnelUtilized: false })
      })
    })

    it('should only activate dmz cluster when change from DC again', async () => {
      const mockedData = cloneDeep(mockedEditData)
      mockedData.isGuestTunnelEnabled = false
      const mockedPayload = {
        ...mockedData,
        isGuestTunnelEnabled: true
      }

      await prepareTest(mockedData, mockedPayload)
      await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
      expect(mockedToggleDmzReq).toBeCalledWith({
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelEnabled: true })
      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
      expect(mockedActivateNetworkReq).toBeCalledTimes(0)
    })

    it('should be able to change dmz cluster', async () => {
      const mockedData = cloneDeep(mockedEditData)
      const mockedPayload = {
        ...mockedData,
        guestEdgeClusterId: '0000000005'
      }

      await prepareTest(mockedData, mockedPayload)
      await waitFor(() => expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(1))
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledWith({
        edgeClusterId: '0000000005',
        serviceId: 'mocked_service_id',
        venueId: 'mocked_venue_id'
      })
      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedToggleDmzReq).toBeCalledTimes(0)
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedCallback).toBeCalledTimes(1)
      expect(mockedDeactivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
      expect(mockedActivateNetworkReq).toBeCalledTimes(0)
    })

    it('should be able to change dmz cluster when change from DC to DMZ', async () => {
      const mockedData = cloneDeep(mockedEditData)
      mockedData.isGuestTunnelEnabled = false
      const mockedPayload = {
        ...mockedData,
        isGuestTunnelEnabled: true,
        guestEdgeClusterId: '0000000005'
      }

      await prepareTest(mockedData, mockedPayload)
      await waitFor(() => expect(mockedToggleDmzReq).toBeCalledWith({
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelEnabled: true }))
      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(1)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledWith({
        edgeClusterId: '0000000005',
        serviceId: 'mocked_service_id',
        venueId: 'mocked_venue_id'
      })
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedCallback).toBeCalledTimes(1)
      expect(mockedDeactivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
      expect(mockedActivateNetworkReq).toBeCalledTimes(0)
    })


    it('should update porfile name only', async () => {
      const mockedData = cloneDeep(mockedEditData)
      mockedData.name = 'newSdLanP2TestName'

      await prepareTest(mockedEditData, mockedData)
      await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
      expect(mockedUpdateReq).toBeCalledTimes(1)
      expect(mockedToggleDmzReq).toBeCalledTimes(0)
      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateMvNetworkReq).toBeCalledTimes(0)
      expect(mockedActivateMvNetworkReq).toBeCalledTimes(0)
    })

    it('should skip update porfile when no change', async () => {
      const mockedData = cloneDeep(mockedEditData)
      mockedData.isGuestTunnelEnabled = false
      const mockedPayload = {
        ...mockedData,
        isGuestTunnelEnabled: true
      }

      await prepareTest(mockedData, mockedPayload)
      await waitFor(() => expect(mockedToggleDmzReq).toBeCalledWith({
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelEnabled: true }))

      expect(mockedUpdateReq).toBeCalledTimes(0)
      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateMvNetworkReq).toBeCalledTimes(0)
      expect(mockedActivateNetworkReq).toBeCalledTimes(0)
      expect(mockedCallback).toBeCalledTimes(1)
    })

    it('should handle relation requests failed', async () => {
      const mockedReq = jest.fn()
      mockServer.use(
        rest.put(
          EdgeSdLanUrls.activateEdgeSdLanNetwork.url,
          (req, res, ctx) => {
            mockedReq(req.params)
            return res(ctx.status(403), ctx.json({
              requestId: 'failed_req_id',
              errors: [{
                code: 'EDGE-00000',
                message: 'test failed'
              }]
            }))
          }
        ))

      const mockedCallbackInnerFn = jest.fn()
      const mockedCBFn = jest.fn()
        .mockImplementation((response: CommonErrorsResult<CatchErrorDetails>) => {
          mockedCallbackInnerFn(response.data.errors[0].code)
        })
      const mockedPayload = {
        ...mockedEditData,
        networkIds: ['network_1', 'network_3'],
        guestNetworkIds: ['network_1','network_3']
      }
      const { result } = renderHook(() => useEdgeSdLanActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      const { editEdgeSdLan } = result.current
      await editEdgeSdLan(mockedEditData, {
        payload: mockedPayload,
        callback: mockedCBFn
      })

      await waitFor(() => expect(mockedCBFn).toBeCalledTimes(1))
      expect(mockedUpdateReq).toBeCalledTimes(0)
      expect(mockedCallbackInnerFn).toBeCalledWith('EDGE-00000')
      expect(mockedReq).toBeCalledWith({
        serviceId: 'mocked_service_id',
        wifiNetworkId: 'network_1'
      })
      expect(mockedReq).toBeCalledWith({
        serviceId: 'mocked_service_id',
        wifiNetworkId: 'network_3'
      })
    })
  })
})


describe('useGetEdgeSdLanByEdgeOrClusterId', () => {
  const mockedReq = jest.fn()
  beforeEach(() => {
    store.dispatch(edgeSdLanApi.util.resetApiState())

    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGES_TOGGLE || ff === Features.EDGES_SD_LAN_HA_TOGGLE)
    mockedReq.mockClear()

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_req, res, ctx) => {
          mockedReq()
          return res(ctx.json({ data: mockedSdLanDataListP2 }))
        }
      ))
  })

  it('should successfully get data by edgeClusterId', async () => {
    const targetClusterId = mockedSdLanDataListP2[0].edgeClusterId
    const { result } = renderHook(() => useGetEdgeSdLanByEdgeOrClusterId(targetClusterId), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    await waitFor(() => expect(result.current).toStrictEqual({
      edgeSdLanData: mockedSdLanDataListP2[0],
      isLoading: false,
      isFetching: false
    }))
  })

  it('should successfully get data by guestEdgeClusterId', async () => {
    const targetClusterId = mockedSdLanDataListP2[0].guestEdgeClusterId
    const { result } = renderHook(() => useGetEdgeSdLanByEdgeOrClusterId(targetClusterId), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    await waitFor(() =>expect(result.current).toStrictEqual({
      edgeSdLanData: mockedSdLanDataListP2[0],
      isLoading: false,
      isFetching: false
    }))
  })

  it('should not return data when target id is not exist', async () => {
    const { result } = renderHook(() => useGetEdgeSdLanByEdgeOrClusterId('test-id'), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    await waitFor(() => expect(result.current).toStrictEqual({
      edgeSdLanData: undefined,
      isLoading: false,
      isFetching: false
    }))
  })

  it('should return the first get data by edgeId when only P1 FF on', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGES_TOGGLE || ff === Features.EDGES_SD_LAN_TOGGLE)

    const { result } = renderHook(() => useGetEdgeSdLanByEdgeOrClusterId('edge_id'), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    await waitFor(() => expect(result.current).toStrictEqual({
      edgeSdLanData: mockedSdLanDataListP2[0],
      isLoading: false,
      isFetching: false
    }))
  })

  it('should handle get requests failed', async () => {
    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_req, res, ctx) => {
          return res(ctx.status(401))
        }
      ))

    const { result } = renderHook(() => useGetEdgeSdLanByEdgeOrClusterId(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    expect(result.current).toStrictEqual({
      edgeSdLanData: undefined,
      isLoading: false,
      isFetching: false
    })
  })

  it('should not trigger API when given ID is empty', async () => {
    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_req, res, ctx) => {
          mockedReq()
          return res(ctx.status(401))
        }
      ))

    const { result } = renderHook(() => useGetEdgeSdLanByEdgeOrClusterId(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    expect(result.current).toStrictEqual({
      edgeSdLanData: undefined,
      isLoading: false,
      isFetching: false
    })
    expect(mockedReq).not.toBeCalled()
  })

  it('should not trigger API when FF are all disabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_req, res, ctx) => {
          mockedReq()
          return res(ctx.status(401))
        }
      ))

    const { result } = renderHook(() => useGetEdgeSdLanByEdgeOrClusterId(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    expect(result.current).toStrictEqual({
      edgeSdLanData: undefined,
      isLoading: false,
      isFetching: false
    })
    expect(mockedReq).not.toBeCalled()
  })
})

describe('SD-LAN feature functions', () => {

  describe('useSdLanScopedVenueNetworks', () => {
    const mockVenueId = 'mock_venue'
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.EDGE_SD_LAN_MV_TOGGLE)
    })

    it('should return networkId for DC case', async () => {
      const mockData = mockedSdLanDataListP2.filter(item => item.id === 'mocked-sd-lan-2')
      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => res(ctx.json({ data: mockData }))
        )
      )
      const { result } = renderHook(() =>
        useSdLanScopedVenueNetworks(mockVenueId, ['network_2']), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      await waitFor(() =>
        expect(result.current)
          .toStrictEqual({
            scopedNetworkIds: ['network_2'],
            scopedGuestNetworkIds: [],
            sdLans: mockData
          })
      )
    })

    it('should return networkId for DMZ case', async () => {
      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataListP2 }))
        )
      )
      const { result } = renderHook(() =>
        // eslint-disable-next-line max-len
        useSdLanScopedVenueNetworks(mockVenueId, ['network_1', 'network_2', 'network_3', 'network_4']), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      await waitFor(() =>
        expect(result.current)
          .toStrictEqual({
            scopedNetworkIds: ['network_1', 'network_4', 'network_2'],
            scopedGuestNetworkIds: ['network_4'],
            sdLans: mockedSdLanDataListP2
          })
      )
    })

    it('should do nothing when FF is OFF', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      const mockedSdLanGet = jest.fn()
      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => {
            mockedSdLanGet()
            return res(ctx.json({ data: [] }))
          }
        )
      )
      renderHook(() =>
        useSdLanScopedVenueNetworks(mockVenueId, ['mocked_network_1']), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      expect(mockedSdLanGet).not.toBeCalled()
    })
  })

  describe('useSdLanScopedNetworkVenues', () => {
    describe('SDLAN P2 enabled, multi-venue is not enabled', () => {

      beforeEach(() => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.EDGE_SD_LAN_MV_TOGGLE)
      })

      it('should return venueId used for DC case', async () => {
        const mockData = mockedSdLanDataListP2
          .filter(item => item.id === 'mocked-sd-lan-2')
        mockServer.use(
          rest.post(
            EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
            (_, res, ctx) => res(ctx.json({ data: mockData }))
          )
        )

        const { result } = renderHook(() => useSdLanScopedNetworkVenues('network_2'), {
          wrapper: ({ children }) => <Provider children={children} />
        })

        await waitFor(() =>
          expect(result.current)
            .toStrictEqual({
              sdLansVenueMap: groupBy(mockData, 'venueId'),
              networkVenueIds: [
                'a307d7077410456f8f1a4fc41d861560'
              ],
              guestNetworkVenueIds: []
            })
        )
      })

      it('should return venueId used for DC case with previous guest network', async () => {
        let mockData = cloneDeep(mockedSdLanDataListP2
          .filter(item => item.id === 'mocked-sd-lan-1'))
        mockData[0].isGuestTunnelEnabled = false
        mockServer.use(
          rest.post(
            EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
            (_, res, ctx) => res(ctx.json({ data: mockData }))
          )
        )

        const { result } = renderHook(() => useSdLanScopedNetworkVenues('network_4'), {
          wrapper: ({ children }) => <Provider children={children} />
        })

        await waitFor(() =>
          expect(result.current)
            .toStrictEqual({
              sdLansVenueMap: groupBy(mockData, 'venueId'),
              networkVenueIds: [
                'a307d7077410456f8f1a4fc41d861567'
              ],
              guestNetworkVenueIds: []
            })
        )
      })

      it('should return venueId used for DMZ case', async () => {
        const mockData = mockedSdLanDataListP2
          .filter(item => item.id === 'mocked-sd-lan-1')
        mockServer.use(
          rest.post(
            EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
            (_, res, ctx) => res(ctx.json({ data: mockData }))
          )
        )

        const { result } = renderHook(() => useSdLanScopedNetworkVenues('network_4'), {
          wrapper: ({ children }) => <Provider children={children} />
        })

        await waitFor(() =>
          expect(result.current)
            .toStrictEqual({
              sdLansVenueMap: groupBy(mockData, 'venueId'),
              networkVenueIds: [
                'a307d7077410456f8f1a4fc41d861567'
              ],
              guestNetworkVenueIds: [
                'a307d7077410456f8f1a4fc41d861567'
              ]
            })
        )
      })

      it('should return venueId used for DMZ case with no guest network', async () => {
        const mockData = cloneDeep(mockedSdLanDataListP2
          .filter(item => item.id === 'mocked-sd-lan-1'))
        mockData[0].guestNetworkIds = []
        mockData[0].guestNetworkInfos = []
        mockServer.use(
          rest.post(
            EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
            (_, res, ctx) => {
              return res(ctx.json({ data: mockData }))
            }
          )
        )

        const { result } = renderHook(() => useSdLanScopedNetworkVenues('network_4'), {
          wrapper: ({ children }) => <Provider children={children} />
        })

        await waitFor(() =>
          expect(result.current)
            .toStrictEqual({
              sdLansVenueMap: groupBy(mockData, 'venueId'),
              networkVenueIds: [
                'a307d7077410456f8f1a4fc41d861567'
              ],
              guestNetworkVenueIds: []
            })
        )
      })
    })

    describe('multi-venue SDLAN enabled', () => {
      beforeEach(() => {
        // eslint-disable-next-line max-len
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_SD_LAN_MV_TOGGLE || ff === Features.EDGES_TOGGLE)
      })

      it('should return venueId used for DC case', async () => {
        const mockData = mockedMvSdLanDataList
          .filter(item => item.id === 'mocked-sd-lan-2')
        mockServer.use(
          rest.post(
            EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
            (_, res, ctx) => res(ctx.json({ data: mockData }))
          )
        )

        const { result } = renderHook(() => useSdLanScopedNetworkVenues('network_2'), {
          wrapper: ({ children }) => <Provider children={children} />
        })

        await waitFor(() =>
          expect(result.current)
            .toStrictEqual({
              sdLansVenueMap: {
                a307d7077410456f8f1a4fc41d861560: mockData
              },
              networkVenueIds: [
                'a307d7077410456f8f1a4fc41d861560'
              ],
              guestNetworkVenueIds: []
            })
        )
      })

      it('should return venueId used for DMZ case', async () => {
        const mockData = mockedMvSdLanDataList
          .filter(item => item.id === 'mocked-sd-lan-1')
        mockServer.use(
          rest.post(
            EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
            (_, res, ctx) => res(ctx.json({ data: mockData }))
          )
        )

        const { result } = renderHook(() => useSdLanScopedNetworkVenues('network_4'), {
          wrapper: ({ children }) => <Provider children={children} />
        })

        await waitFor(() =>
          expect(result.current)
            .toStrictEqual({
              sdLansVenueMap: {
                a307d7077410456f8f1a4fc41d861567: mockData
              },
              networkVenueIds: [
                'a307d7077410456f8f1a4fc41d861567'
              ],
              guestNetworkVenueIds: ['a307d7077410456f8f1a4fc41d861567']
            })
        )
      })
    })

    it('should do nothing when FF is OFF', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      const mockedSdLanGet = jest.fn()
      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => {
            mockedSdLanGet()
            return res(ctx.json({ data: [] }))
          }
        )
      )

      renderHook(() => useSdLanScopedNetworkVenues('mocked_network_2'), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      expect(mockedSdLanGet).not.toBeCalled()
    })
  })

  describe('checkSdLanScopedNetworkDeactivateAction', () => {

    it('should poup confirm dialog when intersection is exactly 1', async () => {
      const mockedCallback = jest.fn()
      checkSdLanScopedNetworkDeactivateAction(
        ['network_id_1'], ['network_id_1'], mockedCallback
      )

      const dialog = await screen.findByRole('dialog')
      expect(dialog).toHaveTextContent('This network is running the SD-LAN')
      await userEvent.click(await screen.findByRole('button', { name: 'Deactivate' }))
      expect(mockedCallback).toBeCalled()
      await waitFor(() => expect(dialog).not.toBeVisible())
    })

    it('should poup confirm dialog when more than 1 intersectted', async () => {
      const mockedCallback = jest.fn()
      checkSdLanScopedNetworkDeactivateAction(
        ['network_id_1', 'network_id_2', 'network_id_3'],
        ['network_id_2', 'network_id_3'],
        mockedCallback
      )

      const dialog = await screen.findByRole('dialog')
      expect(dialog).toHaveTextContent('The SD-LAN service is running on one or some')
      await userEvent.click(await screen.findByRole('button', { name: 'Deactivate' }))
      expect(mockedCallback).toBeCalled()
      await waitFor(() => expect(dialog).not.toBeVisible())
    })

    it('when click cancel, should do nothing and close dialog', async () => {
      const mockedCallback = jest.fn()
      checkSdLanScopedNetworkDeactivateAction(
        ['network_id_1'], ['network_id_1'], mockedCallback
      )

      const dialog = await screen.findByRole('dialog')
      expect(dialog).toHaveTextContent('This network is running the SD-LAN')
      await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
      expect(mockedCallback).not.toBeCalled()
      await waitFor(() => expect(dialog).not.toBeVisible())
    })

    it('should no poup dialog when no intersectted', async () => {
      const mockedCallback = jest.fn()
      checkSdLanScopedNetworkDeactivateAction(
        ['network_id_1', 'network_id_2', 'network_id_3'],
        ['network_id_5'],
        mockedCallback
      )

      expect(mockedCallback).toBeCalled()
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('should no poup dialog when the given data is invalid', async () => {
      const mockedCallback = jest.fn()
      checkSdLanScopedNetworkDeactivateAction(
        undefined,
        ['network_id_5'],
        mockedCallback
      )

      expect(mockedCallback).toBeCalled()
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})