import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  EdgeSdLanUrls,
  EdgeSdLanSettingP2,
  CommonErrorsResult,
  CatchErrorDetails,
  EdgeSdLanFixtures
} from '@acx-ui/rc/utils'
import { Provider }                                from '@acx-ui/store'
import { mockServer, renderHook, waitFor, screen } from '@acx-ui/test-utils'
import { RequestPayload }                          from '@acx-ui/types'

import {
  checkSdLanScopedNetworkDeactivateAction,
  useEdgeSdLanActions,
  useSdLanScopedNetworks,
  useSdLanScopedNetworkVenues
} from './useEdgeSdLanActions'

const { mockedSdLanDataList } = EdgeSdLanFixtures


const mockedCallback = jest.fn()
const mockedActivateEdgeSdLanDmzClusterReq = jest.fn()
const mockedDeactivateEdgeSdLanDmzClusterReq = jest.fn()
const mockedActivateDmzTunnelReq = jest.fn()
const mockedDeactivateDmzTunnelReq = jest.fn()
const mockedActivateNetworkReq = jest.fn()
const mockedDeactivateNetworkReq = jest.fn()
const mockedToggleDmzReq = jest.fn()

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
    mockedCallback.mockClear()
    mockedActivateEdgeSdLanDmzClusterReq.mockClear()
    mockedDeactivateEdgeSdLanDmzClusterReq.mockClear()
    mockedActivateDmzTunnelReq.mockClear()
    mockedDeactivateDmzTunnelReq.mockClear()
    mockedActivateNetworkReq.mockClear()
    mockedDeactivateNetworkReq.mockClear()
    mockedToggleDmzReq.mockClear()

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

      await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
      expect(mockedToggleDmzReq).toBeCalledWith({
        serviceId: 'mocked_service_id'
      }, { isGuestTunnelEnabled: true })
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledWith({
        edgeClusterId: '0000000005',
        serviceId: 'mocked_service_id',
        venueId: 'mocked_venue_id'
      })
      expect(mockedActivateDmzTunnelReq).toBeCalledWith({
        tunnelProfileId: 't-tunnelProfile-id-2',
        serviceId: 'mocked_service_id'
      })
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
      const mockData = _.cloneDeep(mockedAddData)
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
      expect(mockedReq).toBeCalledWith({
        edgeClusterId: '0000000005',
        serviceId: 'mocked_service_id',
        venueId: 'mocked_venue_id'
      })
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

    it('should edit guest settings successfully', async () => {
      const mockedData = _.cloneDeep(mockedEditData)
      const mockedPayload = {
        ...mockedData,
        networkIds: ['network_4', 'network_5'],
        guestTunnelProfileId: 't-tunnelProfile-id-3',
        guestNetworkIds: ['network_4','network_5']
      }
      const { result } = renderHook(() => useEdgeSdLanActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { editEdgeSdLan } = result.current
      await editEdgeSdLan(mockedData, {
        payload: mockedPayload,
        callback: mockedCallback
      })

      await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
      // handle dmz tunnel changes
      expect(mockedDeactivateDmzTunnelReq).toBeCalledWith({
        tunnelProfileId: 't-tunnelProfile-id-2',
        serviceId: 'mocked_service_id'
      })
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
      const mockedData = _.cloneDeep(mockedEditData)
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
      const { result } = renderHook(() => useEdgeSdLanActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { editEdgeSdLan } = result.current
      await editEdgeSdLan(mockedData, {
        payload: mockedPayload,
        callback: mockedCallback
      })

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
      const mockedData = _.cloneDeep(mockedEditData)
      const mockedPayload = {
        ...mockedData,
        networkIds: ['network_4', 'network_3'],
        guestTunnelProfileId: 't-tunnelProfile-id-2',
        guestNetworkIds: []
      }
      const { result } = renderHook(() => useEdgeSdLanActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { editEdgeSdLan } = result.current
      await editEdgeSdLan(mockedData, {
        payload: mockedPayload,
        callback: mockedCallback
      })

      await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
      expect(mockedToggleDmzReq).toBeCalledTimes(0)
      expect(mockedDeactivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedActivateEdgeSdLanDmzClusterReq).toBeCalledTimes(0)
      expect(mockedDeactivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedActivateDmzTunnelReq).toBeCalledTimes(0)
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
      expect(mockedActivateNetworkReq).toBeCalledTimes(2)
      mockedPayload.guestNetworkIds.forEach(network => {
        expect(mockedActivateNetworkReq).toBeCalledWith({
          wifiNetworkId: network,
          serviceId: 'mocked_service_id_2'
        }, { isGuestTunnelUtilized: false })
      })
    })

    it('should only activate dmz cluster when change from DC again', async () => {
      const mockedData = _.cloneDeep(mockedEditData)
      mockedData.isGuestTunnelEnabled = false
      const mockedPayload = {
        ...mockedData,
        isGuestTunnelEnabled: true
      }
      const { result } = renderHook(() => useEdgeSdLanActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { editEdgeSdLan } = result.current
      await editEdgeSdLan(mockedData, {
        payload: mockedPayload,
        callback: mockedCallback
      })

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

describe('SD-LAN feature functions', () => {

  describe('useSdLanScopedNetworks', () => {
    const mockedSdLanGet = jest.fn()
    beforeEach(() => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      mockedSdLanGet.mockClear()

      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => {
            mockedSdLanGet()
            return res(ctx.json({ data: mockedSdLanDataList }))
          }
        )
      )
    })

    it('should return networkId', async () => {
      const { result } = renderHook(() => useSdLanScopedNetworks(['mocked_network_1']), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      await waitFor(() =>
        expect(result.current)
          .toStrictEqual(['8e22159cfe264ac18d591ea492fbc05a'])
      )
    })

    it('should do nothing when FF is OFF', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      renderHook(() => useSdLanScopedNetworks(['mocked_network_1']), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      expect(mockedSdLanGet).not.toBeCalled()
    })
  })

  describe('useSdLanScopedNetworkVenues', () => {
    const mockedSdLanGet = jest.fn()
    beforeEach(() => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      mockedSdLanGet.mockClear()

      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => {
            mockedSdLanGet()
            return res(ctx.json({ data: mockedSdLanDataList }))
          }
        )
      )
    })

    it('should return venueId', async () => {
      const { result } = renderHook(() => useSdLanScopedNetworkVenues('mocked_network_2'), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      await waitFor(() =>
        expect(result.current)
          .toStrictEqual(['a307d7077410456f8f1a4fc41d861567', 'a8def420bd6c4f3e8b28114d6c78f237'])
      )
    })

    it('should do nothing when FF is OFF', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
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