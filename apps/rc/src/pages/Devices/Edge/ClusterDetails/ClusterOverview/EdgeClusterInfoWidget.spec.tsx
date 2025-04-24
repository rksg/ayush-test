/* eslint-disable max-len */
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { EdgeClusterInfoWidget } from './EdgeClusterInfoWidget'

// Mock the components used
jest.mock('@acx-ui/edge/components', () => ({
  EdgeAlarmWidget: ({ onClick }) => <div onClick={() => onClick('alarm')} data-testid='alarm-widget'>EdgeAlarmWidget</div>,
  EdgeClusterNodesWidget: () => <div data-testid='cluster-nodes-widget'>EdgeClusterNodesWidget</div>,
  EdgePortsWidget: ({ onClick }) => <div onClick={() => onClick('port')} data-testid='ports-widget'>EdgePortsWidget</div>
}))

jest.mock('./ClusterDetailsDrawer', () => ({
  EdgeClusterDetailsDrawer: () => <div data-testid='cluster-details-drawer'>EdgeClusterDetailsDrawer</div>
}))

describe('EdgeClusterInfoWidget', () => {
  it('renders cluster name', () => {
    render(
      <EdgeClusterInfoWidget
        currentCluster={{ name: 'Test Cluster', edgeList: [] }}
        clusterPortsSetting={[]}
        isEdgeClusterLoading={false}
        isPortListLoading={false}
      />
    )

    expect(screen.getByText('Test Cluster')).toBeInTheDocument()
  })

  it('calls onClickWidget when EdgePortsWidget is clicked', () => {
    const mockOnClickWidget = jest.fn()

    render(
      <EdgeClusterInfoWidget
        currentCluster={{ name: 'Test Cluster', edgeList: [] }}
        clusterPortsSetting={[]}
        isEdgeClusterLoading={false}
        isPortListLoading={false}
        onClickWidget={mockOnClickWidget}
      />
    )

    fireEvent.click(screen.getByTestId('ports-widget'))
    expect(mockOnClickWidget).toHaveBeenCalledWith('port')
  })

  it('calls onClickWidget when EdgeAlarmWidget is clicked', () => {
    const mockOnClickWidget = jest.fn()

    render(
      <EdgeClusterInfoWidget
        currentCluster={{ name: 'Test Cluster', edgeList: [] }}
        clusterPortsSetting={[]}
        isEdgeClusterLoading={false}
        isPortListLoading={false}
        onClickWidget={mockOnClickWidget}
      />
    )

    fireEvent.click(screen.getByTestId('alarm-widget'))
    expect(mockOnClickWidget).toHaveBeenCalledWith('alarm')
  })

  it('opens details drawer when More Details button is clicked', () => {
    render(
      <EdgeClusterInfoWidget
        currentCluster={{ name: 'Test Cluster', edgeList: [] }}
        clusterPortsSetting={[]}
        isEdgeClusterLoading={false}
        isPortListLoading={false}
      />
    )

    fireEvent.click(screen.getByText('More Details'))
    expect(screen.getByTestId('cluster-details-drawer')).toBeInTheDocument()
  })
})
