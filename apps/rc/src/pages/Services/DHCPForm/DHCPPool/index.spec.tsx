import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { networkApi } from '@acx-ui/rc/services'
import { store }      from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import  DHCPPoolTable from '.'

function wrapper ({ children }: { children: React.ReactElement }) {
  return <Form>{children}</Form>
}

describe('Create DHCP: Pool detail', () => {
  beforeEach(() => {
    store.dispatch(networkApi.util.resetApiState())
  })

  it('Table action bar add pool', async () => {
    const params = { tenantId: 'tenant-id' }

    render(<DHCPPoolTable />, {
      wrapper,
      route: { params }
    })
    const addButton = screen.getByRole('button', { name: 'Add DHCP Pool' })
    await userEvent.click(addButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    await userEvent.type(screen.getByRole('textbox', { name: 'IP Address' }), '1.1.1.1')
    await userEvent.type(screen.getByRole('textbox', { name: 'Subnet Mask' }), '255.255.0.0')
    await userEvent.type(screen.getByTestId('leaseTime'), '24')
    await userEvent.type(screen.getByRole('spinbutton', { name: 'VLAN' }), '30')

    const addOptButton = screen.getByRole('button', { name: 'Add option' })
    await userEvent.click(addOptButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Option ID' }), '21')
    await userEvent.type(screen.getByRole('textbox', { name: 'Option Name' }), 'option1')
    await userEvent.type(screen.getByRole('textbox', { name: 'Option Format' }), 'IP')
    await userEvent.type(screen.getByRole('textbox', { name: 'Option Value' }), '1.1.1.1')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await userEvent.click(addButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Pool Name' }), 'pool2')
    await userEvent.type(screen.getByRole('textbox', { name: 'IP Address' }), '1.1.1.1')
    await userEvent.type(screen.getByRole('textbox', { name: 'Subnet Mask' }), '255.255.0.0')
    await userEvent.type(screen.getByTestId('leaseTime'), '24')
    await userEvent.type(screen.getByRole('spinbutton', { name: 'VLAN' }),'30')

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    userEvent.click(screen.getByText('pool1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  }, 20000)
})
