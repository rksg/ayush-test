import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeDhcpUrls }                                from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { AddEdgeDhcpServiceModal } from '.'

describe('SmartEdgeForm > AddDhcpServiceModal', () => {

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.addDhcpService.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('Add DHCP service', async () => {
    const user = userEvent.setup()

    render(
      <Provider>
        <AddEdgeDhcpServiceModal />
      </Provider>
    )

    await user.click(await screen.findByRole('button', { name: 'Add' }))
    const addDhcpModal = await screen.findByRole('dialog')
    await screen.findByText('Add DHCP for SmartEdge Service')
    const dhcpServiceNameInput = await screen.findByRole('textbox', { name: 'Service Name' })
    await user.type(dhcpServiceNameInput, 'myTest')
    await user.click(await screen.findByRole('button', { name: 'Add DHCP Pool' }))
    const addDhcpPoolDrawer = screen.getAllByRole('dialog')[1]
    const poolNameInput = await screen.findByRole('textbox', { name: 'Pool Name' })
    const subnetMaskInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
    const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })
    await user.type(poolNameInput, 'Pool1')
    await user.type(subnetMaskInput, '255.255.255.0')
    const textBoxs = within(addDhcpPoolDrawer).getAllByRole('textbox')
    await user.type(
      textBoxs.filter((elem) => elem.id === 'poolStartIp')[0], '1.1.1.0')
    await user.type(
      textBoxs.filter((elem) => elem.id === 'poolEndIp')[0], '1.1.1.5')
    await user.type(gatewayInput, '1.2.3.4')
    await user.click(within(addDhcpPoolDrawer).getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(addDhcpPoolDrawer).not.toBeVisible())
    await user.click(within(addDhcpModal).getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(addDhcpModal).not.toBeVisible())
  })

  it('Should close modal while clicking cancel button', async () => {
    const user = userEvent.setup()

    render(
      <Provider>
        <AddEdgeDhcpServiceModal />
      </Provider>
    )

    await user.click(await screen.findByRole('button', { name: 'Add' }))
    const addDhcpModal = await screen.findByRole('dialog')
    await screen.findByText('Add DHCP for SmartEdge Service')
    const cancelButtons = within(addDhcpModal).getAllByRole('button', { name: 'Cancel' })
    await user.click(cancelButtons[0])
    await waitFor(() => expect(addDhcpModal).not.toBeVisible())
  })
})