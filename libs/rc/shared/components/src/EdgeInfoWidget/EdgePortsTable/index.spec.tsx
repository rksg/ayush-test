import { EdgeLagFixtures, EdgeLagStatus, EdgePortConfigFixtures } from '@acx-ui/rc/utils'
import { render, screen }                                         from '@acx-ui/test-utils'

import { EdgePortsTable } from '.'

const { edgePortsSetting } = EdgePortConfigFixtures
const { mockEdgeLagStatusList } = EdgeLagFixtures
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
})