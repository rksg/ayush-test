import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import {
  findTBody,
  render, screen, within
} from '@acx-ui/test-utils'

import DhcpPoolTable from '.'

const mockData = [
  {
    id: '1',
    poolName: 'TestPool-1',
    subnetMask: '255.255.255.0',
    poolStartIp: '1.1.1.1',
    poolEndIp: '1.1.1.5',
    gatewayIp: '1.1.1.0',
    activated: true
  },
  {
    id: '2',
    poolName: 'TestPool-2',
    subnetMask: '255.255.255.0',
    poolStartIp: '1.1.1.1',
    poolEndIp: '1.1.1.5',
    gatewayIp: '1.1.1.0',
    activated: true
  }
]

describe('DHCP Pool table(Edge)', () => {
  it('should render data succefully', async () => {
    render(<DhcpPoolTable value={mockData} />)

    const tableRow = await screen.findAllByRole('row', { name: /TestPool-/i })
    expect(tableRow.length).toBe(2)
  })

  it('should show no data', async () => {
    render(<DhcpPoolTable />)

    const tbody = await findTBody()
    const noDataElement = within(tbody).getByRole('row')
    expect(noDataElement.className).toBe('ant-table-placeholder')
  })

  it('should open drawer', async () => {
    const user = userEvent.setup()
    render(<DhcpPoolTable value={mockData} />)

    await user.click(screen.getByRole('button', { name: 'Add DHCP Pool' }))
    expect(await screen.findByRole('textbox', { name: 'Pool Name' })).toBeVisible()
  })

  it('should show edit button', async () => {
    render(<DhcpPoolTable value={mockData} />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const row = await screen.findByRole('row', { name: /TestPool-1/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  })

  it('should hidden edit button', async () => {
    render(<DhcpPoolTable value={mockData} />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const rows = await screen.findAllByRole('row', { name: /TestPool-/i })
    await userEvent.click(within(rows[0]).getByRole('checkbox'))
    await userEvent.click(within(rows[1]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })
})