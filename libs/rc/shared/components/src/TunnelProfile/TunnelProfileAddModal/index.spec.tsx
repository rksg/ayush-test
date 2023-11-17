import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { ServiceType, TunnelProfileUrls }              from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from '../../useEdgeActions'

import { TunnelProfileAddModal } from './'

jest.mock('../../useEdgeActions', () => ({
  ...jest.requireActual('../../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))
describe('NetworkSegmentation - WirelessNetworkForm > TunnelProfileAddModal', () => {

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
        <TunnelProfileAddModal />
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
        <TunnelProfileAddModal />
      </Provider>
    )
    const addButton = screen.getByRole('button', { name: 'Add' })
    await user.click(addButton)
    const tunnelDialog = await screen.findByRole('dialog')
    const cancelButtons = within(tunnelDialog).getAllByRole('button', { name: 'Cancel' })
    await user.click(cancelButtons[0])
    await waitFor(() => expect(tunnelDialog).not.toBeVisible())
  })

  describe('when SD-LAN is ready', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(true)
    })

    it('should lock tunnel type when the given service type is SD-LAN', async () => {
      const user = userEvent.setup()
      render(
        <Provider>
          <TunnelProfileAddModal fromServiceType={ServiceType.EDGE_SD_LAN} />
        </Provider>
      )

      await user.click(screen.getByRole('button', { name: 'Add' }))
      const tunnelDialog = await screen.findByRole('dialog')
      const typeField = within(tunnelDialog).getByRole('combobox', { name: 'Tunnel Type' })
      expect(typeField).toBeDisabled()
      expect(within(tunnelDialog).getByText('VLAN-VxLAN')).toBeVisible()
      expect(within(tunnelDialog).getByText('VLAN-VxLAN').classList)
        .toContain('ant-select-selection-item')
    })

    it('should lock tunnel type when the given service type is NSG', async () => {
      const user = userEvent.setup()
      render(
        <Provider>
          <TunnelProfileAddModal fromServiceType={ServiceType.NETWORK_SEGMENTATION} />
        </Provider>
      )

      await user.click(screen.getByRole('button', { name: 'Add' }))
      const tunnelDialog = await screen.findByRole('dialog')
      const typeField = within(tunnelDialog).getByRole('combobox', { name: 'Tunnel Type' })
      expect(typeField).toBeDisabled()
      expect(within(tunnelDialog).getByText('VxLAN')).toBeVisible()
      expect(within(tunnelDialog).getByText('VxLAN').classList)
        .toContain('ant-select-selection-item')
    })

    it('should not lock tunnel type when the given service type is not NSG/SD-LAN', async () => {
      const user = userEvent.setup()
      render(
        <Provider>
          <TunnelProfileAddModal fromServiceType={ServiceType.EDGE_FIREWALL} />
        </Provider>
      )

      await user.click(screen.getByRole('button', { name: 'Add' }))
      const tunnelDialog = await screen.findByRole('dialog')
      const typeField = within(tunnelDialog).getByRole('combobox', { name: 'Tunnel Type' })
      expect(typeField).not.toBeDisabled()
    })
  })
})