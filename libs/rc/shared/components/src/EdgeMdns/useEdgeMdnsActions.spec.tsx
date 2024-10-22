import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { edgeMdnsProxyApi }                                                  from '@acx-ui/rc/services'
import { EdgeMdnsProxyActivation, EdgeMdnsProxyUrls, EdgeMdnsProxyViewData } from '@acx-ui/rc/utils'
import { Provider, store }                                                   from '@acx-ui/store'
import { mockServer, renderHook, waitFor }                                   from '@acx-ui/test-utils'
import { RequestPayload }                                                    from '@acx-ui/types'

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

const mockedCallback = jest.fn()
const mockedActivateEdgeClusterReq = jest.fn()
const mockedDeactivateEdgeClusterReq = jest.fn()
const mockedUpdateReq = jest.fn()

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useAddEdgeMdnsProxyMutation: () => {
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

describe('useEdgeMdnsActions', () => {
  beforeEach(() => {
    store.dispatch(edgeMdnsProxyApi.util.resetApiState())

    mockedCallback.mockClear()
    mockedActivateEdgeClusterReq.mockClear()
    mockedDeactivateEdgeClusterReq.mockClear()
    mockedUpdateReq.mockClear()

    mockServer.use(
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
        serviceType: 'BRIDGE',
        fromVlan: 1,
        toVlan: 2
      }]
    } as EdgeMdnsProxyViewData

    it('should add successfully', async () => {
      const mockedData = {
        ...mockedAddData,
        networks: { mocked_venue_id: ['network_1', 'network_3'] }
      }
      const { result } = renderHook(() => useEdgeMdnsActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { createEdgeMdns } = result.current
      await createEdgeMdns({
        payload: mockedData,
        callback: mockedCallback
      })
      await waitFor(() =>
        expect(mockedActivateEdgeClusterReq).toBeCalledWith({
          edgeClusterId: '0000000005',
          serviceId: 'mocked_service_id',
          venueId: 'mocked_venue_id'
        }))
      await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
    })
  })

  describe('editEdgeMdns', () => {
    const mockedEditData = {
      name: 'testEditMdns',
      forwardingRules: [{
        serviceType: 'BRIDGE',
        fromVlan: 1,
        toVlan: 2
      }]
    } as EdgeMdnsProxyViewData

    it('should update successfully', async () => {
      const mockedData = {
        ...mockedEditData,
        networks: { mocked_venue_id: ['network_1', 'network_3'] }
      }
      const { result } = renderHook(() => useEdgeMdnsActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { editEdgeMdns } = result.current
      await editEdgeMdns(mockedData, mockedEditData)
      await waitFor(() =>
        expect(mockedActivateEdgeClusterReq).toBeCalledWith({
          edgeClusterId: '0000000005',
          serviceId: 'mocked_service_id'
        }))
      await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
    })
  })
})