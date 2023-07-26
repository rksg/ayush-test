import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { networkApi }         from '@acx-ui/rc/services'
import { DHCPConfigTypeEnum } from '@acx-ui/rc/utils'
import { store }              from '@acx-ui/store'
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

    render(<DHCPPoolTable dhcpMode={DHCPConfigTypeEnum.SIMPLE} isDefaultService={false} />
      , {
        wrapper,
        route: { params }
      })
    const addButton = screen.getByRole('button', { name: 'Add DHCP Pool' })
    await userEvent.click(addButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Pool Name' }), 'pool1')

    const button = screen.getAllByRole('switch')
    await userEvent.click(button[0])
    await userEvent.click(button[0])

    await userEvent.type(screen.getByRole('textbox', { name: 'Subnet Address' }), '10.20.30.0')
    await userEvent.type(screen.getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0')
    await userEvent.type(screen.getByTestId('leaseTime'), '24')
    await userEvent.type(screen.getByRole('spinbutton', { name: 'VLAN' }), '30')
    await userEvent.type(screen.getByRole('textbox', { name: 'Start Host Address' }), '10.20.30.1')
    await userEvent.type(screen.getByRole('textbox', { name: 'End Host Address' }), '10.20.30.2')

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await userEvent.click(addButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    await userEvent.type(screen.getByRole('textbox', { name: 'Subnet Address' }), '1.1.1.1')
    await userEvent.type(screen.getByRole('textbox', { name: 'Subnet Mask' }), '255.255.0.0')
    await userEvent.type(screen.getByTestId('leaseTime'), '24')
    await userEvent.type(screen.getByRole('spinbutton', { name: 'VLAN' }),'30')

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))


    userEvent.click(screen.getByText('pool1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))

    userEvent.click(screen.getByText('pool1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  }, 20000)
})
