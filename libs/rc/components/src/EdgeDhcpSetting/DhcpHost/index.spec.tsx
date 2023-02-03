import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { networkApi } from '@acx-ui/rc/services'
import { store }      from '@acx-ui/store'
import {
  render, screen
} from '@acx-ui/test-utils'

import  HostTable from '.'

function wrapper ({ children }: { children: React.ReactElement }) {
  return <Form>{children}</Form>
}

describe('Create DHCP: Host detail', () => {
  beforeEach(() => {
    store.dispatch(networkApi.util.resetApiState())
  })

  it('should add host', async () => {
    const params = { tenantId: 'tenant-id' }

    render(<HostTable/>, {
      wrapper,
      route: { params }
    })
    const addNewHostButton = screen.getByRole('button', { name: 'Add Host' })
    expect(addNewHostButton).toBeVisible()
    await userEvent.click(addNewHostButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Host Name' }), 'host1')
    await userEvent.type(screen.getByRole('textbox', { name: 'MAC Address' }), '11:22:33:44:55:66')
    await userEvent.type(screen.getByRole('textbox', { name: 'Fixed Address' }), '1.2.3.4')

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
  })

  it('should show alert for duplicate host name', async () => {
    const params = { tenantId: 'tenant-id' }

    render(<HostTable/>, {
      wrapper,
      route: { params }
    })
    const addNewHostButton = screen.getByRole('button', { name: 'Add Host' })
    expect(addNewHostButton).toBeVisible()
    await userEvent.click(addNewHostButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Host Name' }), 'host1')
    await userEvent.type(screen.getByRole('textbox', { name: 'MAC Address' }), '11:22:33:44:55:66')
    await userEvent.type(screen.getByRole('textbox', { name: 'Fixed Address' }), '1.2.3.4')

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await userEvent.click(addNewHostButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Host Name' }), 'host1')
    const alertElement = await screen.findByRole('alert')
    expect(alertElement).toBeVisible()
  })

  it('should show update button', async () => {
    const params = { tenantId: 'tenant-id' }

    render(<HostTable/>, {
      wrapper,
      route: { params }
    })
    const addNewHostButton = screen.getByRole('button', { name: 'Add Host' })
    expect(addNewHostButton).toBeVisible()
    await userEvent.click(addNewHostButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Host Name' }), 'host1')
    await userEvent.type(screen.getByRole('textbox', { name: 'MAC Address' }), '11:22:33:44:55:66')
    await userEvent.type(screen.getByRole('textbox', { name: 'Fixed Address' }), '1.2.3.4')

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    userEvent.click(screen.getByText('host1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))
  })

  it('should delete host', async () => {
    const params = { tenantId: 'tenant-id' }

    render(<HostTable/>, {
      wrapper,
      route: { params }
    })
    const addNewHostButton = screen.getByRole('button', { name: 'Add Host' })
    expect(addNewHostButton).toBeVisible()
    await userEvent.click(addNewHostButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Host Name' }), 'host1')
    await userEvent.type(screen.getByRole('textbox', { name: 'MAC Address' }), '11:22:33:44:55:66')
    await userEvent.type(screen.getByRole('textbox', { name: 'Fixed Address' }), '1.2.3.4')

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    userEvent.click(screen.getByText('host1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  })

})