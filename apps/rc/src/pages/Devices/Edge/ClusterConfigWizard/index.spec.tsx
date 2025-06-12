import { useContext } from 'react'

import { rest } from 'msw'

import { Loader }                                                                                                                                  from '@acx-ui/components'
import { edgeApi }                                                                                                                                 from '@acx-ui/rc/services'
import { EdgeCompatibilityFixtures, EdgeGeneralFixtures, EdgeLagFixtures, EdgePortConfigFixtures, EdgeSdLanFixtures, EdgeSdLanUrls, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                                         from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { ClusterConfigWizardContext } from './ClusterConfigWizardDataProvider'

import ClusterConfigWizard from './index'

const { mockEdgeLagStatusList } = EdgeLagFixtures
const { mockEdgePortStatus } = EdgePortConfigFixtures
const { mockedSdLanDataList } = EdgeSdLanFixtures
const { mockEdgeClusterList, mockedHaNetworkSettings } = EdgeGeneralFixtures
const { mockEdgeFeatureCompatibilities } = EdgeCompatibilityFixtures

const mockedUsedNavigate = jest.fn()
const MockedComponent = (props: React.PropsWithChildren) => {
  const { isFetching } = useContext(ClusterConfigWizardContext)
  return <Loader states={[{ isLoading: isFetching }]}>
    {props.children}
  </Loader>
}
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('./SelectType', () => ({
  ...jest.requireActual('./SelectType'),
  SelectType: () => <MockedComponent><div data-testid='rc-SelectType' /></MockedComponent>
}))
jest.mock('./ClusterInterfaceSettings', () => ({
  ...jest.requireActual('./ClusterInterfaceSettings'),
  ClusterInterfaceSettings: () => <MockedComponent>
    <div data-testid='rc-ClusterInterfaceSettings' />
  </MockedComponent>
}))
jest.mock('./InterfaceSettings', () => ({
  ...jest.requireActual('./InterfaceSettings'),
  InterfaceSettings: () => <MockedComponent>
    <div data-testid='rc-InterfaceSettings' />
  </MockedComponent>
}))
jest.mock('./SubInterfaceSettings', () => ({
  ...jest.requireActual('./SubInterfaceSettings'),
  SubInterfaceSettings: () => <MockedComponent>
    <div data-testid='rc-SubInterfaceSettings' />
  </MockedComponent>
}))
describe('ClusterConfigWizard', () => {
  let params: { tenantId: string, clusterId:string }
  beforeEach(() => {
    params = {
      tenantId: 'mocked_t_id',
      clusterId: 'mocked_cluster_id'
    }

    store.dispatch(edgeApi.util.resetApiState())
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgePortStatusList.url,
        (_req, res, ctx) => res(ctx.json({ data: mockEdgePortStatus }))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeLagStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeLagStatusList))
      ),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataList }))
      ),
      rest.get(
        EdgeUrlsInfo.getEdgeClusterNetworkSettings.url,
        (_req, res, ctx) => res(ctx.json(mockedHaNetworkSettings))
      ),
      rest.get(
        EdgeUrlsInfo.getEdgeClusterSubInterfaceSettings.url,
        (_req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeFeatureSets.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeFeatureCompatibilities))
      )
    )
  })

  it('should render SelectType when type is not set', async () => {
    render(
      <Provider>
        <ClusterConfigWizard />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByTestId('rc-SelectType')).toBeInTheDocument()
  })
  it('should render nothing when no match type', async () => {
    const unknownRouteParams = { ...params, settingType: 'anyTest' }
    const { container } = render(
      <Provider>
        <ClusterConfigWizard />
      </Provider>, {
        route: {
          params: unknownRouteParams,
          path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType'
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.queryByTestId('rc-SelectType')).toBeNull()
    await waitFor(() => expect(container).toHaveTextContent('Something is going wrong'))
  })
  it('should render ClusterInterfaceSettings by when type is clusterInterface', async () => {
    const clusterInterfaceRouteParams = { ...params, settingType: 'clusterInterface' }

    render(
      <Provider>
        <ClusterConfigWizard />
      </Provider>, {
        route: {
          params: clusterInterfaceRouteParams,
          path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType'
        }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByTestId('rc-ClusterInterfaceSettings')).toBeInTheDocument()
  })
  it('should render InterfaceSettings by when type is interface', async () => {
    const interfaceRouteParams = { ...params, settingType: 'interface' }

    render(
      <Provider>
        <ClusterConfigWizard />
      </Provider>, {
        route: {
          params: interfaceRouteParams,
          path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType'
        }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByTestId('rc-InterfaceSettings')).toBeInTheDocument()
  })
  it('should render SubInterfaceSettings by when type is subInterface', async () => {
    const subInterfaceRouteParams = { ...params, settingType: 'subInterface' }

    render(
      <Provider>
        <ClusterConfigWizard />
      </Provider>, {
        route: {
          params: subInterfaceRouteParams,
          path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType'
        }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByTestId('rc-SubInterfaceSettings')).toBeInTheDocument()
  })

  it('should render AA mode string when the HA mode of the cluster is AA', async () => {
    const subInterfaceRouteParams = { ...params, settingType: 'subInterface' }

    render(
      <Provider>
        <ClusterConfigWizard />
      </Provider>, {
        route: {
          params: subInterfaceRouteParams,
          path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType'
        }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Edge Cluster 1 (Active-Active HA mode)')).toBeVisible()
  })

  it('should render AB mode string when the HA mode of the cluster is AA', async () => {
    const subInterfaceRouteParams = { ...params, settingType: 'subInterface' }
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json({
          data: [mockEdgeClusterList.data[1]]
        }))
      )
    )

    render(
      <Provider>
        <ClusterConfigWizard />
      </Provider>, {
        route: {
          params: subInterfaceRouteParams,
          path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType'
        }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Edge Cluster 2 (Active-Standby HA mode)')).toBeVisible()
  })
})
