import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { networkApi }                from '@acx-ui/rc/services'
import { LeaseUnit }                 from '@acx-ui/rc/utils'
import { Provider, store }           from '@acx-ui/store'
import { findTBody, render, screen } from '@acx-ui/test-utils'

import { PoolTable } from './PoolTable'

const list = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '1',
      name: 'test1',
      allowWired: false,
      subnetAddress: '1.1.1.1',
      subnetMask: '255.0.0.0',
      primaryDnsIp: '',
      secondaryDnsIp: '',
      dhcpOptions: [],
      startIpAddress: '',
      endIpAddress: '',
      leaseTime: 24,
      leaseUnit: LeaseUnit.HOURS,
      vlanId: 300
    },
    {
      id: '2',
      name: 'test2',
      allowWired: false,
      subnetAddress: '1.1.1.1',
      subnetMask: '255.0.0.0',
      primaryDnsIp: '',
      secondaryDnsIp: '',
      dhcpOptions: [],
      startIpAddress: '',
      endIpAddress: '',
      leaseTime: 24,
      leaseUnit: LeaseUnit.HOURS,
      vlanId: 300
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

  it('Table action bar edit pool', async () => {
    render(<PoolTable data={list.data} />, { wrapper })

    const tbody = await findTBody()

    expect(tbody).toBeVisible()
    const addButton = screen.getByRole('button', { name: 'Add DHCP Pool' })
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
