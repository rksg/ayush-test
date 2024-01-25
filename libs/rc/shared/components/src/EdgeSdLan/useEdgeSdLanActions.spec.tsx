import { rest } from 'msw'

import { EdgeSdLanUrls, EdgeSdLanSettingP2, CommonErrorsResult, CatchErrorDetails } from '@acx-ui/rc/utils'
import { Provider }                                                                 from '@acx-ui/store'
import { mockServer, renderHook, waitFor }                                          from '@acx-ui/test-utils'
import { RequestPayload }                                                           from '@acx-ui/types'

import { useEdgeSdLanActions } from '..'

const mockedActivateEdgeSdLanDmzClusterReq = jest.fn()
const mockedDeactivateEdgeSdLanDmzClusterReq = jest.fn()
const mockedActivateDmzTunnelReq = jest.fn()
const mockedDeactivateDmzTunnelReq = jest.fn()
const mockedActivateNetworkReq = jest.fn()
const mockedDeactivateNetworkReq = jest.fn()

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
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
  },
  useUpdateEdgeSdLanPartialP2Mutation: () => {
    return [(req: RequestPayload) => {
      return { unwrap: () => new Promise((resolve) => {
        resolve(true)
        setTimeout(() => {
          (req.callback as Function)()
        }, 300)
      }) }
    }]
  }
}))
describe('useEdgeSdLanActions', () => {

  beforeEach(() => {
    mockedActivateEdgeSdLanDmzClusterReq.mockClear()
    mockedDeactivateEdgeSdLanDmzClusterReq.mockClear()
    mockedActivateDmzTunnelReq.mockClear()
    mockedDeactivateDmzTunnelReq.mockClear()
    mockedActivateNetworkReq.mockClear()
    mockedDeactivateNetworkReq.mockClear()

    mockServer.use(
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
      )
    )
  })

  it('should add guest settings successfully', async () => {
    const mockedCallback = jest.fn()
    const mockedPayload = {
      name: 'testAddDMZSdLanService',
      venueId: 'mocked_venue_id',
      edgeId: '0000000002',
      corePortMac: 't-coreport2-key',
      networkIds: ['network_1'],
      tunnelProfileId: 't-tunnelProfile-id',
      isGuestTunnelEnabled: true,
      guestEdgeId: '0000000005',
      guestTunnelProfileId: 't-tunnelProfile-id-2',
      guestNetworkIds: ['network_1']
    } as EdgeSdLanSettingP2
    const { result } = renderHook(() => useEdgeSdLanActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { addEdgeSdLan } = result.current
    await addEdgeSdLan({
      payload: mockedPayload,
      callback: mockedCallback
    })

    await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
    expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledWith({
      edgeClusterId: '0000000005',
      serviceId: 'mocked_service_id',
      venueId: 'mocked_venue_id'
    })
    expect(mockedActivateDmzTunnelReq).toBeCalledWith({
      tunnelProfileId: 't-tunnelProfile-id-2',
      serviceId: 'mocked_service_id'
    })
    expect(mockedActivateNetworkReq).toBeCalledWith({
      wifiNetworkId: 'network_1',
      serviceId: 'mocked_service_id'
    }, { isGuestEnabled: true })
  })

  it('should not trigger guest settings when it not enabled', async () => {
    const mockedCallback = jest.fn()
    const mockedPayload = {
      name: 'testAddDmzSdLanService_notEnabled',
      venueId: 'mocked_venue_id',
      edgeId: '0000000002',
      corePortMac: 't-coreport2-key',
      networkIds: ['network_2'],
      tunnelProfileId: 't-tunnelProfile-id',
      isGuestTunnelEnabled: false,
      guestEdgeId: '0000000003',
      guestTunnelProfileId: 't-tunnelProfile-id-1',
      guestNetworkIds: ['network_2']
    } as EdgeSdLanSettingP2
    const { result } = renderHook(() => useEdgeSdLanActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { addEdgeSdLan } = result.current
    await addEdgeSdLan({
      payload: mockedPayload,
      callback: mockedCallback
    })

    await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
    expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
    expect(mockedActivateDmzTunnelReq).toBeCalledTimes(0)
    expect(mockedActivateNetworkReq).toBeCalledTimes(0)
  })

  it('should edit guest settings successfully', async () => {
    const mockedCallback = jest.fn()
    const mockedEditData = {
      id: 'mocked_service_id',
      name: 'testEditDMZSdLanService',
      venueId: 'mocked_venue_id',
      edgeId: '0000000002',
      corePortMac: 't-coreport2-key',
      networkIds: ['network_4'],
      tunnelProfileId: 't-tunnelProfile-id',
      isGuestTunnelEnabled: true,
      guestEdgeId: '0000000005',
      guestTunnelProfileId: 't-tunnelProfile-id-2',
      guestNetworkIds: ['network_4']
    } as EdgeSdLanSettingP2

    const mockedPayload = {
      ...mockedEditData,
      networkIds: ['network_4', 'network_5'],
      guestTunnelProfileId: 't-tunnelProfile-id-3',
      guestNetworkIds: ['network_4','network_5']
    }
    const { result } = renderHook(() => useEdgeSdLanActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { editEdgeSdLan } = result.current
    await editEdgeSdLan(mockedEditData,
      {
        payload: mockedPayload,
        callback: mockedCallback
      })

    await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
    expect(mockedDeactivateDmzTunnelReq).toBeCalledWith({
      tunnelProfileId: 't-tunnelProfile-id-2',
      serviceId: 'mocked_service_id'
    })
    expect(mockedActivateDmzTunnelReq).toBeCalledWith({
      tunnelProfileId: 't-tunnelProfile-id-3',
      serviceId: 'mocked_service_id'
    })
    expect(mockedActivateNetworkReq).toBeCalledWith({
      wifiNetworkId: 'network_5',
      serviceId: 'mocked_service_id'
    }, { isGuestEnabled: true })
  })

  it('should deactivate dmz cluster when guest tunnel disabled', async () => {
    const mockedCallback = jest.fn()
    const mockedEditData = {
      id: 'mocked_service_id_2',
      name: 'testEditDMZSdLanService2',
      venueId: 'mocked_venue_id',
      edgeId: '0000000005',
      corePortMac: 't-coreport2-key',
      networkIds: ['network_4'],
      tunnelProfileId: 't-tunnelProfile-id',
      isGuestTunnelEnabled: true,
      guestEdgeId: '0000000003',
      guestTunnelProfileId: 't-tunnelProfile-id-2',
      guestNetworkIds: ['network_4']
    } as EdgeSdLanSettingP2

    const mockedPayload = {
      ...mockedEditData,
      isGuestTunnelEnabled: false,
      networkIds: ['network_1', 'network_3'],
      guestTunnelProfileId: 't-tunnelProfile-id-2',
      guestNetworkIds: ['network_1','network_3']
    }
    const { result } = renderHook(() => useEdgeSdLanActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { editEdgeSdLan } = result.current
    await editEdgeSdLan(mockedEditData,
      {
        payload: mockedPayload,
        callback: mockedCallback
      })

    await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
    expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledWith({
      edgeClusterId: '0000000003',
      serviceId: 'mocked_service_id_2',
      venueId: 'mocked_venue_id'
    })
    expect(mockedDeactivateNetworkReq).toBeCalledWith({
      wifiNetworkId: 'network_4',
      serviceId: 'mocked_service_id_2'
    })
    mockedPayload.guestNetworkIds.forEach(network => {
      expect(mockedActivateNetworkReq).toBeCalledWith({
        wifiNetworkId: network,
        serviceId: 'mocked_service_id_2'
      }, { isGuestEnabled: true })
    })
  })

  it('should activate dmz cluster when guest tunnel enabled again', async () => {
    const mockedCallback = jest.fn()
    const mockedEditData = {
      id: 'mocked_service_id_2',
      name: 'testEditDMZSdLanService2',
      venueId: 'mocked_venue_id',
      edgeId: '0000000005',
      corePortMac: 't-coreport2-key',
      networkIds: ['network_4'],
      tunnelProfileId: 't-tunnelProfile-id',
      isGuestTunnelEnabled: false,
      guestEdgeId: '0000000003',
      guestTunnelProfileId: 't-tunnelProfile-id-2',
      guestNetworkIds: ['network_4']
    } as EdgeSdLanSettingP2

    const mockedPayload = {
      ...mockedEditData,
      isGuestTunnelEnabled: true,
      networkIds: ['network_1', 'network_3'],
      guestTunnelProfileId: '',
      guestNetworkIds: ['network_1','network_3']
    }
    const { result } = renderHook(() => useEdgeSdLanActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { editEdgeSdLan } = result.current
    await editEdgeSdLan(mockedEditData,
      {
        payload: mockedPayload,
        callback: mockedCallback
      })

    await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
    expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledWith({
      edgeClusterId: '0000000003',
      serviceId: 'mocked_service_id_2',
      venueId: 'mocked_venue_id'
    })
    expect(mockedActivateDmzTunnelReq).toBeCalledTimes(0)
  })

  it('should handle relation requests failed', async () => {
    const mockedReq = jest.fn()
    mockServer.use(
      rest.put(
        EdgeSdLanUrls.activateEdgeSdLanDmzCluster.url,
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
    const mockedCallback = jest.fn()
      .mockImplementation((response: CommonErrorsResult<CatchErrorDetails>) => {
        mockedCallbackInnerFn(response.data.errors[0].code)
      })
    const mockedEditData = {
      id: 'mocked_service_id_2',
      name: 'testEditDMZSdLanService2',
      venueId: 'mocked_venue_id',
      edgeId: '0000000005',
      corePortMac: 't-coreport2-key',
      networkIds: ['network_4'],
      tunnelProfileId: 't-tunnelProfile-id',
      isGuestTunnelEnabled: false,
      guestEdgeId: '0000000003',
      guestTunnelProfileId: 't-tunnelProfile-id-2',
      guestNetworkIds: ['network_4']
    } as EdgeSdLanSettingP2

    const mockedPayload = {
      ...mockedEditData,
      isGuestTunnelEnabled: true,
      networkIds: ['network_1', 'network_3'],
      guestTunnelProfileId: 't-tunnelProfile-id-2',
      guestNetworkIds: ['network_1','network_3']
    }
    const { result } = renderHook(() => useEdgeSdLanActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { editEdgeSdLan } = result.current
    await editEdgeSdLan(mockedEditData,
      {
        payload: mockedPayload,
        callback: mockedCallback
      })

    await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
    expect(mockedCallbackInnerFn).toBeCalledWith('EDGE-00000')
    expect(mockedReq).toBeCalledWith({
      edgeClusterId: '0000000003',
      serviceId: 'mocked_service_id_2',
      venueId: 'mocked_venue_id'
    })
  })
})