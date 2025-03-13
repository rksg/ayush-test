import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features }                                                         from '@acx-ui/feature-toggle'
import { NetworkSegmentTypeEnum, TunnelProfileFormType, TunnelProfileUrls } from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within }                      from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from '../../useEdgeActions'

import { TunnelProfileAddModal } from './'

jest.mock('../../useEdgeActions', () => ({
  ...jest.requireActual('../../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))
jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn(),
  useIsTierAllowed: jest.fn(),
  useIsBetaEnabled: jest.fn().mockReturnValue(false)
}))

describe('PersonalIdentityNetwork - WirelessNetworkForm > TunnelProfileAddModal', () => {

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
      jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff =>
        ff === Features.EDGES_SD_LAN_TOGGLE || ff === Features.EDGES_SD_LAN_HA_TOGGLE)
    })


    it('should be able to set values via initialValues', async () => {
      const user = userEvent.setup()
      render(
        <Provider>
          <TunnelProfileAddModal
            initialValues={{ type: NetworkSegmentTypeEnum.VLAN_VXLAN } as TunnelProfileFormType} />
        </Provider>
      )

      await user.click(screen.getByRole('button', { name: 'Add' }))
      const tunnelDialog = await screen.findByRole('dialog')
      const typeField = within(tunnelDialog).getByRole('combobox', { name: 'Tunnel Type' })
      expect(typeField).not.toBeDisabled()
      expect(within(tunnelDialog).getByText('VLAN-VxLAN')).toBeVisible()
      expect(within(tunnelDialog).getByText('VLAN-VxLAN').classList)
        .toContain('ant-select-selection-item')
    })

    it('should lock form fields when it is set in disabledFields', async () => {
      const user = userEvent.setup()
      render(
        <Provider>
          <TunnelProfileAddModal
            initialValues={{ disabledFields: ['type'] } as TunnelProfileFormType} />
        </Provider>
      )

      await user.click(screen.getByRole('button', { name: 'Add' }))
      const tunnelDialog = await screen.findByRole('dialog')
      const typeField = within(tunnelDialog).getByRole('combobox', { name: 'Tunnel Type' })
      expect(typeField).toBeDisabled()
    })
  })
})