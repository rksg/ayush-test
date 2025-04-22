import userEvent                   from '@testing-library/user-event'
import { cloneDeep }               from 'lodash'
import { BrowserRouter as Router } from 'react-router-dom'

import { Features, useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { EdgeLagStatus, EdgeStatus, EdgeWanLinkHealthStatusEnum } from '@acx-ui/rc/utils'
import { render, screen, within }                                 from '@acx-ui/test-utils'

import { EdgeOverviewLagTable } from './index'

const mockNavigator = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigator
}))

jest.mock('../WanLinkHealthStatusLight', () => ({
  EdgeWanLinkHealthStatusLight: () => <div data-testid='EdgeWanLinkHealthStatusLight'></div>
}))
jest.mock('../WanLinkHealthDetails', () => ({
  EdgeWanLinkHealthDetailsDrawer: (props: {
    visible: boolean
    portName: string
  }) =>
    props.visible && <div data-testid='EdgeWanLinkHealthDetailsDrawer'>
      {props.portName}
    </div>
}))

describe('EdgeOverviewLagTable', () => {
  const mockEdgeNodes: EdgeStatus[] = [
    { serialNumber: '12345', name: 'Edge Node 1' }
  ]

  const mockData: EdgeLagStatus[] = [
    {
      lagId: 1,
      serialNumber: mockEdgeNodes[0].serialNumber,
      name: 'LAG 1',
      description: 'Description 1',
      lagType: 'Static',
      status: 'Active',
      adminStatus: 'Enabled',
      // eslint-disable-next-line max-len
      lagMembers: [{ name: 'Port 1', state: 'Up', systemId: '00:11:22:33:44:55', lacpTimeout: 'SHORT' }],
      portType: 'WAN',
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

  describe('Dual WAN enabled', () => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_DUAL_WAN_TOGGLE)
    })

    it('renders loading icon when isLoading is true', async () => {
      render(
        <Router>
          <EdgeOverviewLagTable
            data={mockData}
            isLoading={true}
          />
        </Router>
      )

      screen.getByRole('img', { name: 'loader' })
      expect(screen.queryByRole('table')).toBeNull()
    })

    it('renders the table with data', async () => {
      render(
        <Router>
          <EdgeOverviewLagTable
            data={mockData}
            isLoading={false}
            isClusterLevel={true}
            edgeNodes={mockEdgeNodes}
          />
        </Router>
      )

      const row = await screen.findByRole('row', { name: /LAG 1/ })
      await screen.findByText('Node Name')
      expect(screen.getByText('Edge Node 1')).toBeInTheDocument()
      expect(within(row).getByText('LAG 1')).toBeInTheDocument()
      expect(within(row).getByText('Description 1')).toBeInTheDocument()
      expect(within(row).getByText('Static')).toBeInTheDocument()
      expect(within(row).getByText('Active')).toBeInTheDocument()
      expect(within(row).getByText('Enabled')).toBeInTheDocument()
      expect(within(row).getByText('WAN')).toBeInTheDocument()
      expect(within(row).getByText('192.168.1.1')).toBeInTheDocument()
      expect(within(row).getByText('Static')).toBeInTheDocument()

      expect(screen.queryByRole('columnheader', { name: 'Link Health Monitoring' })).toBeValid()
      expect(screen.queryByRole('columnheader', { name: 'Link Health Status' })).toBeValid()
      expect(screen.queryByRole('columnheader', { name: 'WAN Role' })).toBeValid()
      expect(screen.queryByRole('columnheader', { name: 'WAN Status' })).toBeValid()
      expect(within(row).getByText('ON')).toBeInTheDocument()
      expect(within(row).getByText('Primary')).toBeInTheDocument()
      expect(within(row).getByText('Up')).toBeInTheDocument()
    })

    it('renders non cluster level with empty edge nodes data', async () => {
      render(
        <Router>
          <EdgeOverviewLagTable
            data={mockData}
            isLoading={false}
            isClusterLevel={true}
            edgeNodes={[]}
          />
        </Router>
      )

      await screen.findByRole('row', { name: /LAG 1/ })
      // cluster level column should be rendered
      await screen.findByText('Node Name')
    })

    it('handles link health monitoring button click', async () => {
      render(
        <Router>
          <EdgeOverviewLagTable
            data={mockData}
            isLoading={false}
            isClusterLevel={true}
            edgeNodes={mockEdgeNodes}
          />
        </Router>
      )

      const targetRow = await screen.findByRole('row', { name: /LAG 1/ })
      expect(targetRow).toBeInTheDocument()

      const linkHealthButton = await within(targetRow).findByRole('button', { name: 'ON' })
      await userEvent.click(linkHealthButton)

      const linkHealthDetails = await screen.findByTestId('EdgeWanLinkHealthDetailsDrawer')
      expect(linkHealthDetails).toHaveTextContent('lag1')
    })

    it('renders expanded row', async () => {
      render(
        <Router>
          <EdgeOverviewLagTable
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
      await screen.findByTestId('MinusSquareOutlined')
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
            data={mockData}
            isLoading={false}
            isClusterLevel={true}
            edgeNodes={mockEdgeNodes}
          />
        </Router>
      )

      expect(screen.queryByRole('columnheader', { name: 'Node Name' })).toBeNull()
      expect(screen.queryByText('Edge Node 1')).toBeNull()

      expect(screen.getByText('LAG 1')).toBeInTheDocument()
      expect(screen.getByText('Description 1')).toBeInTheDocument()
      expect(screen.getByText('Static')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Enabled')).toBeInTheDocument()
      expect(screen.getByText('WAN')).toBeInTheDocument()
      expect(screen.getByText('192.168.1.1')).toBeInTheDocument()
      expect(screen.getByText('Static')).toBeInTheDocument()

      expect(screen.queryByRole('columnheader', { name: 'Link Health Monitoring' })).toBeNull()
      expect(screen.queryByRole('columnheader', { name: 'Link Health Status' })).toBeNull()
      expect(screen.queryByRole('columnheader', { name: 'WAN Role' })).toBeNull()
      expect(screen.queryByRole('columnheader', { name: 'WAN Status' })).toBeNull()
    })

    it('renders member with 0 when it is undefined', async () => {
      const mockDataWithEmptyLagMembers = cloneDeep(mockData)
      mockDataWithEmptyLagMembers[0].lagMembers = undefined

      render(
        <Router>
          <EdgeOverviewLagTable
            data={mockDataWithEmptyLagMembers}
            isLoading={false}
          />
        </Router>
      )

      const row = await screen.findByRole('row', { name: /LAG 1/ })
      expect(row).toHaveTextContent('Enabled0WAN')
    })

    it('renders expanded row with lag members', async () => {
      render(
        <Router>
          <EdgeOverviewLagTable
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
      await screen.findByTestId('MinusSquareOutlined')
    })
  })
})
