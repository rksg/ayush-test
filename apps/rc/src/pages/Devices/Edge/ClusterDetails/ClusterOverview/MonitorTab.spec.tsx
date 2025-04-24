/* eslint-disable max-len */
import { render, screen } from '@acx-ui/test-utils'

import { EdgeClusterDetailsDataContext } from '../EdgeClusterDetailsDataProvider'

import { MonitorTab } from './MonitorTab'

// Mock the components used by MonitorTab
jest.mock('@acx-ui/edge/components', () => ({
  EdgeClusterNodesUpTimeWidget: () => <div data-testid='EdgeClusterNodesUpTimeWidget'>EdgeClusterNodesUpTimeWidget</div>,
  EdgeClusterWanPortsTrafficByVolumeWidget: () => <div data-testid='EdgeClusterWanPortsTrafficByVolumeWidget'>EdgeClusterWanPortsTrafficByVolumeWidget</div>
}))

describe('MonitorTab', () => {
  it('renders EdgeClusterNodesUpTimeWidget and EdgeClusterTrafficByVolumeWidget with correct props', () => {
    const mockClusterInfo = {
      edgeList: [{ id: 'edge1' }, { id: 'edge2' }]
    }
    const mockWanPortIfNames = [{ edgeId: 'edge1', ifName: 'wan1' }]

    render(
      <EdgeClusterDetailsDataContext.Provider value={{ clusterInfo: mockClusterInfo }}>
        <MonitorTab wanPortIfNames={mockWanPortIfNames} />
      </EdgeClusterDetailsDataContext.Provider>
    )

    expect(screen.getByTestId('EdgeClusterNodesUpTimeWidget')).toBeInTheDocument()
    expect(screen.getByTestId('EdgeClusterWanPortsTrafficByVolumeWidget')).toBeInTheDocument()
  })

  it('renders components even if clusterInfo has no edgeList', () => {
    const mockClusterInfo = {}
    const mockWanPortIfNames = [{ edgeId: 'edge1', ifName: 'wan1' }]

    render(
      <EdgeClusterDetailsDataContext.Provider value={{ clusterInfo: mockClusterInfo }}>
        <MonitorTab wanPortIfNames={mockWanPortIfNames} />
      </EdgeClusterDetailsDataContext.Provider>
    )

    expect(screen.getByTestId('EdgeClusterNodesUpTimeWidget')).toBeInTheDocument()
    expect(screen.getByTestId('EdgeClusterWanPortsTrafficByVolumeWidget')).toBeInTheDocument()
  })
})
