import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import {
  findTBody, render, screen, within
} from '@acx-ui/test-utils'

import { mockedHostData } from '../__tests__/fixtures'

import HostTable from '.'

describe('Host table(Edge)', () => {
  it('should render data succefully', async () => {
    render(<HostTable value={mockedHostData} />)

    const tableRow = await screen.findAllByRole('row', { name: /TestHost-/i })
    expect(tableRow.length).toBe(2)
  })

  it('should show no data', async () => {
    render(<HostTable />)

    const tbody = await findTBody()
    const noDataElement = within(tbody).getByRole('row')
    expect(noDataElement.className).toBe('ant-table-placeholder')
  })

  it('should open drawer', async () => {
    const user = userEvent.setup()
    render(<HostTable value={mockedHostData} />)

    await user.click(screen.getByRole('button', { name: 'Add Host' }))
    expect(await screen.findByRole('textbox', { name: 'Host Name' })).toBeVisible()
  })

  it('should show edit button', async () => {
    render(<HostTable value={mockedHostData} />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const row = await screen.findByRole('row', { name: /TestHost-1/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  })

  it('should hidden edit button', async () => {
    render(<HostTable value={mockedHostData} />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const rows = await screen.findAllByRole('row', { name: /TestHost-/i })
    await userEvent.click(within(rows[0]).getByRole('checkbox'))
    await userEvent.click(within(rows[1]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })
})