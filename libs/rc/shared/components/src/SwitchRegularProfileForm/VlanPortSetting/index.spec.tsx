import '@testing-library/jest-dom'
import userEvent       from '@testing-library/user-event'
import { Form, Modal } from 'antd'
import _               from 'lodash'

import { StepsForm }                       from '@acx-ui/components'
import { SwitchConfigurationProfile }      from '@acx-ui/rc/utils'
import { Provider }                        from '@acx-ui/store'
import { render, screen, within, waitFor } from '@acx-ui/test-utils'

import { ConfigurationProfileFormContext, ConfigurationProfileType } from '../ConfigurationProfileFormContext'

import { VlanPortSetting } from '.'

const currentData = {
  name: 'test-profile',
  description: '',
  acls: [],
  vlans: [{ arpInspection: true, switchFamilyModels: [] }]
}

const handleSetPort = async (
  family: string, model: string,
  enableModule2?: boolean, portTestId?: string, updatedUntagged?: boolean, vlanId = 3
) => {
  await userEvent.click(await screen.findByRole('button', { name: 'Set Ports' }))
  const dialog = await screen.findByRole('dialog')
  expect(await within(dialog).findByText(/Select Ports By Model/)).toBeVisible()

  await userEvent.click(await screen.findByText(family))
  await userEvent.click(await screen.findByText(model))
  if (enableModule2) {
    await userEvent.click(await screen.findByText('Module 2:'))
  }
  await userEvent.click(await within(dialog).findByRole('button', { name: 'Next' }) )

  if (portTestId) {
    await userEvent.click(await within(dialog).findByTestId(portTestId))
    const comboboxes = await within(dialog).findAllByRole('combobox')
    const combobox = updatedUntagged ? comboboxes[0] : comboboxes[1]
    await userEvent.click(combobox)
    let text = await screen.findAllByText(vlanId)
    await userEvent.click(text[text.length - 1])
  }

  await userEvent.click(await within(dialog).findByRole('button', { name: 'Add' }) )
  await waitFor(()=>{
    expect(dialog).not.toBeVisible()
  })
}

describe('Wired - VlanPortSetting', () => {
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
    vlanName: 'vlan-02'
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
    vlanName: 'vlan-03'
  }, {
    arpInspection: false,
    id: '545d08c0e7894501846455233ad60cc6',
    igmpSnooping: 'none',
    ipv4DhcpSnooping: false,
    spanningTreePriority: 32768,
    spanningTreeProtocol: 'none',
    vlanId: 4,
    vlanName: 'vlan-04'
  }, {
    arpInspection: false,
    id: '1af3d29b5dcc46a5a20a651fda55e2dg',
    igmpSnooping: 'none',
    ipv4DhcpSnooping: false,
    spanningTreePriority: 32768,
    spanningTreeProtocol: 'none',
    switchFamilyModels: [{
      id: '9874453239bc479fac68bc050d0cf730',
      model: 'ICX7650-48ZP',
      slots: [
        { slotNumber: 1, enable: true },
        { slotNumber: 2, enable: true, option: '1X40/100G' }
      ],
      taggedPorts: '1/1/2,1/1/12,1/1/13',
      untaggedPorts: '1/1/3'
    }],
    vlanId: 6,
    vlanName: 'vlan-06'
  }, {
    arpInspection: false,
    id: '58a416d95f2541b1b06b433d321ade55',
    igmpSnooping: 'none',
    ipv4DhcpSnooping: false,
    spanningTreePriority: 32768,
    spanningTreeProtocol: 'none',
    switchFamilyModels: [{
      id: '6f4e76d9e48e4cc1ad785ba210557b03',
      model: 'ICX7150-24',
      slots: [
        { slotNumber: 1, enable: true },
        { slotNumber: 2, enable: true, option: '2X1G' },
        { slotNumber: 3, enable: true, option: '4X1/10G' }
      ],
      taggedPorts: '1/2/2',
      untaggedPorts: '1/2/1'
    }],
    vlanId: 20
  }]

  const newVlan3 = {
    ...vlans[1],
    switchFamilyModels: [{
      id: '9874453239bc479fac68bc050d0cf729',
      model: 'ICX7550-24P',
      slots: [
        { slotNumber: 1, enable: true },
        { slotNumber: 2, enable: true, option: '2X40G' },
        { slotNumber: 3, enable: true, option: '2X40G' }
      ],
      taggedPorts: '1/2/2',
      untaggedPorts: '1/1/20,1/3/2'
    }, {
      id: '9874453239bc479fac68bc050d0cf728',
      model: 'ICX7650-48ZP',
      slots: [
        { slotNumber: 1, enable: true },
        { slotNumber: 2, enable: true, option: '1X40/100G' }
      ],
      taggedPorts: '1/1/2',
      untaggedPorts: '1/1/3'
    }, {
      id: '9874453239bc479fac68bc050d0cf727',
      model: 'ICX7650-48ZP',
      slots: [
        { slotNumber: 1, enable: true }
      ],
      taggedPorts: '1/1/40',
      untaggedPorts: '1/1/38'
    }]
  }

  const multiEditResult = {
    ...currentData,
    vlans: [
      vlans[0],
      {
        arpInspection: false,
        igmpSnooping: 'none',
        ipv4DhcpSnooping: false,
        spanningTreePriority: 32768,
        spanningTreeProtocol: 'none',
        switchFamilyModels: [{
          id: '9874453239bc479fac68bc050d0cf728',
          model: 'ICX7650-48ZP',
          slots: [
            { slotNumber: 1, enable: true },
            { slotNumber: 2, enable: true, option: '1X40/100G' }
          ],
          taggedPorts: '1/1/2',
          untaggedPorts: '1/1/3'
        }, {
          id: '9874453239bc479fac68bc050d0cf727',
          model: 'ICX7650-48ZP',
          slots: [
            { slotNumber: 1, enable: true }
          ],
          taggedPorts: '1/1/40',
          untaggedPorts: '1/1/38'
        }, {
          id: '',
          model: 'ICX7550-24P',
          slots: [
            { slotNumber: 1, enable: true },
            { slotNumber: 2, enable: true, option: '2X40G' },
            { slotNumber: 3, enable: true, option: '2X40G' }
          ],
          taggedPorts: '1/2/2,1/1/1,1/2/1,1/3/1',
          untaggedPorts: '1/1/20,1/3/2'
        }],
        vlanId: 3,
        vlanName: 'vlan-03'
      }]
  }

  afterEach(() => {
    Modal.destroyAll()
  })

  it('should disable set ports botton when the VLAN field is empty', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'add'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={{
          editMode: false, currentData: {} as SwitchConfigurationProfile
        }}>
          <Form>
            <VlanPortSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Ports/ })
    expect(await screen.findByRole('button', { name: 'Set Ports' })).toBeDisabled()
  })

  it('should handle set port when no selected model correctly', async () => {
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
            <VlanPortSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Ports/ })
    await userEvent.click(await screen.findByRole('button', { name: 'Set Ports' }))
    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText(/Select Ports By Model/)).toBeVisible()

    await userEvent.click(await screen.findByText('ICX-7650'))
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Next' }) )
    expect(await screen.findByText(/No model selected/)).toBeVisible()
  })

  it('should render correctly', async () => {
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
            vlans: [
              vlans[0],
              newVlan3,
              {
                ...vlans[2],
                switchFamilyModels: [{
                  id: '9fbb8e3d3b51482c989bbe1a6a68feb9',
                  model: 'ICX7150-24',
                  taggedPorts: '1/1/2,1/1/10,1/1/12',
                  slots: [{
                    slotNumber: 3,
                    enable: true,
                    option: '4X1/10G'
                  },{
                    slotNumber: 2,
                    enable: true,
                    option: '2X1G'
                  }, {
                    slotNumber: 1,
                    enable: true
                  }]
                }, {
                  id: '9874453239bc479fac68bc050d0cf729',
                  model: 'ICX7550-24P',
                  slots: [
                    { slotNumber: 1, enable: true },
                    { slotNumber: 3, enable: true, option: '2X40G' },
                    { slotNumber: 2, enable: true, option: '2X40G' }
                  ],
                  taggedPorts: '1/2/1',
                  untaggedPorts: '1/1/20,1/3/2'
                }]
              }
            ]
          } as unknown as SwitchConfigurationProfile
        }}>
          <StepsForm onFinish={jest.fn()}>
            <StepsForm.StepForm>
              <VlanPortSetting />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Ports/ })
    expect(await screen.findByText(/ICX7550-24P/)).toBeVisible()
    expect(await screen.findByText(/ICX7650-48ZP/)).toBeVisible()
    expect(await screen.findByText(/Default/)).toBeVisible()

    const checkboxes = await screen.findAllByRole('checkbox')
    expect(checkboxes).toHaveLength(4)

    await userEvent.click(checkboxes[0])
    expect(await screen.findByText(/4 selected/)).toBeVisible()

    await userEvent.click(checkboxes[3])
    expect(await screen.findByText(/2 selected/)).toBeVisible()
  })

  it('should handle set port when no ports are configured correctly', async () => {
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
            <VlanPortSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Ports/ })
    await userEvent.click(await screen.findByRole('button', { name: 'Set Ports' }))
    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText(/Select Ports By Model/)).toBeVisible()

    await userEvent.click(await screen.findByText('ICX-7650'))
    await userEvent.click(await screen.findByText('48F'))
    await userEvent.click(await screen.findByText('Module 2:'))
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Next' }) )

    expect(await within(dialog).findByText(
      /Select the ports to configure VLAN\(s\) for this model \(ICX7650-48F\)/
    )).toBeVisible()
    expect(await within(dialog).findByText('48 X 10G')).toBeVisible()
    expect(await within(dialog).findByText('1 X 40/100G')).toBeVisible()
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Add' }) )

    expect(await screen.findByText(/Configure at least one VLAN/)).toBeVisible()
  })

  it('should handle set ports correctly', async () => {
    const onFinishSpy = jest.fn()
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
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <VlanPortSetting />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Ports/ })
    await handleSetPort('ICX-7650', '48ZP', true, 'module1_1_4', true)

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    expect(onFinishSpy).toBeCalledTimes(1)
    const call = onFinishSpy.mock.calls[0]
    expect(call[0]).toStrictEqual({
      ...currentData,
      vlans: vlans.map((v, i) => {
        if (i === 1) {
          return {
            arpInspection: false,
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
            }, {
              id: '',
              model: 'ICX7650-48ZP',
              slots: [
                { slotNumber: 1, enable: true },
                { slotNumber: 2, enable: true, option: '1X40/100G' }
              ],
              taggedPorts: '',
              untaggedPorts: '1/1/4'
            }],
            vlanId: 3,
            vlanName: 'vlan-03'
          }
        } else if (i === 3) {
          return {
            ..._.omit(v, 'id'),
            switchFamilyModels: v.switchFamilyModels?.map(v => ({
              ...v, id: ''
            }))
          }
        }
        return v
      })
    })
  })

  it('should handle edit port correctly', async () => {
    const onFinishSpy = jest.fn()
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
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <VlanPortSetting />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Ports/ })
    await userEvent.click(await screen.findByText('ICX7550-24P'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText(/Select Ports By Model/)).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    expect(onFinishSpy).toBeCalledTimes(1)
    const call = onFinishSpy.mock.calls[0]
    expect(call[0]).toStrictEqual({
      ...currentData,
      vlans: vlans.map((v, i) => {
        if (i === 1) {
          return {
            arpInspection: false,
            igmpSnooping: 'none',
            ipv4DhcpSnooping: false,
            spanningTreePriority: 32768,
            spanningTreeProtocol: 'none',
            switchFamilyModels: [{
              id: '',
              model: 'ICX7550-24P',
              slots: [
                { slotNumber: 1, enable: true },
                { slotNumber: 2, enable: true, option: '2X40G' },
                { slotNumber: 3, enable: true, option: '2X40G' }
              ],
              taggedPorts: '1/2/2',
              untaggedPorts: '1/1/20,1/3/2'
            }],
            vlanId: 3,
            vlanName: 'vlan-03'
          }
        }
        return v
      })
    })

  })

  it('should handle add port to existing module correctly', async () => {
    const onFinishSpy = jest.fn()
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
            vlans: [
              vlans[0],
              newVlan3
            ]
          } as unknown as SwitchConfigurationProfile
        }}>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <VlanPortSetting />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Ports/ })
    await handleSetPort('ICX-7850', '48FS', false, 'module1_1_4', false)
    await handleSetPort('ICX-7650', '48ZP', false, 'module1_1_4', true)

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    expect(onFinishSpy).toBeCalledTimes(1)
    const call = onFinishSpy.mock.calls[0]
    expect(call[0]).toStrictEqual({
      ...currentData,
      vlans: [
        vlans[0],
        {
          arpInspection: false,
          igmpSnooping: 'none',
          ipv4DhcpSnooping: false,
          spanningTreePriority: 32768,
          spanningTreeProtocol: 'none',
          switchFamilyModels: [{
            id: '9874453239bc479fac68bc050d0cf729',
            model: 'ICX7550-24P',
            slots: [
              { slotNumber: 1, enable: true },
              { slotNumber: 2, enable: true, option: '2X40G' },
              { slotNumber: 3, enable: true, option: '2X40G' }
            ],
            taggedPorts: '1/2/2',
            untaggedPorts: '1/1/20,1/3/2'
          }, {
            id: '9874453239bc479fac68bc050d0cf728',
            model: 'ICX7650-48ZP',
            slots: [
              { slotNumber: 1, enable: true },
              { slotNumber: 2, enable: true, option: '1X40/100G' }
            ],
            taggedPorts: '1/1/2',
            untaggedPorts: '1/1/3'
          }, {
            id: '',
            model: 'ICX7850-48FS',
            slots: [
              { slotNumber: 1, enable: true },
              { slotNumber: 2, enable: true, option: '8X40/100G' }
            ],
            taggedPorts: '1/1/4',
            untaggedPorts: ''
          }, {
            id: '',
            model: 'ICX7650-48ZP',
            slots: [
              { slotNumber: 1, enable: true }
            ],
            taggedPorts: '1/1/40',
            untaggedPorts: '1/1/38,1/1/4'
          }],
          vlanId: 3,
          vlanName: 'vlan-03'
        }]
    })
  })

  it('should handle add port to new module correctly', async () => {
    const onFinishSpy = jest.fn()
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
            vlans: vlans
          } as unknown as SwitchConfigurationProfile
        }}>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <VlanPortSetting />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Ports/ })

    await handleSetPort('ICX-7550', '48', false, 'module1_1_2', false, 2)
    await handleSetPort('ICX-7550', '48', false, 'module1_1_2', false, 4)
    await handleSetPort('ICX-8200', '24', false, 'module1_1_2', false, 4)
    await handleSetPort('ICX-8200', '24P', false, 'module1_1_2', false, 4)

    await userEvent.click(await screen.findByText('ICX7550-48'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Apply' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    expect(onFinishSpy).toBeCalledTimes(1)
    const call = onFinishSpy.mock.calls[0]
    expect(call[0]).toStrictEqual({
      ...currentData,
      vlans: vlans.map(vlan => {
        if (vlan.vlanId === 2) {
          return {
            ..._.omit(vlan, 'id'),
            switchFamilyModels: [{
              id: '',
              model: 'ICX7550-48',
              slots: [
                { slotNumber: 1, enable: true },
                { slotNumber: 2, enable: true, option: '2X40G' }
              ],
              taggedPorts: '1/1/2',
              untaggedPorts: ''
            }]
          }
        } else if (vlan.vlanId === 4) {
          return {
            ..._.omit(vlan, 'id'),
            switchFamilyModels: [{
              id: '',
              model: 'ICX8200-24',
              slots: [
                { slotNumber: 1, enable: true },
                { slotNumber: 2, enable: true, option: '4X1/10/25G' }
              ],
              taggedPorts: '1/1/2',
              untaggedPorts: ''
            }, {
              id: '',
              model: 'ICX8200-24P',
              slots: [
                { slotNumber: 1, enable: true },
                { slotNumber: 2, enable: true, option: '4X1/10/25G' }
              ],
              taggedPorts: '1/1/2',
              untaggedPorts: ''
            }, {
              id: '',
              model: 'ICX7550-48',
              slots: [
                { slotNumber: 1, enable: true },
                { slotNumber: 2, enable: true, option: '2X40G' }
              ],
              taggedPorts: '1/1/2',
              untaggedPorts: ''
            }]
          }
        }
        return vlan
      })
    })
  })

  it('should handle add multiple port correctly', async () => {
    const onFinishSpy = jest.fn()
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
            vlans: [
              vlans[0],
              newVlan3
            ]
          } as unknown as SwitchConfigurationProfile
        }}>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <VlanPortSetting />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Ports/ })

    await handleSetPort('ICX-8200', '24', false, 'module1_1_2')
    await handleSetPort('ICX-8200', '24P', false, 'module1_1_3')

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    expect(onFinishSpy).toBeCalledTimes(1)
    const call = onFinishSpy.mock.calls[0]
    expect(call[0]).toStrictEqual({
      ...currentData,
      vlans: [
        vlans[0],
        {
          arpInspection: false,
          igmpSnooping: 'none',
          ipv4DhcpSnooping: false,
          spanningTreePriority: 32768,
          spanningTreeProtocol: 'none',
          switchFamilyModels: [{
            id: '9874453239bc479fac68bc050d0cf729',
            model: 'ICX7550-24P',
            slots: [
              { slotNumber: 1, enable: true },
              { slotNumber: 2, enable: true, option: '2X40G' },
              { slotNumber: 3, enable: true, option: '2X40G' }
            ],
            taggedPorts: '1/2/2',
            untaggedPorts: '1/1/20,1/3/2'
          }, {
            id: '9874453239bc479fac68bc050d0cf728',
            model: 'ICX7650-48ZP',
            slots: [
              { slotNumber: 1, enable: true },
              { slotNumber: 2, enable: true, option: '1X40/100G' }
            ],
            taggedPorts: '1/1/2',
            untaggedPorts: '1/1/3'
          }, {
            id: '9874453239bc479fac68bc050d0cf727',
            model: 'ICX7650-48ZP',
            slots: [
              { slotNumber: 1, enable: true }
            ],
            taggedPorts: '1/1/40',
            untaggedPorts: '1/1/38'
          }, {
            id: '',
            model: 'ICX8200-24',
            slots: [
              { slotNumber: 1, enable: true },
              { slotNumber: 2, enable: true, option: '4X1/10/25G' }
            ],
            taggedPorts: '1/1/2',
            untaggedPorts: ''
          }, {
            id: '',
            model: 'ICX8200-24P',
            slots: [
              { slotNumber: 1, enable: true },
              { slotNumber: 2, enable: true, option: '4X1/10/25G' }
            ],
            taggedPorts: '1/1/3',
            untaggedPorts: ''
          }],
          vlanId: 3,
          vlanName: 'vlan-03'
        }
      ]
    })

  })

  it('should handle cancel modal correctly', async () => {
    const onFinishSpy = jest.fn()
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
            vlans: [
              vlans[0],
              newVlan3
            ]
          } as unknown as SwitchConfigurationProfile
        }}>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <VlanPortSetting />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Ports/ })
    await userEvent.click(await screen.findByText('ICX7550-24P'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText(/Select Ports By Model/)).toBeVisible()
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Cancel' }))
    expect(dialog).not.toBeVisible()
  })

  it('should handle multiple selected ports correctly', async () => {
    const onFinishSpy = jest.fn()
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
            vlans: [
              vlans[0],
              newVlan3
            ]
          } as unknown as SwitchConfigurationProfile
        }}>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <VlanPortSetting />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Ports/ })
    await userEvent.click(await screen.findByText('ICX7550-24P'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText(/Select Ports By Model/)).toBeVisible()

    await userEvent.click(await within(dialog).findByRole('button', { name: 'Set Ports' }))
    await userEvent.click(await within(dialog).findByTestId('module1_1_1'))
    await userEvent.click(await within(dialog).findByTestId('module1_2_1'))
    await userEvent.click(await within(dialog).findByTestId('module1_3_1'))

    await userEvent.click(await within(dialog).findByTestId('taggedVlans-override-checkbox'))
    const comboboxes = await within(dialog).findAllByRole('combobox')
    await userEvent.click(comboboxes[1]) //untagged
    const text3 = await screen.findAllByText('3')
    await userEvent.click(text3[2])

    await userEvent.click(await within(dialog).findByRole('button', { name: 'Apply' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    expect(onFinishSpy).toBeCalledTimes(1)
    const call = onFinishSpy.mock.calls[0]
    expect(call[0]).toStrictEqual(multiEditResult)
  })

  it('should handle the override checkbox correctly', async () => {
    const onFinishSpy = jest.fn()
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
            vlans: [
              vlans[0],
              newVlan3
            ]
          } as unknown as SwitchConfigurationProfile
        }}>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <VlanPortSetting />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Ports/ })
    await userEvent.click(await screen.findByText('ICX7550-24P'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText(/Select Ports By Model/)).toBeVisible()

    await userEvent.click(await within(dialog).findByRole('button', { name: 'Set Ports' }))
    await userEvent.click(await within(dialog).findByTestId('module1_1_1'))
    await userEvent.click(await within(dialog).findByTestId('module1_2_1'))
    await userEvent.click(await within(dialog).findByTestId('module1_3_1'))

    await userEvent.click(await within(dialog).findByTestId('taggedVlans-override-checkbox'))
    let comboboxes = await within(dialog).findAllByRole('combobox')
    await userEvent.click(comboboxes[1]) //tagged
    const text3 = await screen.findAllByText('3')
    await userEvent.click(text3[2])

    await userEvent.click(await within(dialog).findByTestId('module1_1_2'))
    expect(await within(dialog).findByTestId('taggedVlans-override-checkbox')).not.toBeChecked()
    expect(await within(dialog).findAllByText(/Multiple values/)).toHaveLength(1)

    await userEvent.click(await within(dialog).findByTestId('taggedVlans-override-checkbox'))
    expect(await within(dialog).findByTestId('taggedVlans-override-checkbox')).toBeChecked()
    await userEvent.click(await within(dialog).findByTestId('taggedVlans-override-checkbox'))
    expect(await within(dialog).findByTestId('taggedVlans-override-checkbox')).not.toBeChecked()

    await userEvent.click(await within(dialog).findByRole('button', { name: 'Apply' }) )
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    expect(onFinishSpy).toBeCalledTimes(1)
    const call = onFinishSpy.mock.calls[0]
    expect(call[0]).toStrictEqual(multiEditResult)
  })

  it('should handle clear selection correctly', async () => {
    const onFinishSpy = jest.fn()
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
            vlans: [
              vlans[0],
              newVlan3
            ]
          } as unknown as SwitchConfigurationProfile
        }}>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <VlanPortSetting />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Ports/ })
    await userEvent.click(await screen.findByText('ICX7550-24P'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText(/Select Ports By Model/)).toBeVisible()

    await userEvent.click(await within(dialog).findByRole('button', { name: 'Set Ports' }))
    await userEvent.click(await within(dialog).findByTestId('module1_1_1'))
    await userEvent.click(await within(dialog).findByTestId('module1_2_1'))
    await userEvent.click(await within(dialog).findByTestId('module1_3_1'))

    await userEvent.click(await within(dialog).findByTestId('taggedVlans-override-checkbox'))
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Clear Selection' }) )

    const comboboxes = await within(dialog).findAllByRole('combobox')
    expect(comboboxes).toHaveLength(2)
    expect(comboboxes[0]).toBeDisabled()
    expect(comboboxes[1]).toBeDisabled()
  })

  it('should delete module correctly', async () => {
    const onFinishSpy = jest.fn()
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
            vlans: vlans.map((v, i) => {
              if (i === 1) {
                return newVlan3
              }
              return v
            })
          } as unknown as SwitchConfigurationProfile
        }}>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <VlanPortSetting />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Ports/ })
    expect(await screen.findByText(/ICX7150-24/)).toBeVisible()
    await userEvent.click(await screen.findByText('ICX7550-24P'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog')
    expect(await screen.findByText(/Are you sure you want to delete this Module?/)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Delete Module' }))
    await waitFor(()=>{
      expect(dialog).not.toBeVisible()
    })
    expect(screen.queryByText('ICX7550-24P')).toBeNull()
  })

  it('should delete modules correctly', async () => {
    const onFinishSpy = jest.fn()
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
            vlans: vlans.map((v, i) => {
              if (i === 1) {
                return newVlan3
              }
              return v
            })
          } as unknown as SwitchConfigurationProfile
        }}>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <VlanPortSetting />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Ports/ })
    expect(await screen.findByText(/ICX7150-24/)).toBeVisible()
    expect(await screen.findByText(/ICX7650-48ZP/)).toBeVisible()
    await userEvent.click(await screen.findByText('ICX7550-24P'))
    await userEvent.click(await screen.findByText('ICX7650-48ZP'))

    expect(await screen.findByRole('button', { name: 'Edit' })).toBeDisabled()
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.hover(screen.getByRole('button', { name: 'Edit' }).parentElement!)
    expect(
      await screen.findByRole('tooltip')
    ).toHaveTextContent(/the same module within the same series/)

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog')
    expect(await screen.findByText(/Delete Selected Module(s)?/)).toBeVisible()
    expect(await screen.findByText(/Are you sure you want to delete these Modules?/)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Delete Modules' }))
    await waitFor(()=>{
      expect(dialog).not.toBeVisible()
    })
    expect(screen.queryByText('ICX7550-24P')).toBeNull()
  })

  it('should show onboard warning correctly', async () => {
    const onFinishSpy = jest.fn()
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
            applyOnboardOnly: true,
            vlans: vlans.map((v, i) => {
              if (i === 1) {
                return newVlan3
              }
              return v
            })
          } as unknown as SwitchConfigurationProfile
        }}>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <VlanPortSetting />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Ports/ })
    expect(await screen.findByText(/ICX7150-24/)).toBeVisible()
    await userEvent.click(await screen.findByText('ICX7550-24P'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    expect(await screen.findByText(
      /Any VLANs defined on ports of these modules\' will get removed/)).toBeVisible()
  })

  it('should expand rows correctly', async () => {
    const onFinishSpy = jest.fn()
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
            vlans: [
              vlans[0],
              newVlan3
            ]
          } as unknown as SwitchConfigurationProfile
        }}>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <VlanPortSetting />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Ports/ })
    expect(await screen.findByText(/ICX7550-24P/)).toBeVisible()
    expect(await screen.findByText(/ICX7650-48ZP/)).toBeVisible()

    const expandArrows = await screen.findAllByTestId('arrow-expand')
    await userEvent.click(expandArrows[0])

    const rightArrows = await screen.findAllByTestId('arrow-right')
    await userEvent.click(rightArrows[0])
    expect(screen.queryAllByTestId('arrow-right')).toHaveLength(0)
  })

})
