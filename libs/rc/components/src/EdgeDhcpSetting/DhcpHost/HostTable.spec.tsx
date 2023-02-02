import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { networkApi }                        from '@acx-ui/rc/services'
import { Provider, store }                   from '@acx-ui/store'
import { findTBody, render, screen, within } from '@acx-ui/test-utils'

import { HostTable } from './HostTable'

const list = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '1',
      hostName: 'test1',
      mac: '11:22:33:44:55:66',
      fixedAddress: '1.2.3.4'
    },
    {
      id: '2',
      hostName: 'test2',
      mac: 'aa:bb:cc:dd:ee:ff',
      fixedAddress: '2.3.4.5'
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

describe('Create DHCP: Host table', () => {
  beforeEach(() => {
    store.dispatch(networkApi.util.resetApiState())
  })

  it('should show edit button', async () => {
    render(<HostTable data={list.data} />, { wrapper })

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const row = await screen.findByRole('row', { name: /test1/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  })

  it('should hidden edit button', async () => {
    render(<HostTable data={list.data} />, { wrapper })

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const rows = await screen.findAllByRole('row', { name: /test/i })
    await userEvent.click(within(rows[0]).getByRole('checkbox'))
    await userEvent.click(within(rows[1]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })
})
