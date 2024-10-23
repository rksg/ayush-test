import { cloneDeep, omit, pick } from 'lodash'
import { rest }                  from 'msw'

import { edgeMdnsProxyApi }                                                                     from '@acx-ui/rc/services'
import { BridgeServiceEnum, EdgeMdnsProxyActivation, EdgeMdnsProxyUrls, EdgeMdnsProxyViewData } from '@acx-ui/rc/utils'
import { Provider, store }                                                                      from '@acx-ui/store'
import { mockServer, renderHook }                                                               from '@acx-ui/test-utils'

import { differenceVenueClusters, useEdgeMdnsActions } from './useEdgeMdnsActions'

describe('differenceVenueClusters', () => {
  const first = [{
    venueId: 'venue_1',
    edgeClusterId: 'edge_cluster_1'
  }, {
    venueId: 'venue_2',
    edgeClusterId: 'edge_cluster_2'
  }] as EdgeMdnsProxyActivation[]

  const second = [{
    venueId: 'venue_1',
    edgeClusterId: 'edge_cluster_1'
  }, {
    venueId: 'venue_3',
    edgeClusterId: 'edge_cluster_3'
  }] as EdgeMdnsProxyActivation[]

  it('same', () => {
    const b = cloneDeep(first) as EdgeMdnsProxyActivation[]
    const result = differenceVenueClusters(first, b)
    expect(result).toStrictEqual([])
  })

  it('should be items not in `first`', () => {
    const result = differenceVenueClusters(first, second)
    expect(result).toStrictEqual([first[1]])
  })

  it('should be items not in `second`', () => {
    const result = differenceVenueClusters(second, first)
    expect(result).toStrictEqual([second[1]])
  })
})

const mockedActivateEdgeClusterReq = jest.fn()
const mockedDeactivateEdgeClusterReq = jest.fn()
// const mockedCreateFn = jest.fn()
const mockedCreateReq = jest.fn()
const mockedUpdateReq = jest.fn()

// TODO: add this back when BE activity is done
// jest.mock('@acx-ui/rc/services', () => ({
//   ...jest.requireActual('@acx-ui/rc/services'),
//   useAddEdgeMdnsProxyMutation: () => {
//     return [(req: RequestPayload) => {
//       return { unwrap: () => new Promise((resolve) => {
//         resolve(true)
//         setTimeout(() => {
//           mockedCreateFn()
//           const cbFn = (req.callback as Function)
//           cbFn({
//             response: { id: 'mocked_service_id' }
//           })
//         }, 300)
//       }) }
//     }]
//   }
// }))

describe('useEdgeMdnsActions', () => {
  beforeEach(() => {
    store.dispatch(edgeMdnsProxyApi.util.resetApiState())

    mockedActivateEdgeClusterReq.mockClear()
    mockedDeactivateEdgeClusterReq.mockClear()
    // mockedCreateFn.mockClear()
    mockedCreateReq.mockClear()
    mockedUpdateReq.mockClear()

    mockServer.use(
      rest.post(
        EdgeMdnsProxyUrls.addEdgeMdnsProxy.url,
        (req, res, ctx) => {
          mockedCreateReq(req.body)
          return res(ctx.json({ response: { id: 'mocked_service_id' } }))
        }
      ),
      rest.put(
        EdgeMdnsProxyUrls.updateEdgeMdnsProxy.url,
        (req, res, ctx) => {
          mockedUpdateReq(req.body)
          return res(ctx.status(202))
        }
      ),
      rest.put(
        EdgeMdnsProxyUrls.activateEdgeMdnsProxyCluster.url,
        (req, res, ctx) => {
          mockedActivateEdgeClusterReq(req.params)
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeMdnsProxyUrls.deactivateEdgeMdnsProxyCluster.url,
        (req, res, ctx) => {
          mockedDeactivateEdgeClusterReq(req.params)
          return res(ctx.status(202))
        }
      )
    )
  })

  describe('addEdgeMdns', () => {
    const mockedAddData = {
      name: 'testAddMdns',
      forwardingRules: [{
        service: BridgeServiceEnum.AIRTUNES,
        fromVlan: 1,
        toVlan: 2
      }]
    } as EdgeMdnsProxyViewData

    it('should add successfully with NO clusters scoped', async () => {
      const { result } = renderHook(() => useEdgeMdnsActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { createEdgeMdns } = result.current
      let error
      try {
        await createEdgeMdns(mockedAddData)
      } catch(err) {
        error = err
      }

      expect(error).toBeUndefined()
      // expect(mockedCreateFn).toBeCalled()
      expect(mockedCreateReq).toBeCalled()
      expect(mockedActivateEdgeClusterReq).toBeCalledTimes(0)
    })

    it('should add successfully with clusters scoped', async () => {
      const mockedData = {
        ...mockedAddData,
        activations: [{
          venueId: 'mock_venue_1',
          venueName: 'Mock Venue 1',
          edgeClusterId: 'clusterId_1',
          edgeClusterName: 'Edge Cluster 1'
        }]
      }
      const { result } = renderHook(() => useEdgeMdnsActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { createEdgeMdns } = result.current
      let error
      try {
        await createEdgeMdns(mockedData)
      } catch(err) {
        error = err
      }

      expect(error).toBeUndefined()
      // expect(mockedCreateFn).toBeCalled()
      expect(mockedCreateReq).toBeCalled()
      expect(mockedActivateEdgeClusterReq).toBeCalledTimes(1)
      expect(mockedActivateEdgeClusterReq).toBeCalledWith({
        serviceId: 'mocked_service_id',
        venueId: 'mock_venue_1',
        edgeClusterId: 'clusterId_1'
      })
    })
  })

  describe('editEdgeMdns', () => {
    const mockedEditData = {
      id: 'testEditMdnsId',
      name: 'testEditMdns',
      forwardingRules: [{
        service: BridgeServiceEnum.GOOGLE_CHROMECAST,
        fromVlan: 1,
        toVlan: 2
      }]
    } as EdgeMdnsProxyViewData

    it('should update profile successfully', async () => {
      const mockedData = {
        ...mockedEditData,
        forwardingRules: [{
          service: BridgeServiceEnum.AIRPLAY,
          fromVlan: 10,
          toVlan: 20
        },{
          service: BridgeServiceEnum.APPLETV,
          fromVlan: 1,
          toVlan: 2
        }],
        activations: [{
          venueId: 'mock_venue_1',
          venueName: 'Mock Venue 1',
          edgeClusterId: 'clusterId_1',
          edgeClusterName: 'Edge Cluster 1'
        }]
      }
      const { result } = renderHook(() => useEdgeMdnsActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { editEdgeMdns } = result.current
      let error
      try {
        await editEdgeMdns(mockedData, mockedEditData)
      } catch(err) {
        error = err
      }

      expect(error).toBeUndefined()
      const expected = cloneDeep(mockedData)
      expected.forwardingRules = mockedData.forwardingRules.map(i => ({
        ...omit(i, 'service'),
        serviceType: i.service
      }))
      expect(mockedUpdateReq).toBeCalledTimes(1)
      expect(mockedUpdateReq).toBeCalledWith(pick(expected, 'name', 'forwardingRules'))
      expect(mockedActivateEdgeClusterReq).toBeCalledWith({
        serviceId: 'testEditMdnsId',
        venueId: 'mock_venue_1',
        edgeClusterId: 'clusterId_1'
      })
      expect(mockedDeactivateEdgeClusterReq).toBeCalledTimes(0)
    })

    it('should update activations successfully', async () => {
      const mockedOriginData = cloneDeep(mockedEditData)
      mockedOriginData.activations = [{
        venueId: 'mock_venue_1',
        venueName: 'Mock Venue 1',
        edgeClusterId: 'clusterId_1',
        edgeClusterName: 'Edge Cluster 1'
      }]

      const mockedData = {
        ...mockedEditData,
        forwardingRules: [{
          service: BridgeServiceEnum.AIRPLAY,
          fromVlan: 10,
          toVlan: 20
        },{
          service: BridgeServiceEnum.APPLETV,
          fromVlan: 1,
          toVlan: 2
        }],
        activations: [{
          venueId: 'mock_venue_2',
          venueName: 'Mock Venue 2',
          edgeClusterId: 'clusterId_2',
          edgeClusterName: 'Edge Cluster 2'
        }, {
          venueId: 'mock_venue_3',
          venueName: 'Mock Venue 3',
          edgeClusterId: 'clusterId_4',
          edgeClusterName: 'Edge Cluster 4'
        }]
      }
      const { result } = renderHook(() => useEdgeMdnsActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { editEdgeMdns } = result.current
      let error
      try {
        await editEdgeMdns(mockedData, mockedOriginData)
      } catch(err) {
        error = err
      }

      expect(error).toBeUndefined()
      expect(mockedUpdateReq).toBeCalledTimes(1)
      expect(mockedActivateEdgeClusterReq).toBeCalledTimes(2)
      expect(mockedActivateEdgeClusterReq).toBeCalledWith({
        serviceId: 'testEditMdnsId',
        venueId: 'mock_venue_2',
        edgeClusterId: 'clusterId_2'
      })
      expect(mockedActivateEdgeClusterReq).toBeCalledWith({
        serviceId: 'testEditMdnsId',
        venueId: 'mock_venue_3',
        edgeClusterId: 'clusterId_4'
      })
      expect(mockedDeactivateEdgeClusterReq).toBeCalledTimes(1)
      expect(mockedDeactivateEdgeClusterReq).toBeCalledWith({
        serviceId: 'testEditMdnsId',
        venueId: 'mock_venue_1',
        edgeClusterId: 'clusterId_1'
      })
    })
  })
})