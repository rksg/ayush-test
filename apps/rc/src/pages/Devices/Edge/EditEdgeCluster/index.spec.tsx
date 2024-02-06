import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { edgeApi }                                                                       from '@acx-ui/rc/services'
import { CommonOperation, Device, EdgeGeneralFixtures, EdgeUrlsInfo, activeTab, getUrl } from '@acx-ui/rc/utils'
import { Provider, store }                                                               from '@acx-ui/store'
import { mockServer, render, screen }                                                    from '@acx-ui/test-utils'

import EditEdgeCluster from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('./ClusterDetails', () => ({
  ClusterDetails: () => <div data-testid='cluster-details' />
}))
jest.mock('./EdgeClusterDhcp', () => ({
  EdgeClusterDhcp: () => <div data-testid='dhcp' />
}))
jest.mock('./VirtualIp', () => ({
  VirtualIp: () => <div data-testid='virtual-ip' />
}))

const { mockEdgeClusterList, mockEdgeCluster } = EdgeGeneralFixtures

describe('Edit Edge Cluster', () => {
  let params: { tenantId: string, clusterId: string, activeTab: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      clusterId: 'testClusterId',
      activeTab: 'cluster-details'
    }
    store.dispatch(edgeApi.util.resetApiState())
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      ),
      rest.get(
        EdgeUrlsInfo.getEdgeCluster.url,
        (req, res, ctx) => res(ctx.json(mockEdgeCluster))
      )
    )
  })

  it('should render EditEdgeCluster successfully', async () => {
    render(
      <Provider>
        <EditEdgeCluster />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    expect((await screen.findAllByRole('tab')).length).toBe(4)
    expect(await screen.findByTestId('cluster-details')).toBeVisible()
  })

  it('should change tab correctly', async () => {
    render(
      <Provider>
        <EditEdgeCluster />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    await userEvent.click(await screen.findByRole('tab', { name: 'Cluster Interface' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t${getUrl({
        feature: Device.EdgeCluster,
        oper: CommonOperation.Edit,
        after: [activeTab],
        params: {
          id: params.clusterId,
          activeTab: 'cluster-interface'
        } })}`,
      hash: '',
      search: ''
    })
  })
})