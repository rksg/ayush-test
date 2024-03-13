import userEvent from '@testing-library/user-event'
import _         from 'lodash'

import { edgeApi }                                from '@acx-ui/rc/services'
import { EdgeClusterStatus, EdgeGeneralFixtures } from '@acx-ui/rc/utils'
import { Provider, store }                        from '@acx-ui/store'
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
    {spinning && <div data-testid='antd-spinning' />}
    {children}
  </div>
}))

const { mockEdgeClusterList } = EdgeGeneralFixtures

describe('SelectType', () => {
  let params: { tenantId: string, clusterId:string }
  beforeEach(() => {
    params = {
      tenantId: 'mocked_t_id',
      clusterId: 'mocked_cluster_id'
    }
    mockedUsedNavigate.mockReset()
    store.dispatch(edgeApi.util.resetApiState())
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus
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
  it('should navigte to interface setting step', async () => {
    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus
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
  it.skip('should navigte to sub-interface setting step', async () => {
    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus
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
  it('should navigte to cluster interface setting step', async () => {
    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus
        }}>
          <SelectType />
        </ClusterConfigWizardContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })
    await checkDataRendered()
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
  it('should navigte to cluster table page when cancel is clicked', async () => {
    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus
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
          clusterInfo: mockedData.data[0] as EdgeClusterStatus
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

    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockedIncompatibleData.data[0] as EdgeClusterStatus
        }}>
          <SelectType />
        </ClusterConfigWizardContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })
    await checkDataRendered()
    expect(screen.queryByText('Incompatible Hardware warning:')).toBeValid()
    expect(screen.getAllByTestId('antd-spinning').length).toBe(2)
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })
  it('should be no hardware compatible issue when only 1 node', async () => {
    const mockedOneNodeData = _.cloneDeep(mockEdgeClusterList)
    mockedOneNodeData.data[0].edgeList.splice(1, 1)

    render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockedOneNodeData.data[0] as EdgeClusterStatus
        }}>
          <SelectType />
        </ClusterConfigWizardContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })
    await checkDataRendered()
    expect(screen.queryByText('Incompatible Hardware warning:')).toBeNull()
    expect(screen.queryByTestId('antd-spinning')).toBeNull()
    const cardIcon = screen.getAllByRole('radio').filter(i =>
      i.getAttribute('value') === 'clusterInterface'
    )[0]
    await userEvent.click(cardIcon)
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
  })
})

const checkDataRendered = async () => {
  const subTitle = screen.getByText(/set up for all SmartEdges in this cluster/i)
  await waitFor(() => expect(subTitle).toHaveTextContent('(Edge Cluster 1):'))
}