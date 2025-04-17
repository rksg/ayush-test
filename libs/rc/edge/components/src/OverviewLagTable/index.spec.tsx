import userEvent                   from '@testing-library/user-event'
import { BrowserRouter as Router } from 'react-router-dom'

import { Features, useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { EdgeLagStatus, EdgeStatus, EdgeWanLinkHealthStatusEnum } from '@acx-ui/rc/utils'
import { render, screen, waitFor }                                from '@acx-ui/test-utils'

import { EdgeOverviewLagTable } from './index'

const mockNavigator = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigator
}))

jest.mock('../WanLinkHealthStatusLight', () => ({
  EdgeWanLinkHealthStatusLight: () => <div data-testid='EdgeWanLinkHealthStatusLight'></div>
}))

describe('EdgeOverviewLagTable', () => {
  // const mockNavigate = jest.requireMock('react-router-dom').useNavigate

  const mockData: EdgeLagStatus[] = [
    {
      lagId: 1,
      name: 'LAG 1',
      description: 'Description 1',
      lagType: 'Static',
      status: 'Active',
      adminStatus: 'Enabled',
      // eslint-disable-next-line max-len
      lagMembers: [{ name: 'Port 1', state: 'Up', systemId: '00:11:22:33:44:55', lacpTimeout: 'SHORT' }],
      portType: 'Ethernet',
      mac: '00:11:22:33:44:55',
      ip: '192.168.1.1',
      ipMode: 'Static',
      wanLinkHealth: 'ON',
      wanLinkStatus: EdgeWanLinkHealthStatusEnum.UP,
      wanLinkTargets: [{ targetIp: '8.8.8.8', status: EdgeWanLinkHealthStatusEnum.UP }],
      wanPortRole: 'Primary',
      wanPortStatus: 'Up'
    }
  ]

  const mockEdgeNodes: EdgeStatus[] = [
    { serialNumber: '12345', name: 'Edge Node 1' }
  ]

  describe('Dual WAN enabled', () => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_DUAL_WAN_TOGGLE)
    })

    it('renders the table with data', () => {
      render(
        <Router>
          <EdgeOverviewLagTable
            isConfigurable={true}
            data={mockData}
            isLoading={false}
            isClusterLevel={true}
            edgeNodes={mockEdgeNodes}
          />
        </Router>
      )

      expect(screen.getByText('LAG 1')).toBeInTheDocument()
      expect(screen.getByText('Description 1')).toBeInTheDocument()
      expect(screen.getByText('Static')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Enabled')).toBeInTheDocument()
      expect(screen.getByText('Ethernet')).toBeInTheDocument()
      expect(screen.getByText('192.168.1.1')).toBeInTheDocument()
      expect(screen.getByText('Static')).toBeInTheDocument()
      expect(screen.getByText('Primary')).toBeInTheDocument()
      expect(screen.getByText('Up')).toBeInTheDocument()
    })

    it('handles link health monitoring button click', async () => {
      render(
        <Router>
          <EdgeOverviewLagTable
            isConfigurable={true}
            data={mockData}
            isLoading={false}
            isClusterLevel={true}
            edgeNodes={mockEdgeNodes}
          />
        </Router>
      )

      const linkHealthButton = screen.getByText('ON')
      await userEvent.click(linkHealthButton)

      expect(screen.getByText('Link Health Monitoring')).toBeInTheDocument()
    })

    it('renders expanded row with lag members', async () => {
      render(
        <Router>
          <EdgeOverviewLagTable
            isConfigurable={true}
            data={mockData}
            isLoading={false}
            isClusterLevel={true}
            edgeNodes={mockEdgeNodes}
          />
        </Router>
      )

      const expandButton = screen.getByTestId('PlusSquareOutlined')
      await userEvent.click(expandButton)
      await screen.findByRole('row', { name: /Port/ })
      expect(screen.getByText('Up')).toBeInTheDocument()
      expect(screen.getByText('00:11:22:33:44:55')).toBeInTheDocument()
    })
  })

  describe('Dual WAN disabled', () => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
    })

    it('renders the table with data', () => {
      render(
        <Router>
          <EdgeOverviewLagTable
            isConfigurable={true}
            data={mockData}
            isLoading={false}
            isClusterLevel={true}
            edgeNodes={mockEdgeNodes}
          />
        </Router>
      )

      expect(screen.getByText('LAG 1')).toBeInTheDocument()
      expect(screen.getByText('Description 1')).toBeInTheDocument()
      expect(screen.getByText('Static')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Enabled')).toBeInTheDocument()
      expect(screen.getByText('Ethernet')).toBeInTheDocument()
      expect(screen.getByText('192.168.1.1')).toBeInTheDocument()
      expect(screen.getByText('Static')).toBeInTheDocument()
      expect(screen.getByText('Up')).toBeInTheDocument()
    })

    it('handles link health monitoring button click', async () => {
      render(
        <Router>
          <EdgeOverviewLagTable
            isConfigurable={true}
            data={mockData}
            isLoading={false}
            isClusterLevel={true}
            edgeNodes={mockEdgeNodes}
          />
        </Router>
      )

      const linkHealthButton = screen.getByText('ON')
      await userEvent.click(linkHealthButton)

      expect(screen.getByText('Link Health Monitoring')).toBeInTheDocument()
    })

    it('renders expanded row with lag members', async () => {
      render(
        <Router>
          <EdgeOverviewLagTable
            isConfigurable={true}
            data={mockData}
            isLoading={false}
            isClusterLevel={true}
            edgeNodes={mockEdgeNodes}
          />
        </Router>
      )

      const expandButton = screen.getByTestId('PlusSquareOutlined')
      await userEvent.click(expandButton)
      await screen.findByRole('row', { name: /Port/ })

      expect(screen.getByText(/Port/)).toBeInTheDocument()
      expect(screen.getByText('Up')).toBeInTheDocument()
      expect(screen.getByText('00:11:22:33:44:55')).toBeInTheDocument()
    })
  })

  describe('is cluster level', () => {
    it('renders the table with cluster-level data', () => {
      render(
        <Router>
          <EdgeOverviewLagTable
            isConfigurable={true}
            data={mockData}
            isLoading={false}
            isClusterLevel={true}
            edgeNodes={mockEdgeNodes}
          />
        </Router>
      )

      expect(screen.getByText('LAG 1')).toBeInTheDocument()
      expect(screen.getByText('Cluster Level')).toBeInTheDocument()
    })
  })
})
