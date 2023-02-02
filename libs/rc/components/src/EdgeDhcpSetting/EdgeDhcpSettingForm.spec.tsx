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

})
