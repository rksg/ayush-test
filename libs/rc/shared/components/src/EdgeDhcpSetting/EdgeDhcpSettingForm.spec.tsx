import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { EdgeDhcpSettingForm } from './EdgeDhcpSettingForm'

describe('EdgeDhcpSettingForm', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should create EdgeDhcpSettingForm successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <EdgeDhcpSettingForm />
      </Provider>, { route: { params } }
    )

    expect(screen.getByRole('switch')).not.toBeChecked()
    await screen.findByRole('textbox', { name: /primary dns server/i })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should show external dhcp server setting', async () => {
    render(
      <Provider>
        <Form>
          <EdgeDhcpSettingForm />
        </Form>
      </Provider>, { route: { params } }
    )

    userEvent.click(await screen.findByRole('switch', { name: 'DHCP Relay:' }))
    expect(await screen.findByRole('textbox', { name: 'FQDN Name or IP Address' })).toBeVisible()
  })

  it('should show secondary dns server', async () => {
    render(
      <Provider>
        <Form>
          <EdgeDhcpSettingForm />
        </Form>
      </Provider>, { route: { params } }
    )

    userEvent.click(await screen.findByRole('button', { name: 'Add Secondary DNS Server' }))
    expect(await screen.findByRole('textbox', { name: 'Secondary DNS Server' })).toBeVisible()
  })

  it('should delete pool', async () => {
    render(
      <Provider>
        <Form>
          <EdgeDhcpSettingForm />
        </Form>
      </Provider>, { route: { params } }
    )
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

    userEvent.click(await screen.findByText('pool1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  })

  it('should add pool', async () => {
    render(
      <Provider>
        <Form>
          <EdgeDhcpSettingForm />
        </Form>
      </Provider>, { route: { params } }
    )
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
    render(
      <Provider>
        <Form>
          <EdgeDhcpSettingForm />
        </Form>
      </Provider>, { route: { params } }
    )
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
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
  })

  it('should show alert for duplicate pool name', async () => {
    render(
      <Provider>
        <Form>
          <EdgeDhcpSettingForm />
        </Form>
      </Provider>, { route: { params } }
    )
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

  it('should add host', async () => {
    render(
      <Provider>
        <Form>
          <EdgeDhcpSettingForm />
        </Form>
      </Provider>, { route: { params } }
    )
    const addNewHostButton = screen.getByRole('button', { name: 'Add Host' })
    expect(addNewHostButton).toBeVisible()
    await userEvent.click(addNewHostButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Host Name' }), 'host1')
    await userEvent.type(screen.getByRole('textbox', { name: 'MAC Address' }), '11:22:33:44:55:66')
    await userEvent.type(screen.getByRole('textbox', { name: 'Fixed Address' }), '1.2.3.4')

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
  })

  it('should show alert for duplicate host name', async () => {
    render(
      <Provider>
        <Form>
          <EdgeDhcpSettingForm />
        </Form>
      </Provider>, { route: { params } }
    )
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

  it('should update host', async () => {
    render(
      <Provider>
        <Form>
          <EdgeDhcpSettingForm />
        </Form>
      </Provider>, { route: { params } }
    )
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
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
  })

  it('should delete host', async () => {
    render(
      <Provider>
        <Form>
          <EdgeDhcpSettingForm />
        </Form>
      </Provider>, { route: { params } }
    )
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
