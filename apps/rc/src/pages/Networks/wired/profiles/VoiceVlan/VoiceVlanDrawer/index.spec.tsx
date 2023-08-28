import '@testing-library/jest-dom'
import userEvent       from '@testing-library/user-event'
import { Form, Modal } from 'antd'
import { act }         from 'react-dom/test-utils'

import { SwitchConfigurationProfile }        from '@acx-ui/rc/utils'
import { Provider }                          from '@acx-ui/store'
import { fireEvent, render, screen, within } from '@acx-ui/test-utils'

import { ConfigurationProfileFormContext, ConfigurationProfileType } from '../../ConfigurationProfileFormContext'
import { VlanSetting }                                               from '../index'


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

  it('should handle delete VLAN port correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'add'
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
    await userEvent.click(radio)
    const editButton = await screen.findByRole('button', { name: /Edit/i })
    await userEvent.click(editButton)

    const drawer = await screen.findByTestId('addVlanDrawer')
    expect(await screen.findByTestId('addVlanDrawer')).toBeVisible()
    const row2 = await within(drawer).findByRole('row', { name: /ICX7550-24P/i })
    const radio2 = await within(row2).findByRole('radio')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.click(radio2)
    })
    // const deleteButton = await within(drawer).findByRole('button', { name: /Delete/i })
    // fireEvent.click(deleteButton)
    // const deleteModel = await screen.findByRole('button', { name: /Delete Model/i })
    // fireEvent.click(deleteModel)
  })

  it('should handle edit Default VLAN settings correctly', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <Form>
            <VlanSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
      })

    await screen.findByRole('heading', { level: 3, name: /VLANs/ })
    await userEvent.click(await screen.findByRole('button', { name: 'Default VLAN settings' }))
    const dvIdInput = await screen.findByLabelText('VLAN ID')
    fireEvent.change(dvIdInput, { target: { value: '1' } })
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })

})