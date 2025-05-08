import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { Features, useIsSplitOn }                                                                                          from '@acx-ui/feature-toggle'
import { edgeApi }                                                                                                         from '@acx-ui/rc/services'
import { CommonOperation, Device, EdgeGeneralFixtures, EdgePortTypeEnum, EdgeStatusEnum, EdgeUrlsInfo, activeTab, getUrl } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                 from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                                                             from '@acx-ui/test-utils'

import EditEdgeCluster from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('./ClusterDetails', () => ({
  ClusterDetails: () => <div data-testid='cluster-details' />
}))
jest.mock('./NetworkControl', () => ({
  EdgeNetworkControl: () => <div data-testid='network-control' />
}))
jest.mock('./VirtualIp', () => ({
  VirtualIp: () => <div data-testid='virtual-ip' />
}))

const { mockEdgeClusterList, mockEdgeCluster, mockedHaNetworkSettings } = EdgeGeneralFixtures

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
      ),
      rest.get(
        EdgeUrlsInfo.getEdgeClusterNetworkSettings.url,
        (_req, res, ctx) => res(ctx.json(mockedHaNetworkSettings))
      )
    )

    jest.mocked(useIsSplitOn).mockReturnValue(true)
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

  it('when DHCP_and QoS OFF, should not render Network Control', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff !== Features.EDGE_DHCP_HA_TOGGLE && ff !== Features.EDGE_QOS_TOGGLE)
    render(
      <Provider>
        <EditEdgeCluster />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    expect((await screen.findAllByRole('tab')).length).toBe(3)
    expect(screen.queryByTestId('network-control')).toBeNull()
  })

  // eslint-disable-next-line max-len
  it('when networkSettings without gateway, should be disabled "Cluster Interface" tab', async () => {
    const mockApiFn = jest.fn()
    const mockedNetworkSettings = cloneDeep(mockedHaNetworkSettings)
    mockedNetworkSettings.portSettings.forEach((item) => {
      item.ports.forEach((port) => {
        port.portType = EdgePortTypeEnum.UNCONFIGURED
        port.enabled = true
      })
    })
    mockedNetworkSettings.lagSettings = []

    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getEdgeClusterNetworkSettings.url,
        (req, res, ctx) => {
          mockApiFn()
          return res(ctx.json(mockedNetworkSettings))
        }
      )
    )
    render(
      <Provider>
        <EditEdgeCluster />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    await waitFor(() => expect(mockApiFn).toBeCalledTimes(1))
    await waitFor(async () =>
      expect(screen.getByRole('tab', { name: 'Cluster Details' }).getAttribute('aria-disabled'))
        .toBe('false'))
    await waitFor(async () =>
      expect(screen.getByRole('tab', { name: 'Cluster Interface' }).getAttribute('aria-disabled'))
        .toBe('true'))
    await waitFor(async () =>
      expect(screen.getByRole('tab', { name: 'Network Control' }).getAttribute('aria-disabled'))
        .toBe('false'))
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

  // eslint-disable-next-line max-len
  it('Tabs except "Cluster Details" should be disabled when all nodes are NEVER_CONTACTED_CLOUD', async () => {
    const mockApiFn = jest.fn()
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (req, res, ctx) => {
          mockApiFn()
          return res(ctx.json({
            data: [
              {
                edgeList: [
                  {
                    deviceStatus: EdgeStatusEnum.NEVER_CONTACTED_CLOUD
                  },
                  {
                    deviceStatus: EdgeStatusEnum.NEVER_CONTACTED_CLOUD
                  }
                ]
              }]
          }))
        }
      )
    )
    render(
      <Provider>
        <EditEdgeCluster />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    await waitFor(() => expect(mockApiFn).toBeCalledTimes(1))
    await waitFor(async () =>
      expect(screen.getByRole('tab', { name: 'Cluster Details' }).getAttribute('aria-disabled'))
        .toBe('false'))
    await waitFor(async () =>
      expect(screen.getByRole('tab', { name: 'Virtual IP' }).getAttribute('aria-disabled'))
        .toBe('true'))
    await waitFor(async () =>
      expect(screen.getByRole('tab', { name: 'Cluster Interface' }).getAttribute('aria-disabled'))
        .toBe('true'))
    await waitFor(async () =>
      expect(screen.getByRole('tab', { name: 'Network Control' }).getAttribute('aria-disabled'))
        .toBe('true'))
  })
})