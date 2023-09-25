import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { TunnelProfileUrls }                           from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { TunnelProfileModal } from './TunnelProfileModal'

describe('NetworkSegmentation - WirelessNetworkForm > TunnelProfileModal', () => {

  beforeEach(() => {
    mockServer.use(
      rest.post(
        TunnelProfileUrls.createTunnelProfile.url,
        (req, res, ctx) => res(ctx.status(202))

      )
    )
  })

  it('Add tunnel profile', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <TunnelProfileModal />
      </Provider>
    )
    const addButton = screen.getByRole('button', { name: 'Add' })
    await user.click(addButton)
    const tunnelDialog = await screen.findByRole('dialog')
    const policyNameField = within(tunnelDialog).getByRole('textbox', { name: 'Profile Name' })
    await user.type(policyNameField, 'TestTunnel')
    await user.click(within(tunnelDialog).getByRole('radio', { name: 'Auto' }))
    await user.click(within(tunnelDialog).getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(tunnelDialog).not.toBeVisible())
  })

  it('Click cancel in dialog will close dialog', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <TunnelProfileModal />
      </Provider>
    )
    const addButton = screen.getByRole('button', { name: 'Add' })
    await user.click(addButton)
    const tunnelDialog = await screen.findByRole('dialog')
    const cancelButtons = within(tunnelDialog).getAllByRole('button', { name: 'Cancel' })
    await user.click(cancelButtons[0])
    await waitFor(() => expect(tunnelDialog).not.toBeVisible())
  })
})