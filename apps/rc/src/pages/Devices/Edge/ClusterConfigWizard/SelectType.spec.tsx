import userEvent from '@testing-library/user-event'
import _         from 'lodash'

import { Features }                                                                from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                                   from '@acx-ui/rc/components'
import { edgeApi }                                                                 from '@acx-ui/rc/services'
import { ClusterHighAvailabilityModeEnum, EdgeClusterStatus, EdgeGeneralFixtures } from '@acx-ui/rc/utils'
import { Provider, store }                                                         from '@acx-ui/store'
import {
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { ClusterConfigWizardContext } from './ClusterConfigWizardDataProvider'
import { SelectType }                 from './SelectType'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Spin: ({ children, spinning }: React.PropsWithChildren
  & { spinning: boolean }) => <div>
    {spinning && <div data-testid='antd-disabled-frame' />}
    {children}
  </div>
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

const { mockEdgeClusterList, mockedHaNetworkSettings } = EdgeGeneralFixtures

describe('SelectType', () => {
  let params: { tenantId: string, clusterId:string }
  beforeEach(() => {
    params = {
      tenantId: 'mocked_t_id',
      clusterId: 'mocked_cluster_id'
    }
    mockedUsedNavigate.mockReset()
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)
    store.dispatch(edgeApi.util.resetApiState())
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
          clusterNetworkSettings: mockedHaNetworkSettings,
          isLoading: false,
          isFetching: false
        }}>
          <SelectType />
        </ClusterConfigWizardContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })

    await checkDataRendered()
    expect(screen.getByText('LAG, Port, HA Settings')).toBeInTheDocument()
    // expect(screen.getByText('Sub-interface Settings')).toBeInTheDocument()
    expect(screen.getByText('Cluster Interface Settings')).toBeInTheDocument()
  })
  it('should show LAG, Port & Virtual IP Settings card for AB cluster', async () => {
    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: {
            ...(mockEdgeClusterList.data[0] as EdgeClusterStatus),
            highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY
          },
          clusterNetworkSettings: mockedHaNetworkSettings,
          isLoading: false,
          isFetching: false
        }}>
          <SelectType />
        </ClusterConfigWizardContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })

    await checkDataRendered()
    expect(screen.getByText('LAG, Port & Virtual IP Settings')).toBeInTheDocument()
    // expect(screen.getByText('Sub-interface Settings')).toBeInTheDocument()
    expect(screen.getByText('Cluster Interface Settings')).toBeInTheDocument()
  })
  it('should navigate to interface setting step', async () => {
    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
          clusterNetworkSettings: mockedHaNetworkSettings,
          isLoading: false,
          isFetching: false
        }}>
          <SelectType />
        </ClusterConfigWizardContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })

    await checkDataRendered()
    const cardIcon = screen.getAllByRole('radio').filter(i =>
      i.getAttribute('value') === 'interface'
    )[0]
    expect(cardIcon).toBeInTheDocument()
    await userEvent.click(cardIcon)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/devices/edge/cluster/${params.clusterId}/configure/interface`,
      hash: '',
      search: ''
    })
  })
  it.skip('should navigate to sub-interface setting step', async () => {
    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
          clusterNetworkSettings: mockedHaNetworkSettings,
          isLoading: false,
          isFetching: false
        }}>
          <SelectType />
        </ClusterConfigWizardContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })
    await checkDataRendered()
    const cardIcon = screen.getAllByRole('radio').filter(i =>
      i.getAttribute('value') === 'subInterface'
    )[0]
    expect(cardIcon).toBeInTheDocument()
    await userEvent.click(cardIcon)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/devices/edge/cluster/${params.clusterId}/configure/subInterface`,
      hash: '',
      search: ''
    })
  })
  it('should navigate to cluster interface setting step', async () => {
    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
          clusterNetworkSettings: mockedHaNetworkSettings,
          isLoading: false,
          isFetching: false
        }}>
          <SelectType />
        </ClusterConfigWizardContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })
    await checkDataRendered()
    await waitFor(() => expect(screen.queryByTestId('antd-disabled-frame')).toBeNull())
    const cardIcon = screen.getAllByRole('radio').filter(i =>
      i.getAttribute('value') === 'clusterInterface'
    )[0]
    expect(cardIcon).toBeInTheDocument()
    await userEvent.click(cardIcon)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/devices/edge/cluster/${params.clusterId}/configure/clusterInterface`,
      hash: '',
      search: ''
    })
  })
  it('should navigate to cluster table page when cancel is clicked', async () => {
    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
          clusterNetworkSettings: mockedHaNetworkSettings,
          isLoading: false,
          isFetching: false
        }}>
          <SelectType />
        </ClusterConfigWizardContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })
    await checkDataRendered()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge`,
      hash: '',
      search: ''
    })
  })
  it('should block next button when edge list is empty', async () => {
    const mockedData = _.cloneDeep(mockEdgeClusterList)
    mockedData.data[0].edgeList = []

    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockedData.data[0] as EdgeClusterStatus,
          clusterNetworkSettings: mockedHaNetworkSettings,
          isLoading: false,
          isFetching: false
        }}>
          <SelectType />
        </ClusterConfigWizardContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })
    await checkDataRendered()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })
  it('should display warning when cluster nodes are hardware incompatible', async () => {
    const mockedIncompatibleData = _.cloneDeep(mockEdgeClusterList)
    mockedIncompatibleData.data[0].edgeList[0].memoryTotalKb = 26156250
    mockedIncompatibleData.data[0].edgeList[1].memoryTotalKb = 22250000

    jest.mocked(useIsEdgeFeatureReady).mockImplementation((feature) =>
      feature === Features.EDGE_HA_SUB_INTERFACE_TOGGLE)

    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockedIncompatibleData.data[0] as EdgeClusterStatus,
          clusterNetworkSettings: mockedHaNetworkSettings,
          isLoading: false,
          isFetching: false
        }}>
          <SelectType />
        </ClusterConfigWizardContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })
    await checkDataRendered()
    expect(screen.queryByText('Incompatible Hardware warning:')).toBeValid()
    expect(screen.getAllByTestId('antd-disabled-frame').length).toBe(3)
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })
  it('should be no hardware compatible issue when only 1 node', async () => {
    const mockedOneNodeData = _.cloneDeep(mockEdgeClusterList)
    mockedOneNodeData.data[0].edgeList.splice(1, 1)

    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockedOneNodeData.data[0] as EdgeClusterStatus,
          clusterNetworkSettings: mockedHaNetworkSettings,
          isLoading: false,
          isFetching: false
        }}>
          <SelectType />
        </ClusterConfigWizardContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })
    await checkDataRendered()
    expect(screen.queryByText('Incompatible Hardware warning:')).toBeNull()
    await waitFor(() => expect(screen.queryByTestId('antd-disabled-frame')).toBeNull())
    const cardIcon = screen.getAllByRole('radio').filter(i =>
      i.getAttribute('value') === 'clusterInterface'
    )[0]
    await userEvent.click(cardIcon)
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
  })

  it('cluster interface card should be disabled when there is no gateway', async () => {
    const mockedOneNodeData = _.cloneDeep(mockEdgeClusterList)
    mockedOneNodeData.data[0].edgeList.splice(1, 1)

    jest.mocked(useIsEdgeFeatureReady).mockImplementation((feature) =>
      feature === Features.EDGE_HA_SUB_INTERFACE_TOGGLE)

    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockedOneNodeData.data[0] as EdgeClusterStatus,
          isLoading: false,
          isFetching: false
        }}>
          <SelectType />
        </ClusterConfigWizardContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })
    await checkDataRendered()
    expect(screen.queryByText('Incompatible Hardware warning:')).toBeNull()
    await waitFor(() => expect(screen.queryAllByTestId('antd-disabled-frame').length).toBe(2))
    const cardIcon = screen.getAllByRole('radio').filter(i =>
      i.getAttribute('value') === 'clusterInterface'
    )[0]
    await userEvent.hover(cardIcon)
    expect(
      await screen.findByRole('tooltip')
    ).toHaveTextContent('Please complete the LAG, Port & Virtual IP Settings first')
  })

  it('sub-interface card should be hidden when core access FF is ON', async () => {
    const mockedOneNodeData = _.cloneDeep(mockEdgeClusterList)
    mockedOneNodeData.data[0].edgeList.splice(1, 1)

    jest.mocked(useIsEdgeFeatureReady).mockImplementation((feature) =>
      feature === Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)

    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockedOneNodeData.data[0] as EdgeClusterStatus,
          isLoading: false,
          isFetching: false
        }}>
          <SelectType />
        </ClusterConfigWizardContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })
    await checkDataRendered()
    expect(screen.queryByText('Sub-interface Settings')).toBeNull()
    expect(screen.getByText('LAG, Port, Sub-Interface & HA Settings')).toBeVisible()
  })
})

const checkDataRendered = async () => {
  expect(screen.getByText(/Edge Cluster 1 \(Active-(Active|Standby) HA mode\)/i)).toBeVisible()
}