import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import { switchApi }                          from '@acx-ui/rc/services'
import { SwitchUrlsInfo, SwitchRbacUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                    from '@acx-ui/store'
import {
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
  portSetting,
  portsSetting,
  vlansByVenue,
  singleVlansByVenue
} from './__tests__/fixtures'
import {
  EditPortDrawer
} from './editPortDrawer'

const params = {
  venueId: 'venue-id',
  tenantId: 'tenant-id',
  switchId: 'switch-id',
  serialNumber: 'serial-number'
}

const editPortVlans = async (
  inputTagged: string, inputUntagged: string,
  currentStatus?: string, voiceVlan?: string, checkPortsModel?:boolean
) => {
  await userEvent.click(await screen.findByRole('button', {
    name: currentStatus !== 'port' ? 'Customize' : 'Edit'
  }))
  const dialog = await screen.findByTestId('select-port-vlans')

  if (checkPortsModel) {
    await userEvent.click(await within(dialog).findByRole('button', { name: /Add VLAN/i }))
    const dialogs = await screen.findAllByRole('dialog')
    const drawer = dialogs[2]
    expect(await within(drawer).findByText(/Add Model/i)).toBeVisible()
    expect(within(drawer).queryByText(/Add Ports/i)).toBeNull()
    await userEvent.click(await within(drawer).findByRole('button', { name: /Cancel/i }))
  }

  if (inputTagged) {
    await userEvent.click(await within(dialog).findByRole('tab', { name: 'Tagged VLANs' }))
    const taggedTabPanel = await within(dialog).findByRole('tabpanel', { hidden: false })
    const taggedInput = await within(taggedTabPanel).findByTestId('tagged-input')
    fireEvent.change(taggedInput, { target: { value: inputTagged } })
    expect(within(taggedTabPanel).queryByText(/VLAN-ID-55/)).not.toBeInTheDocument()
    await userEvent.click(await within(taggedTabPanel).findByText(inputTagged, { exact: true }))
    if (voiceVlan) {
      await userEvent.click(await within(taggedTabPanel).findByRole('switch'))
    }
  }

  if (inputUntagged) {
    await userEvent.click(await screen.findByRole('tab', { name: 'Untagged VLAN' }))
    const untaggedTabPanel = await within(dialog).findByRole('tabpanel', { hidden: false })
    const untaggedInput = await within(untaggedTabPanel).findByTestId('untagged-input')
    fireEvent.change(untaggedInput, { target: { value: inputUntagged } })
    await userEvent.click(await within(untaggedTabPanel).findByText(/VLAN-ID-22/))
  }
  await userEvent.click(await within(dialog).findByRole('button', { name: 'OK' }))
}

const mockedSavePortsSetting = jest.fn().mockImplementation(() => ({
  unwrap: jest.fn()
}))
const mockedCyclePoe = jest.fn().mockImplementation(() => ({
  unwrap: jest.fn()
}))
const mockedAddSwitchVlan = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useSavePortsSettingMutation: () => [
    mockedSavePortsSetting, { reset: jest.fn() }
  ],
  useCyclePoeMutation: () => [
    mockedCyclePoe, { reset: jest.fn() }
  ]
}))

const setDrawerVisible = jest.fn()
const initPortValue = {
  name: '',
  profileName: undefined,
  portEnable: false,
  poeEnable: true,
  poeClass: 'ZERO',
  poePriority: 3,
  poeBudget: '',
  portProtected: false,
  lldpEnable: false,
  portSpeed: 'TEN_M_FULL',
  rstpAdminEdgePort: false,
  stpBpduGuard: false,
  stpRootGuard: false,
  dhcpSnoopingTrust: false,
  ipsg: false,
  lldpQos: [],
  ingressAcl: '',
  egressAcl: '',
  tags: '',
  revert: false,
  ignoreFields: 'untaggedVlan,taggedVlans,voiceVlan',
  port: '5',
  ports: ['5']
}

const transformSubmitValue = (updateValue?: object) => {
  return {
    enableRbac: false,
    option: { skip: false },
    params: {
      tenantId: 'tenant-id',
      venueId: 'a98653366d2240b9ae370e48fab3a9a1'
    },
    payload: [{
      switchId: 'c0:c5:20:aa:32:79',
      port: {
        ...initPortValue,
        ...updateValue
      }
    }]
  }
}

describe('EditPortDrawer', () => {
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockedSavePortsSetting.mockClear()
    mockedCyclePoe.mockClear()
    mockedAddSwitchVlan.mockClear()
    setDrawerVisible.mockClear()
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(switchDetailHeader))
      ),
      rest.get(SwitchUrlsInfo.getSwitch.url,
        (_, res, ctx) => res(ctx.json({ id: 'c0:c5:20:aa:32:79' }))
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
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post(SwitchUrlsInfo.portsPowerCycle.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post(SwitchRbacUrlsInfo.addSwitchesVlans.url,
        (_, res, ctx) => {
          mockedAddSwitchVlan()
          return res(ctx.json({}))
        }
      )
    )
  })
  afterEach(() => {
    Modal.destroyAll()
  })

  describe('single edit', () => {
    it('should apply edit data correctly', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
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

      await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
      await screen.findByText('Edit Port')
      await screen.findByText('Selected Port')

      const poeClassCombobox = await screen.findByRole('combobox', { name: /PoE Class/ })
      expect(poeClassCombobox).not.toBeDisabled()
      await userEvent.click(poeClassCombobox)
      await userEvent.click(await screen.findByText('Negotiate'))
      const budgetInput = await screen.findByTestId('poe-budget-input')
      expect(budgetInput).not.toBeDisabled()

      fireEvent.change(budgetInput, { target: { value: '1000' } })
      expect(poeClassCombobox).toBeDisabled()
      await userEvent.click(await screen.findByTestId('ipsg-checkbox'))

      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(mockedSavePortsSetting).toHaveBeenLastCalledWith(
        transformSubmitValue({
          ipsg: true,
          poeBudget: '1000',
          poeClass: 'UNSET'
        })
      )
    })

    it('should cycle PoE correctly', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_CYCLE_POE)
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

      await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
      await screen.findByText('Edit Port')
      await screen.findByText('Selected Port')

      const poeEnableButton = await screen.findAllByTestId('poeEnable')
      expect(poeEnableButton[0]).toBeChecked()

      await userEvent.click(await screen.findByRole('button', { name: 'Cycle PoE' }))
      expect(mockedCyclePoe).toHaveBeenCalled()
    })

    it('should customized VLAN correctly', async () => {
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
      await screen.findByText('Port level override')

      await userEvent.click(await screen.findByRole('combobox', { name: /PoE Class/ }))
      await userEvent.click(await screen.findByText('2 (802.3af 7.0 W)'))
      expect(await screen.findByTestId('poe-budget-input')).toBeDisabled()
      await editPortVlans('VLAN-ID-66', 'VLAN-ID-', 'port', 'voiceVlan', true)

      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(mockedSavePortsSetting).toHaveBeenLastCalledWith(
        transformSubmitValue({
          ignoreFields: '',
          ipsg: false,
          poeBudget: '',
          poeClass: 'TWO',
          taggedVlans: ['66'],
          untaggedVlan: 22,
          voiceVlan: 66
        })
      )
    })

    it('should close Drawer correctly', async () => {
      render(<Provider>
        <EditPortDrawer
          visible={true}
          setDrawerVisible={setDrawerVisible}
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
      await userEvent.click(await screen.findByRole('button', { name: 'Use Venue settings' }))
      await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
      expect(setDrawerVisible).toBeCalledTimes(1)
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
      await userEvent.click(await screen.findByRole('button', { name: 'Back' }))
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

      await screen.findByText('Port VLANs')
      expect(await screen.findByText('Default')).toBeVisible()
      expect(await screen.findByText('VLAN-ID: 1 (Default VLAN)')).toBeVisible()
      expect(await screen.findByText('--')).toBeVisible()

      await editPortVlans('VLAN-ID-66', 'VLAN-ID-')
      expect(await screen.findByText('Port level override')).toBeVisible()
      expect(await screen.findByText('VLAN-ID: 66')).toBeVisible()
      expect(await screen.findByText('VLAN-ID: 22')).toBeVisible()
      expect(await screen.findByTestId('voice-vlan')).toHaveTextContent('Set as Voice VLAN: No')

      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      await screen.findByText('Modify Uplink Port?')
      const dialogs = await screen.findAllByRole('dialog')
      expect(dialogs).toHaveLength(2)

      const dialog = dialogs[1]
      await userEvent.click(await within(dialog).findByRole('button', { name: 'Apply Changes' }))
      await waitFor(() => expect(dialog).not.toBeVisible())
      expect(mockedSavePortsSetting).toHaveBeenLastCalledWith(
        transformSubmitValue({
          ignoreFields: '',
          poeClass: 'ZERO',
          poeEnable: false,
          taggedVlans: ['66'],
          untaggedVlan: 22,
          voiceVlan: null
        })
      )
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
        rest.get(SwitchUrlsInfo.getVlansByVenue.url,
          (_, res, ctx) => res(ctx.json(singleVlansByVenue))
        )
      )
      render(<Provider>
        <EditPortDrawer
          visible={true}
          setDrawerVisible={jest.fn()}
          isCloudPort={false}
          isMultipleEdit={selectedPorts?.slice(1, 2)?.length > 1}
          isVenueLevel={false}
          selectedPorts={selectedPorts?.slice(1,2)}
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
      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(mockedSavePortsSetting).toHaveBeenLastCalledWith({
        enableRbac: false,
        option: { skip: false },
        params: {
          tenantId: 'tenant-id',
          venueId: 'a98653366d2240b9ae370e48fab3a9a1'
        },
        payload: [{
          switchId: '58:fb:96:0e:82:8a',
          port: {
            ...initPortValue,
            ignoreFields: '',
            ipsg: false,
            poeBudget: '',
            poeClass: 'ZERO',
            port: '1/1/5',
            ports: ['1/1/5'],
            taggedVlans: ['66'],
            untaggedVlan: 21,
            voiceVlan: null
          }
        }]
      })
    })

    it('should handle untagged vlans by venue correctly', async () => {
      mockServer.use(
        rest.post(SwitchUrlsInfo.getPortSetting.url,
          (_, res, ctx) => res(ctx.json({
            ...portSetting[0],
            revert: true
          }))
        ),
        rest.get(SwitchUrlsInfo.getVlansByVenue.url,
          (_, res, ctx) => res(ctx.json(singleVlansByVenue))
        )
      )
      render(<Provider>
        <EditPortDrawer
          visible={true}
          setDrawerVisible={setDrawerVisible}
          isCloudPort={false}
          isMultipleEdit={selectedPorts?.slice(1, 2)?.length > 1}
          isVenueLevel={false}
          selectedPorts={selectedPorts?.slice(1, 2)}
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
      await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
      expect(setDrawerVisible).toBeCalledTimes(1)
    })

    it('should support switch level vlan correctly', async () => {
      mockServer.use(
        rest.post(SwitchUrlsInfo.getDefaultVlan.url,
          (_, res, ctx) => res(ctx.json(defaultVlan.slice(2, 3)))
        )
      )
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_LEVEL_VLAN)
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

      await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
      await screen.findByText('Edit Port')
      await screen.findByText('Selected Port')

      // Edit Port VLANs - switch vlan
      await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
      const dialog = await screen.findByTestId('select-port-vlans')
      await userEvent.click(await within(dialog).findByRole('button', { name: /Add VLAN/i }))

      const dialogs = await screen.findAllByRole('dialog')
      const drawer = dialogs[2]
      expect(within(drawer).queryByText(/Add Ports/i)).toBeNull()
      expect(within(drawer).queryByText(/Add Model/i)).toBeNull()
      await userEvent.type(await within(drawer).findByLabelText('VLAN ID'), '777')
      await userEvent.type(await within(drawer).findByLabelText('VLAN Name'), 'vlan777')

      await userEvent.click(await within(drawer).findByRole('button', { name: 'Add' }))
      expect(mockedAddSwitchVlan).toBeCalled()
      expect(await within(dialog).findByText(/VLAN-ID-777 \(vlan777\)/)).toBeVisible()
    })
  })

})
