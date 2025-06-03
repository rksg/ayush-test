import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { Modal } from 'antd'
import _         from 'lodash'
import { rest }  from 'msw'

import { useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { switchApi }                          from '@acx-ui/rc/services'
import { allMultipleEditableFields }          from '@acx-ui/rc/switch/utils'
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
  vlansByVenue
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

  describe('multiple edit', () => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
    })
    it('should render consistent LLDP data correctly', async () => {
      mockServer.use(
        rest.post(SwitchUrlsInfo.getDefaultVlan.url,
          (_, res, ctx) => res(ctx.json(defaultVlan.slice(0, 2)))
        ),
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
          (_, res, ctx) => res(ctx.json(defaultVlan.slice(0, 2)))
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

      const untaggedTabPanel = await screen.findByRole('tabpanel', { hidden: false })
      await userEvent.click(await within(untaggedTabPanel).findByText(/VLAN-ID-2/))

      await userEvent.click(await screen.findByText('Tagged VLAN'))
      const taggedTabPanel = await screen.findByRole('tabpanel', { hidden: false })
      await userEvent.click(await within(taggedTabPanel).findByText(/VLAN-ID-6/))

      await userEvent.click(await within(dialog).findByRole('button', { name: 'OK' }))

      await userEvent.click(await screen.findByRole('button', { name: 'Use Venue settings' }))
      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(mockedSavePortsSetting).toHaveBeenLastCalledWith({
        enableRbac: false,
        option: { skip: false },
        params: {
          tenantId: 'tenant-id',
          venueId: 'a98653366d2240b9ae370e48fab3a9a1'
        },
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
            ignoreFields: _.difference(allMultipleEditableFields, ['portEnable', 'taggedVlans','untaggedVlan','voiceVlan']).toString(),
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
            ignoreFields: _.difference(allMultipleEditableFields, ['portEnable','taggedVlans','untaggedVlan','voiceVlan']).toString(),
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
        enableRbac: false,
        option: { skip: false },
        params: {
          tenantId: 'tenant-id',
          venueId: 'a98653366d2240b9ae370e48fab3a9a1'
        },
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
        rest.post(SwitchUrlsInfo.getDefaultVlan.url,
          (_, res, ctx) => res(ctx.json(defaultVlan.slice(0, 2)))
        ),
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
        enableRbac: false,
        option: { skip: false },
        params: {
          tenantId: 'tenant-id',
          venueId: 'a98653366d2240b9ae370e48fab3a9a1'
        },
        payload: [{
          switchId: 'c0:c5:20:aa:32:79',
          port: {
            untaggedVlan: '',
            taggedVlans: null,
            voiceVlan: null,
            profileName: undefined,
            revert: true,
            // eslint-disable-next-line max-len
            ignoreFields: _.difference(allMultipleEditableFields, ['taggedVlans','untaggedVlan','voiceVlan']).toString(),
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
            ignoreFields: _.difference(allMultipleEditableFields, ['taggedVlans','untaggedVlan','voiceVlan']).toString(),
            port: '1/1/5',
            ports: ['1/1/5']
          }
        }]
      })
    })

    // TODO: check other status
  })

})
