/* eslint-disable max-len */
import { render, screen } from '@acx-ui/test-utils'

import { EdgeClusterDetailsDataContext } from '../EdgeClusterDetailsDataProvider'

import { MonitorTab } from './MonitorTab'

// Mock the components used by MonitorTab
jest.mock('@acx-ui/edge/components', () => ({
  EdgeClusterNodesUpTimeWidget: () => <div data-testid='nodes-uptime-widget'>EdgeClusterNodesUpTimeWidget</div>,
  EdgeClusterTrafficByVolumeWidget: () => <div data-testid='traffic-volume-widget'>EdgeClusterTrafficByVolumeWidget</div>
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

    expect(screen.getByTestId('nodes-uptime-widget')).toBeInTheDocument()
    expect(screen.getByTestId('traffic-volume-widget')).toBeInTheDocument()
  })

  it('renders components even if clusterInfo has no edgeList', () => {
    const mockClusterInfo = {}
    const mockWanPortIfNames = [{ edgeId: 'edge1', ifName: 'wan1' }]

    render(
      <EdgeClusterDetailsDataContext.Provider value={{ clusterInfo: mockClusterInfo }}>
        <MonitorTab wanPortIfNames={mockWanPortIfNames} />
      </EdgeClusterDetailsDataContext.Provider>
    )

    expect(screen.getByTestId('nodes-uptime-widget')).toBeInTheDocument()
    expect(screen.getByTestId('traffic-volume-widget')).toBeInTheDocument()
  })
})
