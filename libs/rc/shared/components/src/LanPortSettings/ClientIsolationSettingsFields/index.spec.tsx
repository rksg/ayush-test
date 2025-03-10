import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { ClientIsolationUrls }        from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { clientIsolationProfileDescription, clientIsolationProfileName,  mockedClientIsolationList, mockedClientIsolationProfile } from '../__tests__/fixtures'

import ClientIsolationSettingsFields from '.'

describe('Client Isolation Settings Fields', () => {
  const params = {
    tenantId: 'tenant-id'
  }

  beforeEach(() => {
    mockServer.use(
      rest.get(ClientIsolationUrls.getClientIsolationList.url,
        (_, res, ctx) => {
          return res(ctx.json(mockedClientIsolationList))
        }
      ),
      rest.get(ClientIsolationUrls.getClientIsolation.url,
        (_, res, ctx) => {
          return res(ctx.json(mockedClientIsolationProfile))
        }
      )
    )
  })
  it('should render correctly', async () => {
    render(<Provider>
      <Form>
        <ClientIsolationSettingsFields
          index={0}
        />
      </Form>
    </Provider>,{
      route: { params, path: '/:tenantId' }
    })

    const enableToggle = screen.getByTestId('client-isolation-switch')
    await userEvent.click(enableToggle)
    expect(
      screen.getByText(
        'Enabling on the uplink/WAN port will disconnect AP(s)')
    ).toBeInTheDocument()

    const packetsTypeDropdown = screen.getByRole('combobox', { name: 'Isolate Packets' })
    await userEvent.click(packetsTypeDropdown)
    await userEvent.click(screen.getByText('Multicast/broadcast'))

    const autoVRRPToggle = screen.getByRole('switch', { name: 'Automatic support for VRRP/HSRP' })
    await userEvent.click(autoVRRPToggle)

    const allowListDropdown = screen.getByRole('combobox', { name: 'Client Isolation Allowlist' })
    expect(allowListDropdown).toBeInTheDocument()
  })


  it('Click on Policy Detail should show details drawer correctly', async () => {
    render(<Provider>
      <Form>
        <ClientIsolationSettingsFields
          index={0}
        />
      </Form>
    </Provider>,{
      route: { params, path: '/:tenantId' }
    })

    const enableToggle = screen.getByTestId('client-isolation-switch')
    await userEvent.click(enableToggle)
    const allowListDropdown = screen.getByRole('combobox', { name: 'Client Isolation Allowlist' })
    await userEvent.click(allowListDropdown)
    await userEvent.click(screen.getByText(clientIsolationProfileName))

    const showDetailButton = screen.getByRole('button', { name: 'Policy Details' })
    await userEvent.click(showDetailButton)
    expect(await screen.findByText(clientIsolationProfileDescription)).toBeInTheDocument()
    const closeButton = screen.getByRole('button', { name: 'Close' })
    await userEvent.click(closeButton)

    await userEvent.click(allowListDropdown)
    await userEvent.click(screen.getByText('Not active'))
    expect(showDetailButton).toBeDisabled()
  })

  // eslint-disable-next-line max-len
  it('Click on Add Policy should show add drawer correctly', async () => {
    render(<Provider>
      <Form>
        <ClientIsolationSettingsFields
          index={0}
        />
      </Form>
    </Provider>,{
      route: { params, path: '/:tenantId' }
    })

    const enableToggle = screen.getByTestId('client-isolation-switch')
    await userEvent.click(enableToggle)

    const addPolicyButton = screen.getByRole('button', { name: 'Add Policy' })
    await userEvent.click(addPolicyButton)
    expect(screen.getByText('Add Client Isolation')).toBeInTheDocument()

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)

    await userEvent.click(addPolicyButton)
    const closeButton = screen.getByRole('button', { name: 'Close' })
    await userEvent.click(closeButton)
  })
})
