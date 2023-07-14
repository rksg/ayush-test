import userEvent from '@testing-library/user-event'

import { StepsForm }              from '@acx-ui/components'
import { Provider }               from '@acx-ui/store'
import { render, screen, within } from '@acx-ui/test-utils'

import { EdgeDhcpSettingForm } from './EdgeDhcpSettingForm'

describe('EdgeDhcpSettingForm', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should show external dhcp server setting', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )

    userEvent.click(await screen.findByRole('switch', { name: 'DHCP Relay:' }))
    expect(await screen.findByRole('textbox', { name: 'FQDN Name or IP Address' })).toBeVisible()
  })

  it('should show secondary dns server', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )

    userEvent.click(await screen.findByRole('button', { name: 'Add Secondary DNS Server' }))
    expect(await screen.findByRole('textbox', { name: 'Secondary DNS Server' })).toBeVisible()
  })

  it('should show error dns ip is invalid', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )

    userEvent.click(await screen.findByRole('button', { name: 'Add Secondary DNS Server' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Primary DNS Server' }), 'test')
    await userEvent.type(screen.getByRole('textbox', { name: 'Secondary DNS Server' }), 'test')
    await userEvent.type(screen.getByRole('textbox', { name: 'Service Name' }), 'test')
    const errors = await screen.findAllByText('Please enter a valid IP address' )
    expect(errors.length).toBe(2)
  })

  it('should delete pool', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add DHCP Pool' }))
    const drawer = await screen.findByRole('dialog')
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    await userEvent.type(
      within(drawer).getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0'
    )
    await userEvent.type(
      within(drawer).getByRole('textbox', { name: 'Start IP Address' }), '1.2.3.4'
    )
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'End IP Address' }), '1.2.3.5')
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Gateway' }), '1.2.3.10')

    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))
    await userEvent.click(within(drawer).getByRole('button', { name: 'Cancel' }))

    userEvent.click(await screen.findByText('pool1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  })

  it('should add pool', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add DHCP Pool' }))
    const drawer = await screen.findByRole('dialog')
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    await userEvent.type(
      within(drawer).getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0'
    )
    await userEvent.type(
      within(drawer).getByRole('textbox', { name: 'Start IP Address' }), '1.2.3.4'
    )
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'End IP Address' }), '1.2.3.5')
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Gateway' }), '1.2.3.10')

    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))
  })

  it('should update pool', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add DHCP Pool' }))
    const drawer1 = await screen.findByRole('dialog')
    await userEvent.type(within(drawer1).getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    await userEvent.type(
      within(drawer1).getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0'
    )
    await userEvent.type(
      within(drawer1).getByRole('textbox', { name: 'Start IP Address' }), '1.2.3.4'
    )
    await userEvent.type(
      within(drawer1).getByRole('textbox', { name: 'End IP Address' }), '1.2.3.5'
    )
    await userEvent.type(within(drawer1).getByRole('textbox', { name: 'Gateway' }), '1.2.3.10')

    await userEvent.click(within(drawer1).getByRole('button', { name: 'Add' }))
    await userEvent.click(within(drawer1).getByRole('button', { name: 'Cancel' }))

    await userEvent.click(await screen.findByText('pool1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    const drawer2 = await screen.findByRole('dialog')
    await userEvent.click(await within(drawer2).findByRole('button', { name: 'Apply' }))
  })

  it('should show alert for duplicate pool name', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )
    const addNewPoolButton = screen.getByRole('button', { name: 'Add DHCP Pool' })
    await userEvent.click(addNewPoolButton)
    const drawer1 = await screen.findByRole('dialog')
    await userEvent.type(within(drawer1).getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    await userEvent.type(
      within(drawer1).getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0'
    )
    await userEvent.type(
      within(drawer1).getByRole('textbox', { name: 'Start IP Address' }), '1.2.3.4'
    )
    await userEvent.type(
      within(drawer1).getByRole('textbox', { name: 'End IP Address' }), '1.2.3.5'
    )
    await userEvent.type(within(drawer1).getByRole('textbox', { name: 'Gateway' }), '1.2.3.10')

    await userEvent.click(within(drawer1).getByRole('button', { name: 'Add' }))

    await userEvent.click(addNewPoolButton)
    const drawer2 = await screen.findByRole('dialog')
    await userEvent.type(within(drawer2).getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    const alertElement = await screen.findByRole('alert')
    expect(alertElement).toBeVisible()
  })

  it('should add host', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add Host' }))
    const drawer = await screen.findByRole('dialog')
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Host Name' }), 'host1')
    await userEvent.type(
      within(drawer).getByRole('textbox', { name: 'MAC Address' }), '11:22:33:44:55:66'
    )
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Fixed Address' }), '1.2.3.4')

    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))
  })

  it('should show alert for duplicate host name', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )
    const addNewHostButton = screen.getByRole('button', { name: 'Add Host' })
    await userEvent.click(addNewHostButton)
    const drawer1 = await screen.findByRole('dialog')
    await userEvent.type(within(drawer1).getByRole('textbox', { name: 'Host Name' }), 'host1')
    await userEvent.type(
      within(drawer1).getByRole('textbox', { name: 'MAC Address' }), '11:22:33:44:55:66'
    )
    await userEvent.type(within(drawer1).getByRole('textbox', { name: 'Fixed Address' }), '1.2.3.4')

    await userEvent.click(within(drawer1).getByRole('button', { name: 'Add' }))

    await userEvent.click(addNewHostButton)
    const drawer2 = await screen.findByRole('dialog')
    await userEvent.type(within(drawer2).getByRole('textbox', { name: 'Host Name' }), 'host1')
    const alertElement = await screen.findByRole('alert')
    expect(alertElement).toBeVisible()
  })

  it('should update host', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add Host' }))
    const drawer = await screen.findByRole('dialog')
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Host Name' }), 'host1')
    await userEvent.type(
      within(drawer).getByRole('textbox', { name: 'MAC Address' }), '11:22:33:44:55:66'
    )
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Fixed Address' }), '1.2.3.4')

    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))
    await userEvent.click(within(drawer).getByRole('button', { name: 'Cancel' }))

    userEvent.click(screen.getByText('host1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
  })

  it('should delete host', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params } }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add Host' }))
    const drawer = await screen.findByRole('dialog')
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Host Name' }), 'host1')
    await userEvent.type(
      within(drawer).getByRole('textbox', { name: 'MAC Address' }), '11:22:33:44:55:66'
    )
    await userEvent.type(within(drawer).getByRole('textbox', { name: 'Fixed Address' }), '1.2.3.4')

    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))
    await userEvent.click(within(drawer).getByRole('button', { name: 'Cancel' }))

    userEvent.click(screen.getByText('host1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  })

})
