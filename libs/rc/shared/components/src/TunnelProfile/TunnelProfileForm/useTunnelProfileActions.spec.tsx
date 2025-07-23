import { act, renderHook, waitFor } from '@testing-library/react'
import _                            from 'lodash'
import { rest }                     from 'msw'
import { Provider }                 from 'react-redux'

import { Features }                                                                                      from '@acx-ui/feature-toggle'
import { MtuTypeEnum, NetworkSegmentTypeEnum, TunnelProfileFormType, TunnelProfileUrls, TunnelTypeEnum } from '@acx-ui/rc/utils'
import { store }                                                                                         from '@acx-ui/store'
import { mockServer }                                                                                    from '@acx-ui/test-utils'
import { RequestPayload }                                                                                from '@acx-ui/types'


import { useIsEdgeFeatureReady } from '../../useEdgeActions'

import { useTunnelProfileActions } from './useTunnelProfileActions'

jest.mock('../../useEdgeActions', () => ({
  ...jest.requireActual('../../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsBetaEnabled: jest.fn().mockReturnValue(false)
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useCreateTunnelProfileMutation: jest.fn()
}))

const mockedAddFn = jest.fn()
const mockedUpdateFn = jest.fn()
const mockedCreateTunnelApi = jest.fn()
const mockedUpdateTunnelApi = jest.fn()
const mockedActivateTunnelApi = jest.fn()
const mockedDeactivateTunnelApi = jest.fn()

jest.mock('@acx-ui/rc/services', () => {
  const originalModule = jest.requireActual('@acx-ui/rc/services')
  return {
    ...originalModule,
    useCreateTunnelProfileMutation: () => {
      let isCreating = false

      return [
        (req: RequestPayload) => {
          isCreating = true
          return {
            unwrap: () => new Promise((resolve) => {
              mockedAddFn(req.payload)
              resolve(true)
              setTimeout(() => {
                isCreating = false;
                (req.callback as Function)({
                  response: { id: 'mock_tunnel_id' }
                })
              }, 300)
            })
          }
        },
        { isLoading: isCreating }
      ]
    },
    useUpdateTunnelProfileMutation: () => {
      let isUpdating = false

      return [
        (req: RequestPayload) => {
          isUpdating = true
          return {
            unwrap: () => new Promise((resolve) => {
              mockedUpdateFn(req.payload)
              resolve(true)
            })
          }
        },
        { isLoading: isUpdating }
      ]
    },
    useCreateTunnelProfileTemplateMutation: () => {
      let isCreating = false

      return [
        (req: RequestPayload) => {
          isCreating = true
          return {
            unwrap: () => new Promise((resolve) => {
              mockedAddFn(req.payload)
              resolve(true)
              setTimeout(() => {
                isCreating = false;
                (req.callback as Function)({
                  response: { id: 'mock_tunnel_id' }
                })
              }, 300)
            })
          }
        },
        { isLoading: isCreating }
      ]
    },
    useUpdateTunnelProfileTemplateMutation: () => {
      let isCreating = false

      return [
        (req: RequestPayload) => {
          isCreating = true
          return {
            unwrap: () => new Promise((resolve) => {
              mockedUpdateFn(req.payload)
              resolve(true)
            })
          }
        },
        { isLoading: isCreating }
      ]
    }
  }
})

describe('useTunnelProfileActions', () => {
  const mockData: TunnelProfileFormType = {
    id: 'mock_tunnel_id',
    name: 'testTunnel',
    tags: '',
    mtuType: MtuTypeEnum.AUTO,
    forceFragmentation: false,
    ageTimeMinutes: 0,
    type: NetworkSegmentTypeEnum.VXLAN
  }
  beforeEach(() => {
    jest.mocked(useIsEdgeFeatureReady)
      .mockImplementation(ff =>(ff === Features.EDGE_L2OGRE_TOGGLE))
    jest.mocked(mockedAddFn).mockReset()
    jest.mocked(mockedUpdateFn).mockReset()
    jest.mocked(mockedActivateTunnelApi).mockReset()
    jest.mocked(mockedDeactivateTunnelApi).mockReset()

    mockServer.use(
      rest.post(
        TunnelProfileUrls.createTunnelProfile.url,
        (req, res, ctx) => {
          mockedCreateTunnelApi()
          return res(ctx.status(202))
        }
      ),
      rest.put(
        TunnelProfileUrls.updateTunnelProfile.url,
        (req, res, ctx) => {
          mockedUpdateTunnelApi()
          return res(ctx.status(202))
        }
      ),
      rest.put(
        TunnelProfileUrls.activateTunnelProfileByEdgeCluster.url,
        (req, res, ctx) => {
          mockedActivateTunnelApi()
          return res(ctx.json({ requestId: 'request_id' }))
        }
      ),
      rest.delete(
        TunnelProfileUrls.deactivateTunnelProfileByEdgeCluster.url,
        (req, res, ctx) => {
          mockedDeactivateTunnelApi()
          return res(ctx.json({ requestId: 'request_id' }))
        }
      )
    )})

  afterEach(() => {
    jest.mocked(useIsEdgeFeatureReady).mockReset()
  })


  it('should create and activate cluster and handle callback', async () => {
    const { result } = renderHook(() => useTunnelProfileActions(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    const payload = _.cloneDeep(mockData)
    payload.venueId= 'mock_venue_id'
    payload.edgeClusterId= 'mock_cluster_id'
    const { createTunnelProfileOperation, isTunnelProfileCreating } = result.current
    await act(async () => {
      await createTunnelProfileOperation(payload)
    })

    await waitFor(() => expect(mockedAddFn).toHaveBeenCalledWith(mockData))
    await waitFor(() =>expect(isTunnelProfileCreating).toBeFalsy())
    await waitFor(() => expect(mockedActivateTunnelApi).toBeCalledTimes(1))
  })

  it('should update and activate cluster and handle callback', async () => {
    const { result } = renderHook(() => useTunnelProfileActions(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    const { updateTunnelProfileOperation, isTunnelProfileUpdating } = result.current
    const payload = _.cloneDeep(mockData)
    payload.mtuSize = 1500
    payload.venueId= 'mock_venue_id'
    payload.edgeClusterId= 'mock_cluster_id'
    await act(async () => {
      await updateTunnelProfileOperation('mock_tunnel_id', payload, mockData)
    })

    await waitFor(() => expect(mockedUpdateFn).toHaveBeenCalledWith(mockData))
    await waitFor(() =>expect(isTunnelProfileUpdating).toBeFalsy())
    await waitFor(() => expect(mockedActivateTunnelApi).toBeCalledTimes(1))
  })

  it('should update and deactivate cluster and handle callback', async () => {
    const { result } = renderHook(() => useTunnelProfileActions(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    const { updateTunnelProfileOperation, isTunnelProfileUpdating } = result.current

    const l2greMockData = _.cloneDeep(mockData)
    l2greMockData.tunnelType = TunnelTypeEnum.L2GRE
    l2greMockData.mtuType = MtuTypeEnum.MANUAL
    l2greMockData.natTraversalEnabled = false
    l2greMockData.venueId = 'mock_venue_id'
    l2greMockData.edgeClusterId = 'mock_cluster_id'
    const initData = _.cloneDeep(l2greMockData)
    await act(async () => {
      await updateTunnelProfileOperation('mock_tunnel_id', l2greMockData, initData )
    })

    const { edgeClusterId, venueId, ...rest } = l2greMockData
    await waitFor(() => expect(mockedUpdateFn).toHaveBeenCalledWith(rest))
    await waitFor(() =>expect(isTunnelProfileUpdating).toBeFalsy())
    await waitFor(() => expect(mockedDeactivateTunnelApi).toBeCalledTimes(1))
  })

  it('should create tunnel profile template and activate cluster', async () => {
    const { result } = renderHook(() => useTunnelProfileActions(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    const payload = _.cloneDeep(mockData)
    payload.venueId= 'mock_venue_id'
    payload.edgeClusterId= 'mock_cluster_id'
    const { createTunnelProfileTemplateOperation, isTunnelProfileTemplateCreating } = result.current
    await act(async () => {
      await createTunnelProfileTemplateOperation(payload)
    })

    await waitFor(() => expect(mockedAddFn).toHaveBeenCalledWith(mockData))
    await waitFor(() =>expect(isTunnelProfileTemplateCreating).toBeFalsy())
    await waitFor(() => expect(mockedActivateTunnelApi).toBeCalledTimes(1))
  })
})