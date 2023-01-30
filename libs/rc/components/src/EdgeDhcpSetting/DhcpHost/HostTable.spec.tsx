import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { networkApi }                from '@acx-ui/rc/services'
import { Provider, store }           from '@acx-ui/store'
import { findTBody, render, screen } from '@acx-ui/test-utils'

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
      id: '1',
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

  it('Table action bar edit pool', async () => {
    render(<HostTable data={list.data} />, { wrapper })

    const tbody = await findTBody()

    expect(tbody).toBeVisible()
    const addButton = screen.getByRole('button', { name: 'Add Host' })
    await userEvent.click(addButton)
    userEvent.click(screen.getByText('test2'))
    userEvent.click(screen.getByText('test1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    userEvent.click(screen.getByText('test1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    userEvent.click(screen.getByText('test1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  })
})
