import { userEvent } from '@testing-library/user-event'
import { cloneDeep } from 'lodash'

import { Features, useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { EdgeLagFixtures, EdgeLagStatus, EdgePortConfigFixtures } from '@acx-ui/rc/utils'
import { render, screen, waitFor }                                from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from '../../useEdgeActions'

import { EdgePortsTable } from '.'

const { edgePortsSetting, mockedEdgePortWithDualWan } = EdgePortConfigFixtures
const { mockEdgeLagStatusList } = EdgeLagFixtures

jest.mock('../../useEdgeActions', () => ({
  useIsEdgeFeatureReady: jest.fn()
}))

describe('Edge Ports Table', () => {
  it('should correctly render', async () => {
    render(<EdgePortsTable
      portData={edgePortsSetting}
      lagData={mockEdgeLagStatusList.data as EdgeLagStatus[]}
    />)

    const portsRow = (await screen.findAllByRole('row'))
      .filter(row => row.className.includes('ant-table-row'))

    expect(portsRow.length).toBe(2)
    expect(screen.getByRole('row', {
      name: 'Port1 description1 Up Enabled WAN AA:BB:CC:DD:EE:FF 1.1.1.1/24 DHCP 35.8 Gbps'
    })).toBeValid()

    expect(screen.getByRole('row',{
      name: 'Port2 description2 Down Disabled LAN AA:BB:CC:DD:EE:F1 1.1.1.2 Static IP 29.9 Gbps'
    })).toBeValid()
  })

  it('should show lag name', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const portData = cloneDeep(edgePortsSetting)
    portData[0].portId = mockEdgeLagStatusList.data[0].lagMembers[0].portId
    render(<EdgePortsTable
      portData={portData}
      lagData={mockEdgeLagStatusList.data as EdgeLagStatus[]}
    />)

    const portsRow = (await screen.findAllByRole('row'))
      .filter(row => row.className.includes('ant-table-row'))

    expect(portsRow.length).toBe(2)
    expect(screen.getByRole('row', {
      name: 'Port1 description1 Up Enabled AA:BB:CC:DD:EE:FF 35.8 Gbps LAG 1'
    })).toBeValid()

    expect(screen.getByRole('row',{
      name: 'Port2 description2 Down Disabled LAN AA:BB:CC:DD:EE:F1 1.1.1.2 Static IP 29.9 Gbps'
    })).toBeValid()
  })

  describe('EdgePortsTable - Dual WAN Columns', () => {

    beforeEach(() => {
      jest.clearAllMocks()
      jest.mocked(useIsEdgeFeatureReady).mockImplementation((ff) =>
        ff === Features.EDGE_DUAL_WAN_TOGGLE)
    })

    it('should render dual WAN columns when isEdgeDualWanEnabled is true', () => {
      render(
        <EdgePortsTable
          portData={mockedEdgePortWithDualWan}
          lagData={mockEdgeLagStatusList.data}
          edgeNodes={mockEdgeNodes}
          isClusterLevel={true}
        />
      )

      // Check if dual WAN columns are rendered
      expect(screen.getByText('Link Health Monitoring')).toBeInTheDocument()
      expect(screen.getByText('Link Health Status')).toBeInTheDocument()
      expect(screen.getByText('WAN Role')).toBeInTheDocument()
      expect(screen.getByText('WAN Status')).toBeInTheDocument()

      // Check if data is rendered correctly
      expect(screen.getByText('ON')).toBeInTheDocument()
      expect(screen.getByText('UP')).toBeInTheDocument()
      expect(screen.getByText('Primary')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should not render dual WAN columns when isEdgeDualWanEnabled is false', () => {
      (useIsEdgeFeatureReady as jest.Mock).mockReturnValue(false)

      render(
        <EdgePortsTable
          portData={mockPortData}
          lagData={mockEdgeLagStatusList.data}
          edgeNodes={mockEdgeNodes}
          isClusterLevel={true}
        />
      )

      // Check if dual WAN columns are not rendered
      expect(screen.queryByText('Link Health Monitoring')).not.toBeInTheDocument()
      expect(screen.queryByText('Link Health Status')).not.toBeInTheDocument()
      expect(screen.queryByText('WAN Role')).not.toBeInTheDocument()
      expect(screen.queryByText('WAN Status')).not.toBeInTheDocument()
    })

    it('should handle Link Health Monitoring button click', async () => {
      render(
        <EdgePortsTable
          portData={mockPortData}
          lagData={mockEdgeLagStatusList.data}
          edgeNodes={mockEdgeNodes}
          isClusterLevel={true}
        />
      )

      // Click the Link Health Monitoring button
      const button = screen.getByRole('button', { name: 'ON' })
      await userEvent.click(button)

      // Wait for the drawer to open
      await waitFor(() => {
        expect(screen.getByText('Link Health Details')).toBeInTheDocument()
      })
    })

    it('should display correct WAN Link Status data', () => {

      render(
        <EdgePortsTable
          portData={mockPortData}
          lagData={mockEdgeLagStatusList.data}
          edgeNodes={mockEdgeNodes}
          isClusterLevel={true}
        />
      )

      // Check WAN Link Status data
      expect(screen.getByText('UP')).toBeInTheDocument()
      expect(screen.getByText('DOWN')).toBeInTheDocument()
    })

    it('should not display node name column when it is not cluster level', () => {

      render(
        <EdgePortsTable
          portData={mockPortData}
          lagData={mockEdgeLagStatusList.data}
          edgeNodes={mockEdgeNodes}
          isClusterLevel={false}
        />
      )

      // Check WAN Link Status data
      expect(screen.getByText('UP')).toBeInTheDocument()
      expect(screen.getByText('DOWN')).toBeInTheDocument()
      expect(screen.queryByRole('columnheader', { name: 'Node Name' })).not.toBeInTheDocument()
    })
  })
})