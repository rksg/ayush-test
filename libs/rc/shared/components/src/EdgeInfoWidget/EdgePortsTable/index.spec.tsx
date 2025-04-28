import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'

import { Features, useIsSplitOn }                                                      from '@acx-ui/feature-toggle'
import { EdgeLagFixtures, EdgeLagStatus, EdgePortConfigFixtures, EdgeGeneralFixtures } from '@acx-ui/rc/utils'
import { Provider }                                                                    from '@acx-ui/store'
import { render, screen, within }                                                      from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from '../../useEdgeActions'

import { EdgePortsTable } from '.'

const { edgePortsSetting, mockedEdgePortWithDualWan } = EdgePortConfigFixtures
const { mockEdgeLagStatusList } = EdgeLagFixtures
const { mockEdgeList } = EdgeGeneralFixtures
const mockEdgeNodes = mockEdgeList.data
const portWithLagMember = cloneDeep(edgePortsSetting)
portWithLagMember[0].portId = mockEdgeLagStatusList.data[0].lagMembers[0].portId

jest.mock('../../useEdgeActions', () => ({
  useIsEdgeFeatureReady: jest.fn()
}))

const params = { tenantId: 'tenant-id' }
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

    render(<EdgePortsTable
      portData={portWithLagMember}
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

  it('calls handleClickLagName when a LAG name is clicked', async () => {
    const mockHandleClickLagName = jest.fn()

    render(
      <EdgePortsTable
        portData={portWithLagMember}
        lagData={mockEdgeLagStatusList.data as EdgeLagStatus[]}
        handleClickLagName={mockHandleClickLagName}
      />
    )

    await userEvent.click(screen.getByText('LAG 1'))
    expect(mockHandleClickLagName).toHaveBeenCalled()
  })

  describe('EdgePortsTable - Dual WAN Columns', () => {
    const dualWanWithLagMember = cloneDeep(mockedEdgePortWithDualWan)
    dualWanWithLagMember[0].portId = mockEdgeLagStatusList.data[0].lagMembers[0].portId

    const clusterPortsWithSerialNumber = cloneDeep(dualWanWithLagMember)
    clusterPortsWithSerialNumber[0].serialNumber = mockEdgeNodes[0].serialNumber
    clusterPortsWithSerialNumber[1].serialNumber = mockEdgeNodes[0].serialNumber

    beforeEach(() => {
      jest.clearAllMocks()
      jest.mocked(useIsEdgeFeatureReady).mockImplementation((ff) =>
        ff === Features.EDGE_DUAL_WAN_TOGGLE)
    })

    it('should render dual WAN columns when isEdgeDualWanEnabled is true', () => {
      render(<Provider>
        <EdgePortsTable
          portData={clusterPortsWithSerialNumber}
          lagData={mockEdgeLagStatusList.data}
          edgeNodes={mockEdgeNodes}
          isClusterLevel={true}
        />
      </Provider>, { route: { params } })

      // Check if default dual WAN columns are rendered
      // optional columns should not visible
      expect(screen.queryByText('Link Health Monitoring')).not.toBeInTheDocument()
      expect(screen.queryByText('WAN Role')).not.toBeInTheDocument()
      expect(screen.getByText('Link Health Status')).toBeInTheDocument()
      expect(screen.getByText('WAN Status')).toBeInTheDocument()

      // Check if data is rendered correctly
      // optional columns should not visible
      expect(screen.queryByText('On')).not.toBeInTheDocument()
      expect(screen.queryByText('Primary')).not.toBeInTheDocument()
      expect(screen.getAllByText('Up')).toHaveLength(2)
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should not render deprecated columns when isEdgeDualWanEnabled is true', () => {
      render(<Provider>
        <EdgePortsTable
          portData={clusterPortsWithSerialNumber}
          lagData={mockEdgeLagStatusList.data}
          edgeNodes={mockEdgeNodes}
          isClusterLevel={true}
        />
      </Provider>, { route: { params } })

      const row = screen.getByRole('row', { name: /Port2/ })
      expect(screen.queryByRole('columnheader', { name: 'Description' })).toBeNull()
      expect(within(row).queryByText('Description 1')).not.toBeInTheDocument()
      expect(screen.queryByRole('columnheader', { name: 'IP Type' })).toBeNull()
      expect(within(row).queryByText('Static')).not.toBeInTheDocument()
    })

    it('should not render dual WAN columns when isEdgeDualWanEnabled is false', () => {
      (useIsEdgeFeatureReady as jest.Mock).mockReturnValue(false)

      render(<Provider>
        <EdgePortsTable
          portData={clusterPortsWithSerialNumber}
          lagData={mockEdgeLagStatusList.data}
          edgeNodes={mockEdgeNodes}
          isClusterLevel={true}
        />
      </Provider>, { route: { params } })

      // Check if dual WAN columns are not rendered
      expect(screen.queryByText('Link Health Monitoring')).not.toBeInTheDocument()
      expect(screen.queryByText('Link Health Status')).not.toBeInTheDocument()
      expect(screen.queryByText('WAN Role')).not.toBeInTheDocument()
      expect(screen.queryByText('WAN Status')).not.toBeInTheDocument()
    })

    it('should handle Link Health Monitoring button click', async () => {
      render(<Provider>
        <EdgePortsTable
          portData={clusterPortsWithSerialNumber}
          lagData={mockEdgeLagStatusList.data}
          edgeNodes={mockEdgeNodes}
          isClusterLevel={true}
        />
      </Provider>, { route: { params } })

      await showLinkHealthMonitoringColumn()

      // Click the Link Health Monitoring button
      const button = screen.getByRole('button', { name: 'On' })
      await userEvent.click(button)

      // Wait for the drawer to open
      expect(await screen.findByText('Port1: Link Health Monitoring')).toBeInTheDocument()
    })

    it('should display text - off when link health check is off', async () => {
      const mockData = cloneDeep(clusterPortsWithSerialNumber)
      mockData[0].linkHealthMonitoring = {
        linkHealthMonitorEnabled: false
      }

      render(<Provider>
        <EdgePortsTable
          portData={mockData}
          lagData={mockEdgeLagStatusList.data}
          edgeNodes={mockEdgeNodes}
          isClusterLevel={true}
        />
      </Provider>, { route: { params } })

      await showLinkHealthMonitoringColumn()

      const button = screen.queryByRole('button', { name: 'Off' })
      expect(button).toBeNull()
      const port1Row = screen.getByRole('row', { name: /Port1/ })
      expect(within(port1Row).queryByText('Off')).toBeVisible()
    })

    it('should display correct WAN Link Status data', () => {

      render(<Provider>
        <EdgePortsTable
          portData={clusterPortsWithSerialNumber}
          lagData={mockEdgeLagStatusList.data}
          edgeNodes={mockEdgeNodes}
          isClusterLevel={true}
        />
      </Provider>, { route: { params } })

      // Check WAN Link Status data
      expect(screen.getAllByText('Up')).toHaveLength(2)
      expect(screen.getByText('Down')).toBeInTheDocument()
    })

    it('should not display node name column when it is not cluster level', () => {

      render(<Provider>
        <EdgePortsTable
          portData={clusterPortsWithSerialNumber}
          lagData={mockEdgeLagStatusList.data}
          edgeNodes={mockEdgeNodes}
          isClusterLevel={false}
        />
      </Provider>, { route: { params } })

      // Check WAN Link Status data
      expect(screen.getAllByText('Up')).toHaveLength(2)
      expect(screen.getByText('Down')).toBeInTheDocument()
      expect(screen.queryByRole('columnheader', { name: 'Node Name' })).not.toBeInTheDocument()
    })
  })
})

const showLinkHealthMonitoringColumn = async () => {
  // click table column show/hide setting icon
  const tableColSettingIcon = screen.getByTestId('SettingsOutlined')
  await userEvent.click(tableColSettingIcon)

  await screen.findByText('Select Columns')
  // select to display Link Health Monitoring column
  const targetColCheckbox = await screen.findByText('Link Health Monitoring')
  await userEvent.click(targetColCheckbox)

  await screen.findByRole('columnheader', { name: 'Link Health Monitoring' })
}