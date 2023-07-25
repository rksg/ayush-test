import '@testing-library/jest-dom'
import userEvent       from '@testing-library/user-event'
import { Form, Modal } from 'antd'

import { Provider }                          from '@acx-ui/store'
import { fireEvent, render, screen, within } from '@acx-ui/test-utils'

import { AclSetting }                                                from './AclSetting'
import { ConfigurationProfileFormContext, ConfigurationProfileType } from './ConfigurationProfileFormContext'
import { TrustedPorts }                                              from './TrustedPorts'
import { VlanSetting }                                               from './VlanSetting'

const currentData = {
  name: 'test-profile',
  description: '',
  acls: [],
  vlans: [{ arpInspection: true, switchFamilyModels: [] }]
}

describe.skip('Wired - VlanSetting', () => {
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

    await userEvent.click(await screen.findByRole('button', { name: 'Add VLAN' }))
    const vIdInput = await screen.findByLabelText('VLAN ID')
    fireEvent.change(vIdInput, { target: { value: '1' } })
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it('should handle edit VLAN correctly', async () => {
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
          }
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

    // const drawer = await screen.findByRole('dialog')
    const IGMPSnooping = await screen.findByLabelText('IGMP Snooping')
    fireEvent.mouseDown(IGMPSnooping)
    fireEvent.click(await screen.findByText('Active'))
    fireEvent.mouseDown(IGMPSnooping)
    fireEvent.click(await screen.findByText('Passive'))
    fireEvent.mouseDown(IGMPSnooping)
    fireEvent.click(await screen.findByLabelText('NONE'))
    fireEvent.click(await screen.findByRole('button', { name: /Save/i }))
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
          }
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
    await userEvent.click(await within(dialog).findByTestId('untagged_module1_2'))
    await userEvent.click(await within(dialog).findByTestId('untagged_module1_3'))
    await userEvent.click(await within(dialog).findByTestId('untagged_module1_4'))
    await userEvent.click(await within(dialog).findByTestId('untagged_module1_5'))
    await userEvent.click(await within(dialog).findByText('Tagged Ports'))

    await userEvent.click(await within(dialog).findByTestId('tagged_module1_6'))
    await userEvent.click(await within(dialog).findByTestId('tagged_module1_7'))
    await userEvent.click(await within(dialog).findByTestId('tagged_module1_8'))
    await userEvent.click(await within(dialog).findByTestId('tagged_module1_9'))
    await userEvent.click(await within(dialog).findByTestId('tagged_module1_10'))
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
          }
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
    fireEvent.click(await within(row).findByRole('radio'))

    fireEvent.click(await screen.findByRole('button', { name: /Delete/i }))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    fireEvent.click(await screen.findByRole('button', { name: /Delete/i }))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete Vlan' }))
  })

  it('should handle delete VLAN port correctly', async () => {
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
          }
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
    const row2 = await screen.findByRole('row', { name: /ICX7550-24P/i })
    fireEvent.click(await within(row2).findByRole('radio'))
    fireEvent.click(await within(drawer).findByRole('button', { name: /Delete/i }))
    fireEvent.click(await screen.findByRole('button', { name: /Delete Model/i }))
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

describe('Wired - AclSetting', () => {
  const configureProfileContextValues = {
    editMode: false,
    currentData
  } as unknown as ConfigurationProfileType

  const acls = [{
    aclType: 'standard',
    id: 'ed2c12c471084e35a640997240780b33',
    name: 'acl-01',
    aclRules: [{
      action: 'permit',
      id: 'c55b55e4d5e149d0a0ebe783dfe7547c',
      protocol: 'ip',
      sequence: 65000,
      source: 'any'
    }, {
      action: 'deny',
      id: 'f85299278f7048808ca01049e90c560d',
      protocol: 'ip',
      sequence: 888,
      source: '1.1.1.0/24'
    }]
  }]

  afterEach(() => {
    Modal.destroyAll()
  })

  it('should handle add ACL correctly', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <Form>
            <AclSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
      })

    await screen.findByRole('heading', { level: 3, name: /ACLs/ })

    await userEvent.click(await screen.findByRole('button', { name: 'Add ACL' }))
    const aclNameInput = await screen.findByLabelText('ACL Name')
    fireEvent.change(aclNameInput, { target: { value: '1' } })

    await userEvent.click(await screen.findByRole('button', { name: 'Add Rule' }))
    fireEvent.change(await screen.findByLabelText('Sequence'), { target: { value: '1' } })
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it('should handle add extended ACL correctly', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <Form>
            <AclSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
      })

    await screen.findByRole('heading', { level: 3, name: /ACLs/ })

    await userEvent.click(await screen.findByRole('button', { name: 'Add ACL' }))
    const aclNameInput = await screen.findByLabelText('ACL Name')
    fireEvent.change(aclNameInput, { target: { value: '100' } })
    const extendedOption = await screen.findByLabelText('Extended')
    await userEvent.click(extendedOption)
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it('should handle edit ACL correctly', async () => {
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
            acls
          }
        }}>
          <Form>
            <AclSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
      })

    await screen.findByRole('heading', { level: 3, name: /ACLs/ })

    const row = await screen.findByRole('row', { name: /acl-01/i })
    fireEvent.click(await within(row).findByRole('radio'))

    const editButton = await screen.findByRole('button', { name: /Edit/i })
    fireEvent.click(editButton)
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })

  it('should handle delete ACL correctly', async () => {
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
            acls
          }
        }}>
          <Form>
            <AclSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
      })

    await screen.findByRole('heading', { level: 3, name: /ACLs/ })

    const row = await screen.findByRole('row', { name: /acl-01/i })
    fireEvent.click(await within(row).findByRole('radio'))

    fireEvent.click(await screen.findByRole('button', { name: /Delete/i }))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    fireEvent.click(await screen.findByRole('button', { name: /Delete/i }))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete ACL' }))
  })

  it('should handle edit ACL rule correctly', async () => {
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
            acls
          }
        }}>
          <Form>
            <AclSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
      })

    await screen.findByRole('heading', { level: 3, name: /ACLs/ })

    const row = await screen.findByRole('row', { name: /acl-01/i })
    fireEvent.click(await within(row).findByRole('radio'))
    fireEvent.click(await screen.findByRole('button', { name: /Edit/i }))

    const drawer = await screen.findByRole('dialog')
    const row2 = await screen.findByRole('row', { name: /888/i })
    fireEvent.click(await within(row2).findByRole('radio'))
    fireEvent.click(await within(drawer).findByRole('button', { name: /Edit/i }))
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
  })

  it('should handle delete ACL rule correctly', async () => {
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
            acls
          }
        }}>
          <Form>
            <AclSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
      })

    await screen.findByRole('heading', { level: 3, name: /ACLs/ })

    const row = await screen.findByRole('row', { name: /acl-01/i })
    fireEvent.click(await within(row).findByRole('radio'))
    fireEvent.click(await screen.findByRole('button', { name: /Edit/i }))

    const drawer = await screen.findByRole('dialog')
    const row2 = await screen.findByRole('row', { name: /65000/i })
    fireEvent.click(await within(row2).findByRole('radio'))
    fireEvent.click(await within(drawer).findByRole('button', { name: /Delete/i }))
  })
})

describe('Wired - TrustedPorts', () => {
  const params = {
    tenantId: 'tenant-id'
  }
  const configureProfileContextValues = {
    editMode: false,
    currentData
  } as unknown as ConfigurationProfileType

  const trustedPorts = [{
    id: '022a36c0c49644d7b8ab94f157d70bd5',
    model: 'ICX7150-48',
    slots: [
      { slotNumber: 1, enable: true },
      { slotNumber: 3, enable: true, option: '4X1/10G' },
      { slotNumber: 2, enable: true, option: '2X1G' }
    ],
    trustPorts: ['1/1/2'],
    trustedPortType: 'all',
    vlanDemand: false

  }]

  afterEach(() => {
    Modal.destroyAll()
  })

  it('should handle add trusted ports correctly', async () => {
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <Form>
            <TrustedPorts />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
      })

    await screen.findByRole('heading', { level: 3, name: /Trusted Ports/ })

    await userEvent.click(await screen.findByRole('button', { name: 'Add Model' }))
    const dialog = await screen.findByTestId('trustedPortModal')
    const family = await within(dialog).findByTestId('ICX7150')
    await userEvent.click(family)
    const model = await within(dialog).findByTestId('24')
    await userEvent.click(model)
    const nextTrustPortButton = await within(dialog).findByRole('button', { name: 'Next' })
    await userEvent.click(nextTrustPortButton)

    fireEvent.change(await within(dialog).findByRole('combobox'), {
      target: { value: '1/1/1' }
    })
    const saveTrustPortButton = await within(dialog).findAllByRole('button', { name: 'Finish' })
    await userEvent.click(saveTrustPortButton[0])
  })

  it('should handle edit trusted ports correctly', async () => {
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={{
          ...configureProfileContextValues,
          editMode: true,
          currentData: {
            ...currentData,
            trustedPorts
          }
        }}>
          <Form>
            <TrustedPorts />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
      })

    await screen.findByRole('heading', { level: 3, name: /Trusted Ports/ })

    const row = await screen.findByRole('row', { name: /ICX7150-48/i })
    fireEvent.click(await within(row).findByRole('radio'))

    const editButton = await screen.findByRole('button', { name: /Edit/i })
    fireEvent.click(editButton)
    await userEvent.click((await screen.findAllByText('Trusted Ports'))[1])
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
  })

  it('should handle delete trusted ports correctly', async () => {
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
            trustedPorts
          }
        }}>
          <Form>
            <TrustedPorts />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
      })

    await screen.findByRole('heading', { level: 3, name: /Trusted Ports/ })

    const row = await screen.findByRole('row', { name: /ICX7150-48/i })
    fireEvent.click(await within(row).findByRole('radio'))

    fireEvent.click(await screen.findByRole('button', { name: /Delete/i }))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    fireEvent.click(await screen.findByRole('button', { name: /Delete/i }))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete Trust Port' }))
  })
})
