import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { switchApi }       from '@acx-ui/rc/services'
import { SwitchUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
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
import { EditPortDrawer } from './editPortDrawer'

const params = {
  venueId: 'venue-id',
  tenantId: 'tenant-id',
  switchId: 'switch-id',
  serialNumber: 'serial-number'
}

const editPortVlans = async (
  inputTagged: string, inputUntagged: string, currentStatus?: string, voiceVlan?: string
) => {
  await userEvent.click(await screen.findByRole('button', {
    name: currentStatus !== 'port' ? 'Customize' : 'Edit'
  }))
  const dialog = await screen.findByTestId('select-port-vlans')

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
    params: { tenantId: 'tenant-id' },
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
    setDrawerVisible.mockClear()
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
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(SwitchUrlsInfo.portsPowerCycle.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })
  afterEach(() => {
    Modal.destroyAll()
  })

  describe('single edit', () => {
    it('should apply edit data correctly', async () => {
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
      await editPortVlans('VLAN-ID-66', 'VLAN-ID-', 'port', 'voiceVlan')

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
        params: { tenantId: 'tenant-id' },
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
          setDrawerVisible={setDrawerVisible}
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
      await userEvent.click(await screen.findByTestId('port-enable-checkbox'))
      await userEvent.click(await screen.findByRole('button', { name: 'Close' }))
      expect(setDrawerVisible).toBeCalledTimes(1)
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

      await userEvent.click(await screen.findByTestId('portVlans-override-checkbox'))
      await userEvent.click(await screen.findByTestId('portEnable-override-checkbox'))

      // Edit Port VLANs
      await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
      const dialog = await screen.findByTestId('select-port-vlans')
      const taggedTabPanel = await screen.findByRole('tabpanel', { hidden: false })
      await userEvent.click(await within(taggedTabPanel).findByText(/VLAN-ID-6/))

      await userEvent.click(await within(dialog).findByRole('tab', { name: 'Untagged VLAN' }))
      const untaggedTabPanel = await screen.findByRole('tabpanel', { hidden: false })
      await userEvent.click(await within(untaggedTabPanel).findByText(/VLAN-ID-2/))

      await userEvent.click(await within(dialog).findByRole('button', { name: 'OK' }))

      await userEvent.click(await screen.findByRole('button', { name: 'Use Venue settings' }))
      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(mockedSavePortsSetting).toHaveBeenLastCalledWith({
        params: { tenantId: 'tenant-id' },
        payload: [{
          switchId: 'c0:c5:20:aa:32:79',
          port: {
            untaggedVlan: '',
            taggedVlans: null,
            voiceVlan: null,
            portEnable: false,
            profileName: undefined,
            revert: true,
            // eslint-disable-next-line max-len
            ignoreFields: 'dhcpSnoopingTrust,egressAcl,ingressAcl,ipsg,lldpEnable,name,poeClass,poeEnable,poePriority,portSpeed,rstpAdminEdgePort,stpBpduGuard,stpRootGuard,lldpQos,tags,poeBudget,portProtected',
            port: '5',
            ports: ['5', '1/1/6']
          }
        }, {
          switchId: '58:fb:96:0e:82:8a',
          port: {
            untaggedVlan: '',
            taggedVlans: null,
            voiceVlan: null,
            portEnable: false,
            profileName: undefined,
            revert: true,
            // eslint-disable-next-line max-len
            ignoreFields: 'dhcpSnoopingTrust,egressAcl,ingressAcl,ipsg,lldpEnable,name,poeClass,poeEnable,poePriority,portSpeed,rstpAdminEdgePort,stpBpduGuard,stpRootGuard,lldpQos,tags,poeBudget,portProtected',
            port: '1/1/5',
            ports: ['1/1/5']
          }
        }]
      })
    })
  })

  describe('LLDP QoS', () => {
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

      await userEvent.click(await screen.findByRole('button', { name: 'Create' }))
      const dialog = await screen.findByTestId('lldp-qos-modal')
      await screen.findByText('Add LLDP QoS')
      await userEvent.click(await within(dialog).findByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(dialog).not.toBeVisible())
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
      await userEvent.click(await within(row).findByRole('radio'))
      await userEvent.click(await screen.findByRole('button', { name: 'Delete' }) )
      expect(screen.queryByRole('row', { name: /Guest-voice/ })).not.toBeInTheDocument()
    })

    it('should create LLDP correctly', async () => {
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

      await userEvent.click(await screen.findByRole('button', { name: 'Create' }))
      const dialog = await screen.findByTestId('lldp-qos-modal')
      await screen.findByText('Add LLDP QoS')

      await userEvent.click(await screen.findByRole('combobox', { name: 'QoS VLAN Type' }))
      await userEvent.click(await screen.findByText('Tagged'))
      await userEvent.click(await screen.findByRole('combobox', { name: 'VLAN ID' }))
      await userEvent.click(await screen.findByText('VLAN-2'))
      const priorityInput = await within(dialog).findByLabelText('Priority')
      fireEvent.change(priorityInput, { target: { value: '1' } })
      const dscpInput = await within(dialog).findByLabelText(/DSCP/)
      fireEvent.change(dscpInput, { target: { value: '2' } })

      await userEvent.click(await within(dialog).findByRole('button', { name: 'Save' }))
      await waitFor(() => expect(dialog).not.toBeVisible())
      expect(await screen.findAllByRole('row')).toHaveLength(2)
    })

    // eslint-disable-next-line max-len
    it('should show an error message when creating with duplicate LLDP QoS application type', async () => {
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
      await userEvent.click(await screen.findByRole('button', { name: 'Create' }))
      const dialog = await screen.findByTestId('lldp-qos-modal')
      await screen.findByText('Add LLDP QoS')

      let priorityInput = await within(dialog).findByLabelText('Priority')
      fireEvent.change(priorityInput, { target: { value: '1' } })
      const dscpInput = await within(dialog).findByLabelText(/DSCP/)
      fireEvent.change(dscpInput, { target: { value: '2' } })
      await userEvent.click(await within(dialog).findByRole('button', { name: 'Save' }))
      await screen.findByText('LLDP QoS Application Type can not duplicate')

      await userEvent.click(await screen.findByRole('combobox', { name: 'Application Type' }))
      await userEvent.click(await screen.findByText('Video-conferencing'))
      await userEvent.click(await within(dialog).findByRole('button', { name: 'Save' }))
      await waitFor(() => expect(dialog).not.toBeVisible())
      expect(await screen.findAllByRole('row')).toHaveLength(3)
    })

    it('should edit LLDP correctly', async () => {
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
      await userEvent.click(await within(row).findByRole('radio'))
      await userEvent.click(await screen.findByRole('button', { name: 'Edit' }) )

      await screen.findByText(/Edit LLDP QoS/)
      const dialog = await screen.findByTestId('lldp-qos-modal')
      expect(await within(dialog).findByRole('button', { name: 'Save' })).toBeDisabled()

      const qosVlanTypeCombobox = await screen.findByRole('combobox', { name: 'QoS VLAN Type' })
      const vlanIdCombobox = await screen.findByRole('combobox', { name: 'VLAN ID' })
      await userEvent.click(qosVlanTypeCombobox)
      await userEvent.click(await screen.findByText('Untagged'))
      await userEvent.click(qosVlanTypeCombobox)
      const priorityTagged = await screen.findAllByText('Priority-tagged')
      await userEvent.click(priorityTagged[1])
      expect(vlanIdCombobox).toBeDisabled()
      expect(vlanIdCombobox).toHaveValue('')

      const priorityInput = await within(dialog).findByLabelText('Priority')
      await fireEvent.change(priorityInput, { target: { value: '3' } })

      expect(await within(dialog).findByRole('button', { name: 'Save' })).not.toBeDisabled()
      await userEvent.click(await within(dialog).findByRole('button', { name: 'Save' }))
      await waitFor(() => expect(dialog).not.toBeVisible())
      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(mockedSavePortsSetting).toHaveBeenLastCalledWith({
        params: { tenantId: 'tenant-id' },
        payload: [{
          switchId: 'c0:c5:20:aa:32:79',
          port: {
            dhcpSnoopingTrust: false,
            ignoreFields: 'egressAcl,ingressAcl',
            ipsg: true,
            lldpEnable: false,
            lldpQos: [{
              applicationType: 'GUEST_VOICE',
              dscp: 0,
              id: '3df095a0926741b5ac2f9f1f09ffccff',
              priority: 3,
              qosVlanType: 'PRIORITY_TAGGED',
              vlanId: ''
            }],
            name: '',
            poeBudget: 1000,
            poeClass: 'ONE',
            poeEnable: true,
            poePriority: 2,
            port: '5',
            portEnable: true,
            portProtected: true,
            portSpeed: 'AUTO',
            ports: ['5'],
            profileName: undefined,
            revert: true,
            rstpAdminEdgePort: true,
            stpBpduGuard: true,
            stpRootGuard: true,
            taggedVlans: null,
            tags: 'aa,bb',
            untaggedVlan: '',
            voiceVlan: null
          }
        }]
      })
    })
  })

  describe('Port VLANs', () => {
    it('should render correctly', async () => {
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
      /**
        Port VLANs
        Port level override

        Untagged VLAN
        VLAN-ID: 1 (Default VLAN)
        Tagged VLAN
        VLAN-ID: 2
      **/
      await screen.findByText('Edit Port')
      await screen.findByText('Port VLANs')
      await screen.findByText('Port level override')
      expect(await screen.findByText('VLAN-ID: 1 (Default VLAN)')).toBeVisible()
      expect(await screen.findByText('VLAN-ID: 2')).toBeVisible()

      await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
      const dialog = await screen.findByTestId('select-port-vlans')
      expect(await screen.findByLabelText('VLAN-ID-1 (Default VLAN)')).toBeChecked()
      await userEvent.click(await within(dialog).findByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(dialog).not.toBeVisible())
    })

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
      /**
        Port VLANs
        Port level override

        Untagged VLAN
        VLAN-ID: 1 (Default VLAN)
        Tagged VLAN
        VLAN-ID: 2
      **/
      await screen.findByText('Edit Port')
      await screen.findByText('Port VLANs')
      await screen.findByText('Port level override')
      expect(await screen.findByText('VLAN-ID: 1 (Default VLAN)')).toBeVisible()
      expect(await screen.findByText('VLAN-ID: 2')).toBeVisible()

      await userEvent.click(await screen.findByRole('button', { name: 'Use Venue settings' }))
      /**
        Port VLANs
        Default

        Untagged VLAN
        VLAN-ID: 1 (Default VLAN)
        Tagged VLAN
        VLAN-ID: --
      **/
      expect(await screen.findByText('Default')).toBeVisible()
      expect(await screen.findByText('VLAN-ID: 1 (Default VLAN)')).toBeVisible()
      expect(screen.queryByText('VLAN-ID: 2')).toBeNull()
      expect(await screen.findByText('--')).toBeVisible()

      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(mockedSavePortsSetting).toHaveBeenLastCalledWith(
        transformSubmitValue({
          ignoreFields: '',
          revert: true,
          taggedVlans: null,
          untaggedVlan: '',
          voiceVlan: null
        })
      )
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

      await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
      /**
        Port VLANs
        Default

        Untagged VLAN
        VLAN-ID: 1 (Default VLAN)
        Tagged VLAN
        VLAN-ID: --
      **/
      await screen.findByText('Edit Port')
      await screen.findByText('Port VLANs')
      await screen.findByText('Default')
      expect(await screen.findByText('VLAN-ID: 1 (Default VLAN)')).toBeVisible()
      expect(await screen.findByText('--')).toBeVisible()

      await userEvent.click(await screen.findByRole('button', { name: 'Customize' }))
      await editPortVlans('VLAN-ID-66', '', 'default')
      /**
        Port VLANs
        Port level override

        Untagged VLAN
        VLAN-ID: 1 (Default VLAN)
        Tagged VLAN
        VLAN-ID: VLAN-ID: 66
      **/
      await screen.findByText('Port level override')
      await screen.findByText('VLAN-ID: 1 (Default VLAN)')
      await screen.findByText('VLAN-ID: 66')

      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(mockedSavePortsSetting).toHaveBeenLastCalledWith(
        transformSubmitValue({
          ignoreFields: '',
          revert: false,
          taggedVlans: ['66'],
          untaggedVlan: 1,
          voiceVlan: null
        })
      )
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
      await waitForElementToBeRemoved(await screen.findByRole('img', { name: 'loader' }))
      /**
        Port VLANs

        Untagged VLAN
        Multiple values
        Tagged VLAN
        Multiple values
      **/
      await screen.findByText('Edit Port')
      await screen.findByText('Port VLANs')
      expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      expect(await screen.findByTestId('tagged-multi-text')).toBeVisible()
      expect(await screen.findByTestId('untagged-multi-text')).toBeVisible()

      await userEvent.click(await screen.findByTestId('portVlans-override-checkbox'))

      expect(await screen.findByText('Edit')).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'Use Venue settings' }))

      expect(await screen.findByText('Applied at venue')).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(mockedSavePortsSetting).toHaveBeenLastCalledWith({
        params: { tenantId: 'tenant-id' },
        payload: [{
          switchId: 'c0:c5:20:aa:32:79',
          port: {
            untaggedVlan: '',
            taggedVlans: null,
            voiceVlan: null,
            profileName: undefined,
            revert: true,
            // eslint-disable-next-line max-len
            ignoreFields: 'dhcpSnoopingTrust,egressAcl,ingressAcl,ipsg,lldpEnable,name,poeClass,poeEnable,poePriority,portEnable,portSpeed,rstpAdminEdgePort,stpBpduGuard,stpRootGuard,lldpQos,tags,poeBudget,portProtected',
            port: '5',
            ports: ['5', '1/1/6']
          }
        }, {
          switchId: '58:fb:96:0e:82:8a',
          port: {
            untaggedVlan: '',
            taggedVlans: null,
            voiceVlan: null,
            profileName: undefined,
            revert: true,
            // eslint-disable-next-line max-len
            ignoreFields: 'dhcpSnoopingTrust,egressAcl,ingressAcl,ipsg,lldpEnable,name,poeClass,poeEnable,poePriority,portEnable,portSpeed,rstpAdminEdgePort,stpBpduGuard,stpRootGuard,lldpQos,tags,poeBudget,portProtected',
            port: '1/1/5',
            ports: ['1/1/5']
          }
        }]
      })
    })

    // TODO: check other status
  })

})
