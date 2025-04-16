import { renderHook, waitFor } from '@testing-library/react'
import { pick }                from 'lodash'
import { rest }                from 'msw'

import { CommonErrorsResult, EdgeSdLanServiceProfile, EdgeSdLanUrls } from '@acx-ui/rc/utils'
import { Provider }                                                   from '@acx-ui/store'
import { mockServer }                                                 from '@acx-ui/test-utils'
import { RequestPayload }                                             from '@acx-ui/types'
import { CatchErrorDetails }                                          from '@acx-ui/utils'

import { useEdgeSdLanActions } from './useEdgeSdLanActions'

const mockAddReq = jest.fn()
const mockUpdateReq = jest.fn()
const mockActivateNetworkReq = jest.fn()
const mockDeactivateNetworkReq = jest.fn()

const mockServiceId = 'mocked_service_id'
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useAddEdgeMvSdLanMutation: () => {
    return [(req: RequestPayload) => {
      return { unwrap: () => new Promise((resolve) => {
        mockAddReq(req.payload)
        resolve(true)
        setTimeout(() => {
          (req.callback as Function)({
            response: { id: mockServiceId }
          })
        }, 300)
      }) }
    }]
  }
}))
describe('useEdgeSdLanActions', () => {
  const mockPayload: EdgeSdLanServiceProfile = {
    name: 'Test SD-LAN',
    tunnelProfileId: 'tunnel-1',
    activeNetwork: [
      {
        venueId: 'venue-1',
        networkId: 'network-1',
        tunnelProfileId: 'tunnel-1'
      },
      {
        venueId: 'venue-1',
        networkId: 'network-2',
        tunnelProfileId: ''
      }
    ]
  }

  beforeEach(() => {
    mockAddReq.mockClear()
    mockUpdateReq.mockClear()
    mockActivateNetworkReq.mockClear()
    mockDeactivateNetworkReq.mockClear()

    mockServer.use(
      rest.put(
        EdgeSdLanUrls.activateEdgeMvSdLanNetwork.url,
        (req, res, ctx) => {
          mockActivateNetworkReq(req.params, req.body)
          return res(ctx.status(202))
        }
      ),
      rest.patch(
        EdgeSdLanUrls.updateEdgeSdLanPartial.url,
        (req, res, ctx) => {
          mockUpdateReq(req.params, req.body)
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeSdLanUrls.deactivateEdgeMvSdLanNetwork.url,
        (req, res, ctx) => {
          mockDeactivateNetworkReq(req.params)
          return res(ctx.status(202))
        }
      )
    )
  })

  describe('createEdgeSdLan', () => {
    it('should successfully create SD-LAN and activate networks', async () => {
      const mockCallback = jest.fn()
      const { result } = renderHook(() => useEdgeSdLanActions(), {
        wrapper: ({ children }) => <Provider>{children}</Provider>
      })
      await result.current.createEdgeSdLan({
        payload: mockPayload,
        callback: mockCallback
      })

      expect(mockAddReq).toHaveBeenCalledWith(pick(mockPayload, ['name', 'tunnelProfileId']))
      await waitFor(() => expect(mockCallback).toBeCalledTimes(1))
      expect(mockActivateNetworkReq).toBeCalledTimes(2)
      expect(mockActivateNetworkReq).toHaveBeenCalledWith({
        venueId: 'venue-1',
        wifiNetworkId: 'network-1',
        serviceId: mockServiceId
      }, { forwardingTunnelProfileId: 'tunnel-1' })
      expect(mockActivateNetworkReq).toHaveBeenCalledWith({
        venueId: 'venue-1',
        wifiNetworkId: 'network-2',
        serviceId: mockServiceId
      }, {})
    })

    it('should handle network activation error', async () => {
      const mockError: CommonErrorsResult<CatchErrorDetails> = {
        data: {
          errors: [{
            code: 'NETWORK_ERROR',
            message: 'Network activation failed'
          }],
          requestId: 'req-1'
        },
        status: 400
      }

      mockServer.use(
        rest.put(
          EdgeSdLanUrls.activateEdgeMvSdLanNetwork.url,
          (req, res, ctx) => {
            mockActivateNetworkReq()
            return res(ctx.status(400), ctx.json(mockError))
          }
        )
      )

      const mockCallback = jest.fn()
      const { result } = renderHook(() => useEdgeSdLanActions(), {
        wrapper: ({ children }) => <Provider>{children}</Provider>
      })

      await result.current.createEdgeSdLan({
        payload: mockPayload,
        callback: mockCallback
      })

      expect(mockAddReq).toHaveBeenCalledWith(pick(mockPayload, ['name', 'tunnelProfileId']))
      await waitFor(() => expect(mockActivateNetworkReq).toBeCalledTimes(2))
      await waitFor(() => expect(mockCallback).toBeCalledTimes(1))
      expect(mockCallback).toBeCalledWith(expect.objectContaining({
        data: mockError
      }))
    })
  })

  describe('updateEdgeSdLan', () => {
    const mockOriginData: EdgeSdLanServiceProfile = {
      id: mockServiceId,
      name: 'Original SD-LAN',
      tunnelProfileId: 'tunnel-1',
      activeNetwork: [
        {
          venueId: 'venue-1',
          networkId: 'network-1',
          tunnelProfileId: 'tunnel-1'
        }
      ]
    }

    const mockPayload: EdgeSdLanServiceProfile = {
      id: mockServiceId,
      name: 'Updated SD-LAN',
      tunnelProfileId: 'tunnel-1',
      activeNetwork: [
        {
          venueId: 'venue-1',
          networkId: 'network-2',
          tunnelProfileId: 'tunnel-2'
        }
      ]
    }

    it('should update SD-LAN name and handle network changes', async () => {
      const mockCallback = jest.fn()
      const { result } = renderHook(() => useEdgeSdLanActions(), {
        wrapper: ({ children }) => <Provider>{children}</Provider>
      })

      await result.current.updateEdgeSdLan(mockOriginData, {
        payload: mockPayload,
        callback: mockCallback
      })

      // eslint-disable-next-line max-len
      expect(mockUpdateReq).toHaveBeenCalledWith({ serviceId: mockServiceId }, pick(mockPayload, ['name']))
      expect(mockCallback).toBeCalledTimes(1)
      expect(mockDeactivateNetworkReq).toBeCalledTimes(1)
      expect(mockDeactivateNetworkReq).toHaveBeenCalledWith({
        venueId: 'venue-1',
        wifiNetworkId: 'network-1',
        serviceId: mockServiceId
      })
      expect(mockActivateNetworkReq).toBeCalledTimes(1)
      expect(mockActivateNetworkReq).toHaveBeenCalledWith({
        venueId: 'venue-1',
        wifiNetworkId: 'network-2',
        serviceId: mockServiceId
      }, { forwardingTunnelProfileId: 'tunnel-2' })
    })

    it('should handle network changes error', async () => {
      const mockError: CommonErrorsResult<CatchErrorDetails> = {
        data: {
          errors: [{
            code: 'NETWORK_ERROR',
            message: 'Network update failed'
          }],
          requestId: 'req-1'
        },
        status: 400
      }

      mockServer.use(
        rest.delete(
          EdgeSdLanUrls.deactivateEdgeMvSdLanNetwork.url,
          (req, res, ctx) => {
            return res(ctx.status(400), ctx.json(mockError))
          }
        )
      )

      const mockCallback = jest.fn()
      const { result } = renderHook(() => useEdgeSdLanActions(), {
        wrapper: ({ children }) => <Provider>{children}</Provider>
      })

      await result.current.updateEdgeSdLan(mockOriginData, {
        payload: mockPayload,
        callback: mockCallback
      })

      await waitFor(() => expect(mockCallback).toBeCalledTimes(1))
      expect(mockCallback).toBeCalledWith(expect.objectContaining({
        data: mockError
      }))
    })

    it('should not update SD-LAN name when name is unchanged', async () => {
      const sameNamePayload = {
        ...mockPayload,
        name: 'Original SD-LAN'
      }

      const mockCallback = jest.fn()
      const { result } = renderHook(() => useEdgeSdLanActions(), {
        wrapper: ({ children }) => <Provider>{children}</Provider>
      })

      await result.current.updateEdgeSdLan(mockOriginData, {
        payload: sameNamePayload,
        callback: mockCallback
      })

      await waitFor(() => expect(mockCallback).toBeCalledTimes(1))
      expect(mockUpdateReq).not.toHaveBeenCalled()
    })
  })

  describe('toggleNetworkChange', () => {
    const mockServiceId = 'service-123'
    const mockVenueId = 'venue-123'
    const mockNetworkId = 'network-123'

    it('should not call when tunnel IDs are the same', async () => {
      const mockCallback = jest.fn()
      const { result } = renderHook(() => useEdgeSdLanActions(), {
        wrapper: ({ children }) => <Provider>{children}</Provider>
      })

      const currentTunnelProfileId = 'tunnel-123'
      const originTunnelProfileId = currentTunnelProfileId
      await result.current.toggleNetworkChange(
        mockServiceId,
        mockVenueId,
        mockNetworkId,
        currentTunnelProfileId,
        originTunnelProfileId,
        mockCallback
      )

      expect(mockCallback).not.toHaveBeenCalled()
    })

    it('should call deactivate and activate when tunnel IDs are the different', async () => {
      const mockCallback = jest.fn()
      const { result } = renderHook(() => useEdgeSdLanActions(), {
        wrapper: ({ children }) => <Provider>{children}</Provider>
      })
      const currentTunnelProfileId = 'tunnel-456'
      const originTunnelProfileId = 'tunnel-123'

      await result.current.toggleNetworkChange(
        mockServiceId,
        mockVenueId,
        mockNetworkId,
        currentTunnelProfileId,
        originTunnelProfileId,
        mockCallback
      )

      await waitFor(() => expect(mockDeactivateNetworkReq).toBeCalledTimes(1))
      expect(mockDeactivateNetworkReq).toBeCalledWith({
        venueId: mockVenueId,
        wifiNetworkId: mockNetworkId,
        serviceId: mockServiceId
      })
      await waitFor(() => expect(mockActivateNetworkReq).toBeCalledTimes(1))
      expect(mockActivateNetworkReq).toBeCalledWith({
        venueId: mockVenueId,
        wifiNetworkId: mockNetworkId,
        serviceId: mockServiceId
      }, { forwardingTunnelProfileId: currentTunnelProfileId })
    })
  })
})
