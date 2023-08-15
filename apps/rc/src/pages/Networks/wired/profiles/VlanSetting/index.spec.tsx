import '@testing-library/jest-dom'
import userEvent       from '@testing-library/user-event'
import { Form, Modal } from 'antd'
import { act }         from 'react-dom/test-utils'

import { SwitchConfigurationProfile }        from '@acx-ui/rc/utils'
import { Provider }                          from '@acx-ui/store'
import { fireEvent, render, screen, within } from '@acx-ui/test-utils'

import { ConfigurationProfileFormContext, ConfigurationProfileType } from '../ConfigurationProfileFormContext'

import { VlanSetting } from '.'

const currentData = {
  name: 'test-profile',
  description: '',
  acls: [],
  vlans: [{ arpInspection: true, switchFamilyModels: [] }]
}

describe('Wired - VlanSetting', () => {
  const configureProfileContextValues = {
    editMode: false,
    currentData
  } as unknown as ConfigurationProfileType

  const vlans = [{
    arpInspection: false,
    id: '545d08c0e7894501846455233ad60cc5',
    igmpSnooping: 'none',
    ipv4DhcpSnooping: false,
    spanningTreePriority: 32768,
    spanningTreeProtocol: 'none',
    vlanId: 2,
    vlanName: 'vlan-01'
  }, {
    arpInspection: false,
    id: '1af3d29b5dcc46a5a20a651fda55e2df',
    igmpSnooping: 'none',
    ipv4DhcpSnooping: false,
    spanningTreePriority: 32768,
    spanningTreeProtocol: 'none',
    switchFamilyModels: [{
      id: '9874453239bc479fac68bc050d0cf729',
      model: 'ICX7550-24P',
      slots: [
        { slotNumber: 1, enable: true },
        { slotNumber: 3, enable: true, option: '2X40G' },
        { slotNumber: 2, enable: true, option: '2X40G' }
      ],
      taggedPorts: '1/2/2',
      untaggedPorts: '1/1/20,1/3/2'
    }],
    vlanId: 3,
    vlanName: 'vlan-02'
  }]

  afterEach(() => {
    Modal.destroyAll()
  })

  it('should handle add VLAN correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'add'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <Form>
            <VlanSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /VLANs/ })

    await userEvent.click(await screen.findByRole('button', { name: 'Add VLAN' }))
    const vIdInput = await screen.findByLabelText('VLAN ID')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(vIdInput, { target: { value: '1' } })
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it('should handle edit VLAN correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'edit'
    }

    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={{
          ...configureProfileContextValues,
          editMode: true,
          currentData: {
            ...currentData,
            vlans
          } as unknown as SwitchConfigurationProfile
        }}>
          <Form>
            <VlanSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /VLANs/ })

    const row = await screen.findByRole('row', { name: /vlan-02/i })

    const radio = await within(row).findByRole('radio')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(radio)
    })

    const editButton = await screen.findByRole('button', { name: /Edit/i })

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(editButton)
    })
    const IGMPSnooping = await screen.findByLabelText('IGMP Snooping')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.mouseDown(IGMPSnooping)
    })
    const active = await screen.findByText('Active')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(active)
      fireEvent.mouseDown(IGMPSnooping)
    })
    const passive = await screen.findByText('Passive')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(passive)
      fireEvent.mouseDown(IGMPSnooping)
    })
    const none = await screen.findByLabelText('NONE')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(none)
      fireEvent.click(await screen.findByRole('button', { name: /Save/i }))
    })
  })

  it('should handle edit VLAN ports correctly', async () => {
    const params = {
      tenantId: 'tenant-id'
    }

    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={{
          ...configureProfileContextValues,
          editMode: true,
          currentData: {
            ...currentData,
            vlans
          } as unknown as SwitchConfigurationProfile
        }}>
          <Form>
            <VlanSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
      })

    await screen.findByRole('heading', { level: 3, name: /VLANs/ })

    const row = await screen.findByRole('row', { name: /vlan-02/i })
    fireEvent.click(await within(row).findByRole('radio'))
    fireEvent.click(await screen.findByRole('button', { name: /Edit/i }))

    const drawer = await screen.findByRole('dialog')
    const row2 = await within(drawer).findByRole('row', { name: /ICX7550-24P/i })
    fireEvent.click(await within(row2).findByRole('radio'))
    fireEvent.click(await within(drawer).findByRole('button', { name: /Edit/i }))

    const dialog = await screen.findByTestId('vlanSettingModal')
    await userEvent.click(await within(dialog).findByText('Untagged Ports'))

    await userEvent.click(await within(dialog).findByTestId('untagged_module1_1'))
    await userEvent.click(await within(dialog).findByText('Tagged Ports'))

    await userEvent.click(await within(dialog).findByTestId('tagged_module1_6'))
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Apply' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })

  it('should handle delete VLAN correctly', async () => {
    const params = {
      tenantId: 'tenant-id'
    }

    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={{
          ...configureProfileContextValues,
          editMode: true,
          currentData: {
            ...currentData,
            vlans: vlans
          } as unknown as SwitchConfigurationProfile
        }}>
          <Form>
            <VlanSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
      })

    await screen.findByRole('heading', { level: 3, name: /VLANs/ })

    const row = await screen.findByRole('row', { name: /vlan-01/i })
    const radio = await within(row).findByRole('radio')
    fireEvent.click(radio)

    const deleteButton1 = await screen.findByRole('button', { name: /Delete/i })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.click(deleteButton1)
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    const deleteButton2 = await screen.findByRole('button', { name: /Delete/i })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.click(deleteButton2)
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Delete Vlan' }))
  })
})