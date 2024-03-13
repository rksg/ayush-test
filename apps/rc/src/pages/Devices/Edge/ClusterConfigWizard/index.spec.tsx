import { rest } from 'msw'

import { edgeApi }                           from '@acx-ui/rc/services'
import { EdgeGeneralFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                   from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import ClusterConfigWizard from './index'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('./SelectType', () => ({
  ...jest.requireActual('./SelectType'),
  SelectType: () => <div data-testid='rc-SelectType' />
}))
jest.mock('./ClusterInterfaceSettings', () => ({
  ...jest.requireActual('./ClusterInterfaceSettings'),
  ClusterInterfaceSettings: () => <div data-testid='rc-ClusterInterfaceSettings' />
}))
jest.mock('./InterfaceSettings', () => ({
  ...jest.requireActual('./InterfaceSettings'),
  InterfaceSettings: () => <div data-testid='rc-InterfaceSettings' />
}))
jest.mock('./SubInterfaceSettings', () => ({
  ...jest.requireActual('./SubInterfaceSettings'),
  SubInterfaceSettings: () => <div data-testid='rc-SubInterfaceSettings' />
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
    expect(await screen.findByTestId('rc-SubInterfaceSettings')).toBeInTheDocument()
  })
})
