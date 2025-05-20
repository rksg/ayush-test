/* eslint-disable max-len */
import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'

import { EdgeClusterStatus, EdgeGeneralFixtures } from '@acx-ui/rc/utils'
import { render, screen }                         from '@acx-ui/test-utils'

import { EdgeClusterInfoWidget } from './EdgeClusterInfoWidget'


const { mockEdgeClusterList } = EdgeGeneralFixtures

// Mock the components used
jest.mock('@acx-ui/edge/components', () => ({
  EdgeAlarmWidget: ({ onClick }) => <div onClick={() => onClick('alarm')} data-testid='alarm-widget'>EdgeAlarmWidget</div>,
  EdgeClusterNodesWidget: () => <div data-testid='cluster-nodes-widget'>EdgeClusterNodesWidget</div>,
  EdgePortsWidget: ({ onClick }) => <div onClick={() => onClick('port')} data-testid='ports-widget'>EdgePortsWidget</div>
}))

jest.mock('./ClusterDetailsDrawer', () => ({
  EdgeClusterDetailsDrawer: () => <div data-testid='cluster-details-drawer'>EdgeClusterDetailsDrawer</div>
}))

const mockCluster = cloneDeep(mockEdgeClusterList.data[0]) as EdgeClusterStatus
mockCluster.name = 'Test Cluster'
describe('EdgeClusterInfoWidget', () => {
  it('renders cluster model - virtual Edge', () => {
    render(<EdgeClusterInfoWidget
      currentCluster={mockCluster}
      clusterPortsSetting={[]}
      isEdgeClusterLoading={false}
      isPortListLoading={false}
    />)

    expect(screen.getByText('Virtual RUCKUS Edge')).toBeInTheDocument()
  })

  it('renders cluster model - physical Edge', () => {
    const mockData = cloneDeep(mockCluster) as EdgeClusterStatus
    mockData.edgeList?.forEach(edge => edge.model = 'E114')

    render(<EdgeClusterInfoWidget
      currentCluster={mockData}
      clusterPortsSetting={[]}
      isEdgeClusterLoading={false}
      isPortListLoading={false}
    />)

    expect(screen.getByText('RUCKUS Edge 114')).toBeInTheDocument()
  })

  it('calls onClickWidget when EdgePortsWidget is clicked', async () => {
    const mockOnClickWidget = jest.fn()

    render(
      <EdgeClusterInfoWidget
        currentCluster={mockCluster}
        clusterPortsSetting={[]}
        isEdgeClusterLoading={false}
        isPortListLoading={false}
        onClickWidget={mockOnClickWidget}
      />
    )

    await userEvent.click(screen.getByTestId('ports-widget'))
    expect(mockOnClickWidget).toHaveBeenCalledWith('port')
  })

  it('calls onClickWidget when EdgeAlarmWidget is clicked', async () => {
    const mockOnClickWidget = jest.fn()

    render(
      <EdgeClusterInfoWidget
        currentCluster={mockCluster}
        clusterPortsSetting={[]}
        isEdgeClusterLoading={false}
        isPortListLoading={false}
        onClickWidget={mockOnClickWidget}
      />
    )

    await userEvent.click(screen.getByTestId('alarm-widget'))
    expect(mockOnClickWidget).toHaveBeenCalledWith('alarm')
  })

  it('opens details drawer when More Details button is clicked', async () => {
    render(
      <EdgeClusterInfoWidget
        currentCluster={mockCluster}
        clusterPortsSetting={[]}
        isEdgeClusterLoading={false}
        isPortListLoading={false}
      />
    )

    await userEvent.click(screen.getByText('More Details'))
    expect(screen.getByTestId('cluster-details-drawer')).toBeInTheDocument()
  })
})
