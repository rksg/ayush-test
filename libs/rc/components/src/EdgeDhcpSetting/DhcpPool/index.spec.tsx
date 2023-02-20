import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { networkApi } from '@acx-ui/rc/services'
import { store }      from '@acx-ui/store'
import {
  render, screen
} from '@acx-ui/test-utils'

import  DhcpPoolTable from '.'

function wrapper ({ children }: { children: React.ReactElement }) {
  return <Form>{children}</Form>
}

describe('Create DHCP: Pool detail', () => {
  beforeEach(() => {
    store.dispatch(networkApi.util.resetApiState())
  })

  it('should add pool', async () => {
    const params = { tenantId: 'tenant-id' }

    render(<DhcpPoolTable/>, {
      wrapper,
      route: { params }
    })
    const addNewPoolButton = screen.getByRole('button', { name: 'Add DHCP Pool' })
    expect(addNewPoolButton).toBeVisible()
    await userEvent.click(addNewPoolButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    await userEvent.type(screen.getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0')
    await userEvent.type(screen.getByRole('textbox', { name: 'Start IP Address' }), '1.2.3.4')
    await userEvent.type(screen.getByRole('textbox', { name: 'End IP Address' }), '1.2.3.5')
    await userEvent.type(screen.getByRole('textbox', { name: 'Gateway' }), '1.2.3.10')

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
  })

  it('should update pool', async () => {
    const params = { tenantId: 'tenant-id' }

    render(<DhcpPoolTable/>, {
      wrapper,
      route: { params }
    })
    const addNewPoolButton = screen.getByRole('button', { name: 'Add DHCP Pool' })
    expect(addNewPoolButton).toBeVisible()
    await userEvent.click(addNewPoolButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    await userEvent.type(screen.getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0')
    await userEvent.type(screen.getByRole('textbox', { name: 'Start IP Address' }), '1.2.3.4')
    await userEvent.type(screen.getByRole('textbox', { name: 'End IP Address' }), '1.2.3.5')
    await userEvent.type(screen.getByRole('textbox', { name: 'Gateway' }), '1.2.3.10')

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await userEvent.click(await screen.findByText('pool1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Update' }))
  })

  it('should show alert for duplicate host name', async () => {
    const params = { tenantId: 'tenant-id' }

    render(<DhcpPoolTable/>, {
      wrapper,
      route: { params }
    })
    const addNewPoolButton = screen.getByRole('button', { name: 'Add DHCP Pool' })
    expect(addNewPoolButton).toBeVisible()
    await userEvent.click(addNewPoolButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    await userEvent.type(screen.getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0')
    await userEvent.type(screen.getByRole('textbox', { name: 'Start IP Address' }), '1.2.3.4')
    await userEvent.type(screen.getByRole('textbox', { name: 'End IP Address' }), '1.2.3.5')
    await userEvent.type(screen.getByRole('textbox', { name: 'Gateway' }), '1.2.3.10')

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await userEvent.click(addNewPoolButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    const alertElement = await screen.findByRole('alert')
    expect(alertElement).toBeVisible()
  })

  it('should delete pool', async () => {
    const params = { tenantId: 'tenant-id' }

    render(<DhcpPoolTable/>, {
      wrapper,
      route: { params }
    })
    const addNewPoolButton = screen.getByRole('button', { name: 'Add DHCP Pool' })
    expect(addNewPoolButton).toBeVisible()
    await userEvent.click(addNewPoolButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    await userEvent.type(screen.getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0')
    await userEvent.type(screen.getByRole('textbox', { name: 'Start IP Address' }), '1.2.3.4')
    await userEvent.type(screen.getByRole('textbox', { name: 'End IP Address' }), '1.2.3.5')
    await userEvent.type(screen.getByRole('textbox', { name: 'Gateway' }), '1.2.3.10')

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    userEvent.click(screen.getByText('pool1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  })
})