import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { switchApi }       from '@acx-ui/rc/services'
import { SwitchUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  fireEvent,
  mockServer,
  render,
  screen,
  within,
  waitForElementToBeRemoved,
  waitFor
} from '@acx-ui/test-utils'

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
  venueId: 'venue-id',
  tenantId: 'tenant-id',
  switchId: 'switch-id',
  serialNumber: 'serial-number'
}

const editPortVlans = async (inputTagged, inputUntagged, currentStatus?) => {
  fireEvent.click(await screen.findByRole('button', {
    name: currentStatus !== 'port' ? 'Customize' : 'Edit'
  }))
  const dialog = await screen.findAllByRole('dialog')
  await screen.findByText('Select Port VLANs')

  if (inputTagged) {
    const taggedTabPanel = screen.getByRole('tabpanel', { hidden: false })
    const taggedInput = await within(taggedTabPanel).findByTestId('tagged-input')
    fireEvent.change(taggedInput, { target: { value: inputTagged } })
    expect(within(taggedTabPanel).queryByText(/VLAN-ID-55/)).not.toBeInTheDocument()
    fireEvent.click(await within(taggedTabPanel).findByText(inputTagged, { exact: true }))
  }

  if (inputUntagged) {
    fireEvent.click(await screen.findByRole('tab', { name: 'Untagged VLANs' }))
    const untaggedTabPanel = screen.getByRole('tabpanel', { hidden: false })
    const untaggedInput = await within(untaggedTabPanel).findByTestId('untagged-input')
    fireEvent.change(untaggedInput, { target: { value: inputUntagged } })
    fireEvent.click(await within(untaggedTabPanel).findByText(/VLAN-ID-22/))
  }
  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    fireEvent.click(await within(dialog[1]).findByRole('button', { name: 'OK' }))
  })
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
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.get(SwitchUrlsInfo.getSwitchVlans.url,
        (_, res, ctx) => res(ctx.json(switchVlans))
      ),
      rest.post(SwitchUrlsInfo.getPortSetting.url,
        (_, res, ctx) => res(ctx.json(portSetting[0]))
      ),
      rest.get(SwitchUrlsInfo.getAclUnion.url,
        (_, res, ctx) => res(ctx.json(aclUnion))
      ),
      rest.post(SwitchUrlsInfo.getTaggedVlansByVenue.url,
        (_, res, ctx) => res(ctx.json([]))
      ),
      rest.post(SwitchUrlsInfo.getUntaggedVlansByVenue.url,
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

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      await screen.findByText('Edit Port')
      await screen.findByText('Selected Port')

      await user.click(await screen.findByRole('combobox', { name: /PoE Class/ }))
      await user.click(await screen.findByText('Negotiate'))
      const budgetInput = await screen.findByTestId('poe-budget-input')
      expect(budgetInput).not.toBeDisabled()
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(() => {
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
      await screen.findByText('Port level override')

      await user.click(await screen.findByRole('combobox', { name: /PoE Class/ }))
      await user.click(await screen.findByText('2 (802.3af 7.0 W)'))
      expect(await screen.findByTestId('poe-budget-input')).toBeDisabled()
      await editPortVlans('VLAN-ID-66', 'VLAN-ID-', 'port')

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

    it('should close Drawer and execute onBackClick function correctly', async () => {
      const onBackClickAction = jest.fn()
      render(<Provider>
        <EditPortDrawer
          visible={true}
          setDrawerVisible={jest.fn()}
          isCloudPort={false}
          isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
          isVenueLevel={false}
          selectedPorts={selectedPorts?.slice(0, 1)}
          onBackClick={onBackClickAction}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      })

      await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
      fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
      expect(onBackClickAction).toHaveBeenCalled()
    })

    it('should handle ICX7650-48F correctly', async () => {
      mockServer.use(
        rest.post(SwitchUrlsInfo.getPortSetting.url,
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
          path: '/:tenantId/venues/:venueId/venue-details/devices/switch'
        }
      })

      await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
      await screen.findByText('Edit Port')
      await screen.findByText('Selected Port')

      await editPortVlans('VLAN-ID-66', 'VLAN-ID-')
      // TODO: check voice vlan value
      // expect(await screen.findByTestId('voice-vlan-select')).toHaveValue('')

      fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      await screen.findByText('Modify Uplink Port?')
      const dialog = await screen.findAllByRole('dialog')
      expect(dialog).toHaveLength(2)
      const modal = dialog[1]

      fireEvent.click(await screen.findByRole('button', { name: 'Apply Changes' }))
      await waitFor(()=>{
        expect(modal).not.toBeVisible()
      })
    })

    it('should handle tagged vlans by venue correctly', async () => {
      mockServer.use(
        rest.post(SwitchUrlsInfo.getPortSetting.url,
          (_, res, ctx) => res(ctx.json({
            ...portSetting[0],
            voiceVlan: 2,
            taggedVlan: ['1', '2'],
            revert: true
          }))
        ),
        rest.post(SwitchUrlsInfo.getUntaggedVlansByVenue.url,
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
      await editPortVlans('VLAN-ID-66', '', 'venue')
      fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      // await screen.findByText('Server Error')
    })

    it('should handle untagged vlans by venue correctly', async () => {
      mockServer.use(
        rest.post(SwitchUrlsInfo.getPortSetting.url,
          (_, res, ctx) => res(ctx.json({
            ...portSetting[0],
            revert: true
          }))
        ),
        rest.post(SwitchUrlsInfo.getTaggedVlansByVenue.url,
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
      fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    })
  })

  describe('multiple edit', () => {
    it('should render consistent LLDP data correctly', async () => {
      mockServer.use(
        rest.post(SwitchUrlsInfo.getPortsSetting.url,
          (_, res, ctx) => res(ctx.json({
            ...portsSetting,
            response: [
              portsSetting?.response[1],
              portsSetting?.response[1]
            ]
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

      fireEvent.click(await screen.findByRole('button', { name: 'Close' }))
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

      // Edit Port VLANs
      fireEvent.click(await screen.findByRole('button', { name: 'Edit' }))
      let dialog = await screen.findAllByRole('dialog')
      await screen.findByText('Select Port VLANs')
      const taggedTabPanel = screen.getByRole('tabpanel', { hidden: false })
      fireEvent.click(await within(taggedTabPanel).findByText(/VLAN-ID-6/))

      fireEvent.click(await screen.findByRole('tab', { name: 'Untagged VLANs' }))
      const untaggedTabPanel = screen.getByRole('tabpanel', { hidden: false })
      fireEvent.click(await within(untaggedTabPanel).findByText(/VLAN-ID-2/))

      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => {
        fireEvent.click(await within(dialog[1]).findByRole('button', { name: 'OK' }))
      })

      fireEvent.click(await screen.findByRole('button', { name: 'Use Venue settings' }))
      fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    })
  })

  describe('create/edit LLDP QoS', () => {
    it('should render Edit LLDP Table & Modal correctly', async () => {
      mockServer.use(
        rest.post(SwitchUrlsInfo.getPortSetting.url,
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
        rest.post(SwitchUrlsInfo.getPortSetting.url,
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

      const row = await screen.findByRole('row', { name: /Guest-voice/ })
      fireEvent.click(await within(row).findByRole('radio'))
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => {
        fireEvent.click(await screen.findByRole('button', { name: 'Delete' }) )
      })
      expect(screen.queryByRole('row', { name: /Guest-voice/ })).not.toBeInTheDocument()
    })

    it('should create LLDP correctly', async () => {
      const user = userEvent.setup()
      mockServer.use(
        rest.post(SwitchUrlsInfo.getPortSetting.url,
          (_, res, ctx) => res(ctx.json({
            ...portSetting[1],
            lldpQos: null
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

      await user.click(await screen.findByRole('combobox', { name: 'QoS VLAN Type' }))
      await user.click(await screen.findByText('Tagged'))
      await user.click(await screen.findByRole('combobox', { name: 'VLAN ID' }))
      await user.click(await screen.findByText('VLAN-2'))
      const priorityInput = await within(dialog[1]).findByLabelText('Priority')
      fireEvent.change(priorityInput, { target: { value: '1' } })
      const dscpInput = await within(dialog[1]).findByLabelText(/DSCP/)
      fireEvent.change(dscpInput, { target: { value: '2' } })

      user.click(await within(dialog[1]).findByRole('button', { name: 'Save' }))
      expect(await screen.findAllByRole('row')).toHaveLength(2)
      user.click(await screen.findByRole('button', { name: 'Apply' }))
    })

    // eslint-disable-next-line max-len
    it('should show an error message when creating with duplicate LLDP QoS application type', async () => {
      const user = userEvent.setup()
      mockServer.use(
        rest.post(SwitchUrlsInfo.getPortSetting.url,
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

      // create first
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
    })

    it('should edit LLDP correctly', async () => {
      const user = userEvent.setup()
      mockServer.use(
        rest.post(SwitchUrlsInfo.getPortSetting.url,
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

      const row = await screen.findByRole('row', { name: /Guest-voice/ })
      fireEvent.click(await within(row).findByRole('radio'))
      fireEvent.click(await screen.findByRole('button', { name: 'Edit' }) )

      await screen.findByText(/Edit LLDP QoS/)
      let dialog = await screen.findAllByRole('dialog')
      expect(await within(dialog[1]).findByRole('button', { name: 'Save' })).toBeDisabled()

      await user.click(await screen.findByRole('combobox', { name: 'QoS VLAN Type' }))
      await user.click(await screen.findByText('Untagged'))
      await user.click(await screen.findByRole('combobox', { name: 'QoS VLAN Type' }))
      const priorityTagged = await screen.findAllByText('Priority-tagged')
      await user.click(priorityTagged[2])

      let priorityInput = await within(dialog[1]).findByLabelText('Priority')
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

  describe('Port VLANs', () => {
    it('should render status and vlans correctly (revert=false)', async () => {
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
      await screen.findByText('Port VLANs')
      await screen.findByText('Port level override')
      fireEvent.click(await screen.findByRole('button', { name: 'Use Venue settings' }))
      await screen.findByText('VLAN-ID: 1 (Default VLAN)')
    })

    it('should render status and vlans correctly (revert=true)', async () => {
      mockServer.use(
        rest.post(SwitchUrlsInfo.getPortSetting.url,
          (_, res, ctx) => res(ctx.json({
            ...portSetting[0],
            revert: true
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
      await screen.findByText('Port VLANs')
      await screen.findByText('Default')
      fireEvent.click(await screen.findByRole('button', { name: 'Customize' }))
      await editPortVlans('VLAN-ID-66', '', 'default')
      await screen.findByText('VLAN-ID: 1 (Default VLAN)')
      await screen.findByText('VLAN-ID: 66')
    })

    it('should render status and vlans correctly (multiple edit)', async () => {
      mockServer.use(
        rest.post(SwitchUrlsInfo.getPortsSetting.url,
          (_, res, ctx) => res(ctx.json({
            ...portsSetting,
            response: [
              portsSetting?.response[0],
              portsSetting?.response[1]
            ]
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
      await screen.findByText('Port VLANs')
      expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      expect(await screen.findByTestId('untagged-multi-text')).toBeVisible()

      const checkboxs = await screen.findAllByRole('checkbox')
      // eslint-disable-next-line testing-library/no-unnecessary-act
      act(() => {
        fireEvent.click(checkboxs[0]) // Port VLANs
      })

      expect(await screen.findByText('Edit')).toBeVisible()
      fireEvent.click(await screen.findByRole('button', { name: 'Use Venue settings' }))
      // TODO: check edit port status and VLANs
    })
    // TODO: check other status
  })

})
