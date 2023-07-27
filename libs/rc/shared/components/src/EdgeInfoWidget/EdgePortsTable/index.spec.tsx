import { render, screen } from '@acx-ui/test-utils'

import { edgePortsSetting } from '../__tests__/fixtures'

import { EdgePortsTable } from '.'

describe('Edge Ports Table', () => {
  it('should correctly change tab', async () => {
    render(<EdgePortsTable data={edgePortsSetting} />)

    const portsRow = (await screen.findAllByRole('row'))
      .filter(row => row.className.includes('ant-table-row'))

    expect(portsRow.length).toBe(2)
    screen.queryByRole('row', { name: '1 Port 1 Up Enabled WAN AA:BB:CC:DD:EE:FF 1.1.1.1 12Kbps' })
    screen.queryByRole('row',
      { name: '2 Port 2 Down Disabled LAN AA:BB:CC:DD:EE:FF 1.1.1.2 10Kbps' })
  })
})