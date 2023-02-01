import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { networkApi }                        from '@acx-ui/rc/services'
import { Provider, store }                   from '@acx-ui/store'
import { findTBody, render, screen, within } from '@acx-ui/test-utils'

import { PoolTable } from './PoolTable'

const list = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '1',
      poolName: 'test1',
      subnetMask: '255.0.0.0',
      poolStartIp: '1.2.3.4',
      poolEndIp: '1.2.3.8',
      gatewayIp: '2.3.4.5'
    },
    {
      id: '2',
      poolName: 'test2',
      subnetMask: '255.255.0.0',
      poolStartIp: '2.2.3.4',
      poolEndIp: '2.2.3.8',
      gatewayIp: '3.3.4.5'
    }
  ]
}

function wrapper ({ children }: { children: JSX.Element }) {
  return <Provider>
    <Form>
      {children}
    </Form>
  </Provider>
}

describe('Create DHCP: Pool table', () => {
  beforeEach(() => {
    store.dispatch(networkApi.util.resetApiState())
  })

  it('should show edit pool', async () => {
    render(<PoolTable data={list.data} />, { wrapper })

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const row = await screen.findByRole('row', { name: /test1/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  })

  it('should hidden edit button', async () => {
    render(<PoolTable data={list.data} />, { wrapper })

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const rows = await screen.findAllByRole('row', { name: /test/i })
    await userEvent.click(within(rows[0]).getByRole('checkbox'))
    await userEvent.click(within(rows[1]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })
})
