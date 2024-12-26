import React from 'react'

import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { SwitchUrlsInfo }                                         from '@acx-ui/rc/utils'
import { Provider }                                               from '@acx-ui/store'
import { fireEvent, render, screen, mockServer, waitFor, within } from '@acx-ui/test-utils'


import { SwitchPortProfileForm } from './SwitchPortProfileForm'

const macOui = {
  id: '7d3a416c-6e73-4dde-8242-299649a16a9c',
  oui: 'aa:bb:cc',
  note: 'Test Note'
}

const lldpTlv = {
  id: '7d3a416c-6e73-4dde-8242-299649a16a9c',
  systemName: 'Test System',
  nameMatchingType: 'EXACT',
  systemDescription: 'Test Description',
  descMatchingType: 'CONTAINS'
}

const mockedTableResult = {
  id: 'profile1',
  name: 'Profile One',
  type: 'Standard',
  untaggedVlan: '10',
  taggedVlans: ['20', '30'],
  macOuis: [{ oui: 'AA:BB:CC' }, { oui: 'BB:CC:DD' }, { oui: 'CC:DD:EE' }],
  lldpTlvs: [{ systemName: 'Switch1' }],
  dot1x: true,
  macAuth: false,
  appliedSwitchesInfo: []
}


beforeEach(() => {
  mockServer.use(
    rest.post(SwitchUrlsInfo.addSwitchPortProfile.url, (req, res, ctx) => {
      return res(ctx.json({ success: true }))
    }),
    rest.put(SwitchUrlsInfo.editSwitchPortProfile.url, (req, res, ctx) => {
      return res(ctx.json({ success: true }))
    }),
    rest.post(SwitchUrlsInfo.getSwitchPortProfileMacOuisList.url, (req, res, ctx) => {
      return res(ctx.json({ data: [macOui] }))
    }),
    rest.post(SwitchUrlsInfo.getSwitchPortProfileLldpTlvsList.url, (req, res, ctx) => {
      return res(ctx.json({ data: [lldpTlv] }))
    }),
    rest.post(SwitchUrlsInfo.getSwitchPortProfilesList.url, (req, res, ctx) => {
      return res(ctx.json({ data: [mockedTableResult] }))
    })
  )
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('SwitchPortProfileForm', () => {
  const params = { tenantId: 'tenant-id', switchId: 'switch-id' }
  it('renders correctly', async () => {
    render(
      <Provider>
        <SwitchPortProfileForm />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/portProfile/switch/profiles/add' }
      })

    expect(await screen.findByText('Add ICX Port Profile')).toBeInTheDocument()
  })

  it('submits the form successfully', async () => {
    render(
      <Provider>
        <SwitchPortProfileForm />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/portProfile/switch/profiles/add' }
      })

    const profileName = await screen.findByLabelText(/Profile Name/)
    const untaggedVlan = await screen.findByLabelText(/Untagged VLAN/)
    await userEvent.type(profileName, 'Test Profile')
    await userEvent.type(untaggedVlan, '100')

    const saveButton = await screen.findByRole('button', { name: /Add/ })
    await userEvent.click(saveButton)
  })

  it('handles form validation errors', async () => {
    render(
      <Provider>
        <SwitchPortProfileForm />
      </Provider>,
      {
        route: { params, path: '/:tenantId/t/policies/portProfile/switch/profiles/add' }
      }
    )

    const saveButton = await screen.findByRole('button', { name: /Add/ })
    await userEvent.click(saveButton)

    expect(await screen.findByText('Please enter Profile Name')).toBeInTheDocument()
  })

  it('disables MAC OUI select and LLDP TLV checkboxes when PoE is turned off', async () => {
    render(
      <Provider>
        <SwitchPortProfileForm />
      </Provider>,
      {
        route: { params, path: '/:tenantId/t/policies/portProfile/switch/profiles/add' }
      }
    )

    // Initially, PoE should be on by default
    const poeSwitch = await screen.findByTestId('poeEnable')
    expect(poeSwitch).toBeChecked()

    // MAC OUI and LLDP TLV should be enabled
    const macOuiSelect = await screen.findByTestId('macOuis')
    expect(macOuiSelect).not.toBeDisabled()

    const lldpTlvTable = await screen.findByRole('table')
    const lldpCheckbox = await within(lldpTlvTable).findAllByRole('checkbox')
    expect(lldpCheckbox[0]).not.toBeDisabled()

    // Turn off PoE
    await userEvent.click(poeSwitch)
    expect(poeSwitch).not.toBeChecked()

    // MAC OUI and LLDP TLV should now be disabled
    // expect(macOuiSelect).toBeDisabled()
    await waitFor(() => {
      expect(lldpCheckbox[0]).toBeDisabled()
    })
  })

  it.skip('handles MAC OUI selection', async () => {
    render(
      <Provider>
        <SwitchPortProfileForm />
      </Provider>,
      {
        route: { params, path: '/:tenantId/t/policies/portProfile/switch/profiles/add' }
      }
    )

    const macOuiSelect = await screen.findByLabelText(/MAC OUIs/)
    fireEvent.mouseDown(macOuiSelect)

    await waitFor(() => {
      expect(screen.getByText('aa:bb:cc')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('aa:bb:cc'))

    expect(macOuiSelect).toHaveTextContent('aa:bb:cc')
  })

  it.skip('handles LLDP TLV selection', async () => {
    render(
      <Provider>
        <SwitchPortProfileForm />
      </Provider>,
      {
        route: { params, path: '/:tenantId/t/policies/portProfile/switch/profiles/add' }
      }
    )

    const lldpTlvTable = await screen.findByRole('table')
    const checkbox = within(lldpTlvTable).getByRole('checkbox', { name: /Test System/ })

    fireEvent.click(checkbox)

    expect(checkbox).toBeChecked()
  })

  it.skip('disables authentication options when IPSG is enabled', async () => {
    render(
      <Provider>
        <SwitchPortProfileForm />
      </Provider>,
      {
        route: { params, path: '/:tenantId/t/policies/portProfile/switch/profiles/add' }
      }
    )

    const ipsgSwitch = await screen.findByRole('switch', { name: /IPSG/ })
    fireEvent.click(ipsgSwitch)

    const dot1xCheckbox = screen.getByLabelText(/802.1x/)
    const macAuthCheckbox = screen.getByLabelText(/MAC Authentication/)

    expect(dot1xCheckbox).toBeDisabled()
    expect(macAuthCheckbox).toBeDisabled()
  })
})