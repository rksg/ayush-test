import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { switchApi }                                                                     from '@acx-ui/rc/services'
import { SwitchUrlsInfo }                                                                from '@acx-ui/rc/utils'
import { Provider, store }                                                               from '@acx-ui/store'
import { act, fireEvent, mockServer, render, screen, within, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  aclUnion,
  defaultVlan,
  selectedPorts,
  switchesVlan,
  switchDetailHeader,
  switchProfile,
  switchRoutedList,
  switchVlans,
  switchVlanUnion,
  taggedVlansByVenue,
  portSetting,
  portsSetting,
  untaggedVlansByVenue,
  vlansByVenue
} from './__tests__/fixtures'
import { EditPortDrawer } from './editPortDrawer'

const params = {
  tenantId: 'tenant-id',
  switchId: 'switch-id',
  serialNumber: 'serial-number'
}

const editPortVlans = async (inputTagged, inputUntagged) => {
  fireEvent.click(await screen.findByRole('button', { name: 'Edit' }))
  const dialog = await screen.findAllByRole('dialog')
  await screen.findByText('Select Port VLANs')

  if (inputTagged) {
    const taggedTabPanel = screen.getByRole('tabpanel', { hidden: false })
    const taggedInput = await within(taggedTabPanel).findByTestId('tagged-input')
    fireEvent.change(taggedInput, { target: { value: inputTagged } })
    expect(within(taggedTabPanel).queryByText(/VLAN-ID-55/)).not.toBeInTheDocument()
    fireEvent.click(await within(dialog[1]).findByText(inputTagged, { exact: false }))
  }

  if (inputUntagged) {
    fireEvent.click(await screen.findByRole('tab', { name: 'Untagged VLANs' }))
    const untaggedTabPanel = screen.getByRole('tabpanel', { hidden: false })
    const untaggedInput = await within(untaggedTabPanel).findByTestId('untagged-input')
    fireEvent.change(untaggedInput, { target: { value: inputUntagged } })
    fireEvent.click(await within(untaggedTabPanel).findByText(/VLAN-ID-22/))
  }
  fireEvent.click(await within(dialog[1]).findByRole('button', { name: 'OK' }))
}

describe('EditPortDrawer', () => {
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(switchDetailHeader))
      ),
      rest.post(SwitchUrlsInfo.getDefaultVlan.url,
        (_, res, ctx) => res(ctx.json(defaultVlan.slice(0, 1)))
      ),
      rest.get(SwitchUrlsInfo.getSwitchVlanUnion.url,
        (_, res, ctx) => res(ctx.json(switchVlanUnion))
      ),
      rest.get(SwitchUrlsInfo.getVlansByVenue.url,
        (_, res, ctx) => res(ctx.json(vlansByVenue))
      ),
      rest.get(SwitchUrlsInfo.getSwitchConfigurationProfileByVenue.url,
        (_, res, ctx) => res(ctx.json(switchProfile))
      ),
      rest.post(SwitchUrlsInfo.getSwitchRoutedList.url,
        (_, res, ctx) => res(ctx.json(switchRoutedList))
      ),
      rest.post(SwitchUrlsInfo.getVenueRoutedList.url,
        (_, res, ctx) => res(ctx.json({})) //
      ),
      rest.get(SwitchUrlsInfo.getSwitchVlans.url,
        (_, res, ctx) => res(ctx.json(switchVlans))
      ),
      rest.get(SwitchUrlsInfo.getPortSetting.url,
        (_, res, ctx) => res(ctx.json(portSetting[0]))
      ),
      rest.get(SwitchUrlsInfo.getAclUnion.url,
        (_, res, ctx) => res(ctx.json(aclUnion))
      ),
      rest.get(SwitchUrlsInfo.getTaggedVlansByVenue.url,
        (_, res, ctx) => res(ctx.json([]))
      ),
      rest.get(SwitchUrlsInfo.getUntaggedVlansByVenue.url,
        (_, res, ctx) => res(ctx.json([]))
      ),
      rest.post(SwitchUrlsInfo.getPortsSetting.url,
        (_, res, ctx) => res(ctx.json(portsSetting))
      ),
      rest.post(SwitchUrlsInfo.getSwitchesVlan.url,
        (_, res, ctx) => res(ctx.json(switchesVlan))
      ),
      rest.put(SwitchUrlsInfo.savePortsSetting.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })
  afterEach(() => {
    Modal.destroyAll()
  })

  describe('single edit', () => {
    it('should apply edit data correctly', async () => {
      const user = userEvent.setup()
      render(<Provider>
        <EditPortDrawer
          visible={true}
          setDrawerVisible={jest.fn()}
          isCloudPort={false}
          isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
          isVenueLevel={false}
          selectedPorts={selectedPorts?.slice(0, 1)}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      })

      await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
      await screen.findByText('Edit Port')
      await screen.findByText('Selected Port')

      await user.click(await screen.findByRole('combobox', { name: /PoE Class/ }))
      await user.click(await screen.findByText('Negotiate'))
      const budgetInput = await screen.findByTestId('poe-budget-input')
      expect(budgetInput).not.toBeDisabled()
      // eslint-disable-next-line testing-library/no-unnecessary-act
      act(() => {
        fireEvent.change(budgetInput, { target: { value: '1000' } })
      })
      expect(await screen.findByRole('combobox', { name: /PoE Class/ })).toBeDisabled()

      fireEvent.click(await screen.findByTestId('ipsg-checkbox'))
      fireEvent.click(await screen.findByRole('button', { name: 'Edit' }))
      let dialog = await screen.findAllByRole('dialog')
      await screen.findByText('Select Port VLANs')
      fireEvent.click(await within(dialog[1]).findByRole('button', { name: 'Cancel' }))

      fireEvent.click(await screen.findByRole('button', { name: 'Create' }))
      dialog = await screen.findAllByRole('dialog')
      await screen.findByText('Add LLDP QoS')
      fireEvent.click(await within(dialog[1]).findByRole('button', { name: 'Cancel' }))

      fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    })

    it('should customized VLAN correctly', async () => {
      const user = userEvent.setup()
      render(<Provider>
        <EditPortDrawer
          visible={true}
          setDrawerVisible={jest.fn()}
          isCloudPort={false}
          isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
          isVenueLevel={false}
          selectedPorts={selectedPorts?.slice(0, 1)}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      })

      await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
      await screen.findByText('Edit Port')
      await screen.findByText('Selected Port')

      await user.click(await screen.findByRole('combobox', { name: /PoE Class/ }))
      await user.click(await screen.findByText('2 (802.3af 7.0 W)'))
      expect(await screen.findByTestId('poe-budget-input')).toBeDisabled()
      editPortVlans('VLAN-ID-66', 'VLAN-ID-')

      fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    })

    it('should close Drawer correctly', async () => {
      render(<Provider>
        <EditPortDrawer
          visible={true}
          setDrawerVisible={jest.fn()}
          isCloudPort={false}
          isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
          isVenueLevel={false}
          selectedPorts={selectedPorts?.slice(0, 1)}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      })

      await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
      fireEvent.click(await screen.findByRole('button', { name: 'Use Venue settings' }))
      fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    })

    it('should handle ICX7650-48F correctly', async () => {
      mockServer.use(
        rest.get(SwitchUrlsInfo.getPortSetting.url,
          (_, res, ctx) => res(ctx.json({
            ...portSetting[0],
            poeCapability: false,
            revert: true,
            poeBudget: 0,
            voiceVlan: 1,
            untaggedVlan: 1
          }))
        ),
        rest.put(SwitchUrlsInfo.savePortsSetting.url,
          (_, res, ctx) => res(ctx.status(404), ctx.json({}))
        )
      )

      const selected = [{
        ...selectedPorts?.[0],
        revert: true,
        switchModel: 'ICX7650-48F'
      }]
      render(<Provider>
        <EditPortDrawer
          visible={true}
          setDrawerVisible={jest.fn()}
          isCloudPort={true}
          isMultipleEdit={selected?.length > 1}
          isVenueLevel={true}
          selectedPorts={selected}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      })

      await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
      await screen.findByText('Edit Port')
      await screen.findByText('Selected Port')
      // expect(await screen.findByTestId('voice-vlan-select')).toHaveValue(1)

      editPortVlans('VLAN-ID-66', 'VLAN-ID-')
      // expect(await screen.findByTestId('voice-vlan-select')).toHaveValue('')
      // let options = getAllByTestId('select-option')
      // expect(options[0].selected).toBeFalsy();
      // expect(await screen.findByRole('option', {name: 'Select VLAN...'}).selected).toBe(true)

      fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      await screen.findByText('Modify Uplink Port?')
      fireEvent.click(await screen.findByRole('button', { name: 'Apply Changes' }))
    })

    it('should handle tagged vlans by venue correctly', async () => {
      mockServer.use(
        rest.get(SwitchUrlsInfo.getPortSetting.url,
          (_, res, ctx) => res(ctx.json({
            ...portSetting[0],
            voiceVlan: 2,
            taggedVlan: ['2'],
            revert: true
          }))
        ),
        rest.get(SwitchUrlsInfo.getUntaggedVlansByVenue.url,
          (_, res, ctx) => res(ctx.json(untaggedVlansByVenue))
        )
      )
      render(<Provider>
        <EditPortDrawer
          visible={true}
          setDrawerVisible={jest.fn()}
          isCloudPort={false}
          isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
          isVenueLevel={false}
          selectedPorts={selectedPorts?.slice(0, 1)}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      })

      await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
      await screen.findByText('Edit Port')
      await screen.findByText('Selected Port')
      await screen.findByText('Applied at venue')
      // editPortVlans('VLAN-ID-77', 'VLAN-ID-')
      // fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    })

    it('should handle untagged vlans by venue correctly', async () => {
      mockServer.use(
        rest.get(SwitchUrlsInfo.getPortSetting.url,
          (_, res, ctx) => res(ctx.json({
            ...portSetting[0],
            revert: true
          }))
        ),
        rest.get(SwitchUrlsInfo.getTaggedVlansByVenue.url,
          (_, res, ctx) => res(ctx.json(taggedVlansByVenue))
        )
      )
      render(<Provider>
        <EditPortDrawer
          visible={true}
          setDrawerVisible={jest.fn()}
          isCloudPort={false}
          isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
          isVenueLevel={false}
          selectedPorts={selectedPorts?.slice(0, 1)}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      })

      await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
      await screen.findByText('Edit Port')
      await screen.findByText('Selected Port')
      await screen.findByText('Applied at venue')
    })
  })

  describe('multiple edit', () => {
    it('should render consistent LLDP data correctly', async () => {
      mockServer.use(
        rest.post(SwitchUrlsInfo.getPortsSetting.url,
          (_, res, ctx) => res(ctx.json({
            ...portsSetting[1],
            ...portsSetting[1]
          }))
        )
      )
      render(<Provider>
        <EditPortDrawer
          visible={true}
          setDrawerVisible={jest.fn()}
          isCloudPort={false}
          isMultipleEdit={selectedPorts.length > 1}
          isVenueLevel={false}
          selectedPorts={selectedPorts}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      })

      await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
      await screen.findByText('Edit Port')
      await screen.findByText('Selected Port')
      const checkboxs = await screen.findAllByRole('checkbox')

      // eslint-disable-next-line testing-library/no-unnecessary-act
      act(() => {
        fireEvent.click(checkboxs[0]) // Port Enable
      })

      fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    })

    it('should apply edit data correctly', async () => {
      mockServer.use(
        rest.post(SwitchUrlsInfo.getDefaultVlan.url,
          (_, res, ctx) => res(ctx.json(defaultVlan))
        )
      )
      render(<Provider>
        <EditPortDrawer
          visible={true}
          setDrawerVisible={jest.fn()}
          isCloudPort={false}
          isMultipleEdit={selectedPorts.length > 1}
          isVenueLevel={false}
          selectedPorts={selectedPorts}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      })

      await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
      await screen.findByText('Edit Port')
      await screen.findByText('Selected Port')
      const checkboxs = await screen.findAllByRole('checkbox')

      // eslint-disable-next-line testing-library/no-unnecessary-act
      act(() => {
        fireEvent.click(checkboxs[0]) // Port Enable
        fireEvent.click(checkboxs[1]) // Poe Enable
        fireEvent.click(checkboxs[5]) // Port VLANs
      })

      // Customize VLAN
      fireEvent.click(await screen.findByRole('button', { name: 'Customize' }))
      let dialog = await screen.findAllByRole('dialog')
      await screen.findByText('Select Port VLANs')
      const taggedTabPanel = screen.getByRole('tabpanel', { hidden: false })
      fireEvent.click(await within(taggedTabPanel).findByText(/VLAN-ID-6/))

      fireEvent.click(await screen.findByRole('tab', { name: 'Untagged VLANs' }))
      const untaggedTabPanel = screen.getByRole('tabpanel', { hidden: false })
      fireEvent.click(await within(untaggedTabPanel).findByText(/VLAN-ID-2/))
      fireEvent.click(await within(dialog[1]).findByRole('button', { name: 'OK' }))

      fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    })
  })

  describe('create/edit LLDP QoS', () => {
    it('should render Edit LLDP Table & Modal correctly', async () => {
      mockServer.use(
        rest.get(SwitchUrlsInfo.getPortSetting.url,
          (_, res, ctx) => res(ctx.json({
            ...portSetting[1],
            lldpQos: [{
              applicationType: 'GUEST_VOICE',
              dscp: 0,
              id: '3df095a0926741b5ac2f9f1f09ffccff',
              qosVlanType: 'PRIORITY_TAGGED'
            }]
          }))
        )
      )
      render(<Provider>
        <EditPortDrawer
          visible={true}
          setDrawerVisible={jest.fn()}
          isCloudPort={false}
          isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
          isVenueLevel={false}
          selectedPorts={selectedPorts?.slice(0, 1)}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      })

      await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
      await screen.findByText('Edit Port')
      await screen.findByText('Selected Port')

      fireEvent.click(await screen.findByRole('button', { name: 'Create' }))
      const dialog = await screen.findAllByRole('dialog')
      await screen.findByText('Add LLDP QoS')
      fireEvent.click(await within(dialog[1]).findByRole('button', { name: 'Cancel' }))
    })

    it('should delete LLDP correctly', async () => {
      mockServer.use(
        rest.get(SwitchUrlsInfo.getPortSetting.url,
          (_, res, ctx) => res(ctx.json(portSetting[1]))
        )
      )
      render(<Provider>
        <EditPortDrawer
          visible={true}
          setDrawerVisible={jest.fn()}
          isCloudPort={false}
          isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
          isVenueLevel={false}
          selectedPorts={selectedPorts?.slice(0, 1)}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      })

      await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
      await screen.findByText('Edit Port')
      await screen.findByText('Selected Port')

      const row = await screen.findByRole('row', { name: /GUEST_VOICE/ }) ////
      fireEvent.click(await within(row).findByRole('radio'))
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => {
        fireEvent.click(await screen.findByRole('button', { name: 'Delete' }) )
      })
      expect(screen.queryByRole('row', { name: /GUEST_VOICE/ })).not.toBeInTheDocument()
    })

    it('should apply Edit LLDP correctly', async () => {
      const user = userEvent.setup()
      mockServer.use(
        rest.get(SwitchUrlsInfo.getPortSetting.url,
          (_, res, ctx) => res(ctx.json(portSetting[1]))
        )
      )
      render(<Provider>
        <EditPortDrawer
          visible={true}
          setDrawerVisible={jest.fn()}
          isCloudPort={false}
          isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
          isVenueLevel={false}
          selectedPorts={selectedPorts?.slice(0, 1)}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      })

      await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
      await screen.findByText('Edit Port')
      await screen.findByText('Selected Port')

      // create
      fireEvent.click(await screen.findByRole('button', { name: 'Create' }))
      let dialog = await screen.findAllByRole('dialog')
      await screen.findByText('Add LLDP QoS')

      let priorityInput = await within(dialog[1]).findByLabelText('Priority')
      fireEvent.change(priorityInput, { target: { value: '1' } })
      const dscpInput = await within(dialog[1]).findByLabelText(/DSCP/)
      fireEvent.change(dscpInput, { target: { value: '2' } })
      fireEvent.click(await within(dialog[1]).findByRole('button', { name: 'Save' }))
      await screen.findByText('LLDP QoS Application Type can not duplicate')

      await user.click(await screen.findByRole('combobox', { name: 'Application Type' }))
      await user.click(await screen.findByText('Video-conferencing'))
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => {
        fireEvent.click(await within(dialog[1]).findByRole('button', { name: 'Save' }))
      })
      expect(await screen.findAllByRole('row')).toHaveLength(3)

      // edit lldp
      const row = await screen.findByRole('row', { name: /GUEST_VOICE/ }) ////
      fireEvent.click(await within(row).findByRole('radio'))
      fireEvent.click(await screen.findByRole('button', { name: 'Edit' }) )

      await screen.findByText(/Edit LLDP QoS/)
      dialog = await screen.findAllByRole('dialog')
      expect(await within(dialog[1]).findByRole('button', { name: 'Save' })).toBeDisabled()

      await user.click(await screen.findByRole('combobox', { name: 'QoS VLAN Type' }))
      await user.click(await screen.findByText('Untagged'))
      await user.click(await screen.findByRole('combobox', { name: 'QoS VLAN Type' }))
      await user.click(await screen.findByText('Priority-tagged'))
      priorityInput = await within(dialog[1]).findByLabelText('Priority')
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => {
        await fireEvent.change(priorityInput, { target: { value: '3' } })
      })

      expect(await within(dialog[1]).findByRole('button', { name: 'Save' })).not.toBeDisabled()
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => {
        fireEvent.click(await within(dialog[1]).findByRole('button', { name: 'Save' }))
      })

      fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    })
  })
})