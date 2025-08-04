import { act, renderHook, waitFor } from '@testing-library/react'
import { cloneDeep, omit }          from 'lodash'
import { rest }                     from 'msw'
import { Provider }                 from 'react-redux'

import { Features }                                                                                      from '@acx-ui/feature-toggle'
import { MtuTypeEnum, NetworkSegmentTypeEnum, TunnelProfileFormType, TunnelProfileUrls, TunnelTypeEnum } from '@acx-ui/rc/utils'
import { store }                                                                                         from '@acx-ui/store'
import { mockServer }                                                                                    from '@acx-ui/test-utils'
import { RequestPayload }                                                                                from '@acx-ui/types'


import { useIsEdgeFeatureReady } from '../../useEdgeActions'

import { useTunnelProfileActions, nonTunnelProfileConfigKeys } from './useTunnelProfileActions'

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
const mockedActivateClusterApi = jest.fn()
const mockedDeactivateClusterApi = jest.fn()
const mockedActivateIpsecApi = jest.fn()
const mockedDeactivateIpsecApi = jest.fn()

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
    type: NetworkSegmentTypeEnum.VXLAN,
    tunnelType: TunnelTypeEnum.VXLAN_GPE
  }

  const l2greMockData = cloneDeep(mockData)
  l2greMockData.tunnelType = TunnelTypeEnum.L2GRE
  l2greMockData.mtuType = MtuTypeEnum.MANUAL
  l2greMockData.natTraversalEnabled = false
  l2greMockData.venueId = 'mock_venue_id'
  l2greMockData.edgeClusterId = 'mock_cluster_id'

  beforeEach(() => {
    jest.resetAllMocks()

    jest.mocked(useIsEdgeFeatureReady)
      .mockImplementation(ff =>(ff === Features.EDGE_L2OGRE_TOGGLE))

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
          mockedActivateClusterApi()
          return res(ctx.json({ requestId: 'request_id' }))
        }
      ),
      rest.delete(
        TunnelProfileUrls.deactivateTunnelProfileByEdgeCluster.url,
        (req, res, ctx) => {
          mockedDeactivateClusterApi()
          return res(ctx.json({ requestId: 'request_id' }))
        }
      ),
      rest.put(
        TunnelProfileUrls.activateTunnelProfileByIpsecProfile.url,
        (req, res, ctx) => {
          mockedActivateIpsecApi()
          return res(ctx.json({ requestId: 'request_id' }))
        }
      ),
      rest.delete(
        TunnelProfileUrls.deactivateTunnelProfileByIpsecProfile.url,
        (req, res, ctx) => {
          mockedDeactivateIpsecApi()
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

    const payload = cloneDeep(mockData)
    payload.venueId= 'mock_venue_id'
    payload.edgeClusterId= 'mock_cluster_id'
    const { createTunnelProfileOperation, isTunnelProfileCreating } = result.current
    await act(async () => {
      await createTunnelProfileOperation(payload)
    })

    await waitFor(() => expect(mockedAddFn).toHaveBeenCalledWith(mockData))
    await waitFor(() => expect(isTunnelProfileCreating).toBeFalsy())
    await waitFor(() => expect(mockedActivateClusterApi).toBeCalledTimes(1))
  })

  it('should update and activate cluster and handle callback', async () => {
    const { result } = renderHook(() => useTunnelProfileActions(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    const { updateTunnelProfileOperation, isTunnelProfileUpdating } = result.current
    const payload = cloneDeep(mockData)
    payload.mtuSize = 1500
    payload.venueId= 'mock_venue_id'
    payload.edgeClusterId= 'mock_cluster_id'
    await act(async () => {
      await updateTunnelProfileOperation('mock_tunnel_id', payload, mockData)
    })

    await waitFor(() => expect(mockedUpdateFn).toHaveBeenCalledWith(mockData))
    await waitFor(() => expect(isTunnelProfileUpdating).toBeFalsy())
    await waitFor(() => expect(mockedActivateClusterApi).toBeCalledTimes(1))
  })

  it('should update and deactivate cluster and handle callback', async () => {
    const { result } = renderHook(() => useTunnelProfileActions(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    const { updateTunnelProfileOperation, isTunnelProfileUpdating } = result.current

    const initData = cloneDeep(l2greMockData)
    await act(async () => {
      await updateTunnelProfileOperation('mock_tunnel_id', l2greMockData, initData )
    })

    await waitFor(() => expect(mockedDeactivateClusterApi).toBeCalledTimes(1))
    expect(mockedUpdateFn).toBeCalledTimes(0)
    await waitFor(() => expect(isTunnelProfileUpdating).toBeFalsy())
  })

  it('should create tunnel profile template and activate cluster', async () => {
    const { result } = renderHook(() => useTunnelProfileActions(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    const payload = cloneDeep(mockData)
    payload.venueId= 'mock_venue_id'
    payload.edgeClusterId= 'mock_cluster_id'
    const { createTunnelProfileTemplateOperation, isTunnelProfileTemplateCreating } = result.current
    await act(async () => {
      await createTunnelProfileTemplateOperation(payload)
    })

    await waitFor(() => expect(mockedAddFn).toHaveBeenCalledWith(mockData))
    await waitFor(() => expect(isTunnelProfileTemplateCreating).toBeFalsy())
    await waitFor(() => expect(mockedActivateClusterApi).toBeCalledTimes(1))
  })

  describe('Ipsec VxLan FF enabled', () => {
    const mockIpsecProfileId = 'mock_ipsec_profile_id'
    const mockIpsecPayload = cloneDeep(mockData)
    mockIpsecPayload.venueId= 'mock_venue_id'
    mockIpsecPayload.edgeClusterId= 'mock_cluster_id'
    mockIpsecPayload.tunnelEncryptionEnabled = true
    mockIpsecPayload.ipsecProfileId = mockIpsecProfileId

    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff =>(ff === Features.EDGE_IPSEC_VXLAN_TOGGLE
          || ff === Features.EDGE_L2OGRE_TOGGLE
        ))
    })

    afterEach(() => {
      jest.mocked(useIsEdgeFeatureReady).mockReset()
    })

    it('should create and activate ipsec profile and handle callback', async () => {
      const { result } = renderHook(() => useTunnelProfileActions(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      })

      const { createTunnelProfileOperation, isTunnelProfileCreating } = result.current
      await act(async () => {
        await createTunnelProfileOperation(mockIpsecPayload)
      })

      await waitFor(() => expect(mockedAddFn).toHaveBeenCalledWith(mockData))
      await waitFor(() => expect(isTunnelProfileCreating).toBeFalsy())
      await waitFor(() => expect(mockedActivateIpsecApi).toBeCalledTimes(1))
    })

    it('should update and change ipsec profile and handle callback', async () => {
      const { result } = renderHook(() => useTunnelProfileActions(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      })

      const { updateTunnelProfileOperation, isTunnelProfileUpdating } = result.current
      const payload = cloneDeep(mockIpsecPayload)
      payload.mtuSize = 1500
      payload.ipsecProfileId= 'changed_ipsec_profile_id'
      await act(async () => {
        await updateTunnelProfileOperation('mock_tunnel_id', payload, mockIpsecPayload)
      })

      const expectConfigData = omit(mockIpsecPayload, nonTunnelProfileConfigKeys)
      await waitFor(() => expect(mockedUpdateFn).toHaveBeenCalledWith(expectConfigData))
      await waitFor(() => expect(isTunnelProfileUpdating).toBeFalsy())
      await waitFor(() => expect(mockedActivateIpsecApi).toBeCalledTimes(1))
    })

    it('should change from vxlan gpe with ipsec to l2gre and handle callback', async () => {
      const { result } = renderHook(() => useTunnelProfileActions(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      })

      const { updateTunnelProfileOperation, isTunnelProfileUpdating } = result.current

      await act(async () => {
        await updateTunnelProfileOperation('mock_tunnel_id', l2greMockData, mockIpsecPayload )
      })

      const expectConfigData = omit(l2greMockData, nonTunnelProfileConfigKeys)
      await waitFor(() => expect(mockedUpdateFn).toHaveBeenCalledWith(expectConfigData))
      await waitFor(() => expect(isTunnelProfileUpdating).toBeFalsy())
      await waitFor(() => expect(mockedDeactivateClusterApi).toBeCalledTimes(1))
      await waitFor(() => expect(mockedDeactivateIpsecApi).toBeCalledTimes(1))
    })

    it('should change from l2gre to vxlan gpe with ipsec and handle callback', async () => {
      const { result } = renderHook(() => useTunnelProfileActions(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      })

      const { updateTunnelProfileOperation, isTunnelProfileUpdating } = result.current

      await act(async () => {
        await updateTunnelProfileOperation('mock_tunnel_id', mockIpsecPayload, l2greMockData)
      })

      const expectConfigData = omit(mockIpsecPayload, nonTunnelProfileConfigKeys)
      await waitFor(() => expect(mockedUpdateFn).toHaveBeenCalledWith(expectConfigData))
      await waitFor(() => expect(isTunnelProfileUpdating).toBeFalsy())
      await waitFor(() => expect(mockedActivateIpsecApi).toBeCalledTimes(1))
    })

    // eslint-disable-next-line max-len
    it('should disassociate ipsec profile when tunnelEncryptionEnabled is false and handle callback', async () => {
      const { result } = renderHook(() => useTunnelProfileActions(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      })

      const { updateTunnelProfileOperation, isTunnelProfileUpdating } = result.current

      const payloadNoIpsec = cloneDeep(mockIpsecPayload)
      payloadNoIpsec.tunnelEncryptionEnabled = false
      await act(async () => {
        await updateTunnelProfileOperation('mock_tunnel_id', payloadNoIpsec, mockIpsecPayload )
      })

      await waitFor(() => expect(isTunnelProfileUpdating).toBeFalsy())
      await waitFor(() => expect(mockedDeactivateIpsecApi).toBeCalledTimes(1))
      expect(mockedUpdateFn).toBeCalledTimes(0)
    })

    it('should disassociate ipsec profile and handle callback', async () => {
      const { result } = renderHook(() => useTunnelProfileActions(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      })

      const { updateTunnelProfileOperation, isTunnelProfileUpdating } = result.current

      const payloadNoIpsec = cloneDeep(mockIpsecPayload)
      payloadNoIpsec.tunnelEncryptionEnabled = false
      payloadNoIpsec.ipsecProfileId = ''
      await act(async () => {
        await updateTunnelProfileOperation('mock_tunnel_id', payloadNoIpsec, mockIpsecPayload )
      })

      await waitFor(() => expect(isTunnelProfileUpdating).toBeFalsy())
      await waitFor(() => expect(mockedDeactivateIpsecApi).toBeCalledTimes(1))
      expect(mockedUpdateFn).toBeCalledTimes(0)
    })
  })
})