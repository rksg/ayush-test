import { render, screen } from '@acx-ui/test-utils'

import { edgePortsSetting } from '../__tests__/fixtures'

import { EdgePortsTable } from '.'

describe('Edge Ports Table', () => {
  it('should correctly render', async () => {
    render(<EdgePortsTable data={edgePortsSetting} />)

    const portsRow = (await screen.findAllByRole('row'))
      .filter(row => row.className.includes('ant-table-row'))

    expect(portsRow.length).toBe(2)
    expect(screen.getByRole('row', {
      name: 'port1 description1 Up Enabled WAN AA:BB:CC:DD:EE:FF 1.1.1.1/24 DHCP 35.8 Gbps'
    })).toBeValid()

    expect(screen.getByRole('row',{
      name: 'port2 description2 Down Disabled LAN AA:BB:CC:DD:EE:FF 1.1.1.2/24 Static IP 29.9 Gbps'
    })).toBeValid()
  })
})