import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                                   from '@acx-ui/feature-toggle'
import { switchApi }                                                                from '@acx-ui/rc/services'
import { SwitchUrlsInfo, SwitchRbacUrlsInfo, SwitchRow, allMultipleEditableFields } from '@acx-ui/rc/utils'
import { Provider, store }                                                          from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  aclUnion,
  defaultVlan,
  flexAuthList,
  selectedPorts,
  switchDetailHeader,
  switchProfile,
  switchRoutedList,
  portSetting,
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

const getProfile = (data) => {
  const { id, profileName, ...rest } = data
  return rest
}

const getIgnoreFields = (fields: string[], excludedFields: Set<string>) => {
  return fields.filter(field => !excludedFields.has(field))
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
      rest.get(SwitchUrlsInfo.getVlansByVenue.url,
        (_, res, ctx) => res(ctx.json(vlansByVenue))
      ),
      rest.get(SwitchUrlsInfo.getSwitchConfigurationProfileByVenue.url,
        (_, res, ctx) => res(ctx.json(switchProfile))
      ),
      rest.post(SwitchUrlsInfo.getVenueRoutedList.url,
        (_, res, ctx) => res(ctx.json({}))
      )
    )
  })
  // afterEach(() => {
  //   Modal.destroyAll()
  // })

  /* eslint-disable max-len */
  describe('Flexible Authentication (base on Switch RBAC FF enabled)', () => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_RBAC_API)
      mockServer.use(
        rest.get(SwitchRbacUrlsInfo.getSwitchDetailHeader.url,
          (_, res, ctx) => res(ctx.json(switchDetailHeader))
        ),
        rest.get(SwitchRbacUrlsInfo.getSwitch.url,
          (_, res, ctx) => res(ctx.json({ id: 'c0:c5:20:aa:32:79' }))
        ),
        rest.post(SwitchRbacUrlsInfo.getDefaultVlan.url,
          (_, res, ctx) => res(ctx.json(defaultVlan.slice(0, 1)))
        ),
        rest.get(SwitchRbacUrlsInfo.getAclUnion.url,
          (_, res, ctx) => res(ctx.json(aclUnion))
        ),
        rest.post(SwitchRbacUrlsInfo.getSwitchRoutedList.url,
          (_, res, ctx) => res(ctx.json(switchRoutedList))
        ),
        rest.post(SwitchRbacUrlsInfo.getPortSetting.url,
          (_, res, ctx) => res(ctx.json(portSetting.map(p => {
            return {
              ...p,
              ipsg: false
            }
          })))
        ),
        rest.post(SwitchRbacUrlsInfo.getSwitchList.url,
          (_, res, ctx) => res(ctx.json({ data: [] }))
        ),
        rest.post(
          SwitchUrlsInfo.getFlexAuthenticationProfiles.url,
          (req, res, ctx) => res(ctx.json(flexAuthList))
        )
      )
    })

    describe('FF enabled', () => {
      beforeEach(() => {
        jest.mocked(useIsSplitOn).mockImplementation(
          ff => ff === Features.SWITCH_RBAC_API || ff === Features.SWITCH_FLEXIBLE_AUTHENTICATION
        )
      })

      describe('Multiple edit', () => {
        const switchList = [{
          id: 'c0:c5:20:aa:32:79',
          firmware: 'SPR10010f_b467'
        }, {
          id: '58:fb:96:0e:82:8a',
          firmware: 'SPR10010f_b467'
        }] as SwitchRow[]

        beforeEach(() => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getDefaultVlan.url,
              (_, res, ctx) => res(ctx.json(defaultVlan))
            )
          )
        })

        it('should render correctly when either of the selected ports is uplink port', async () => {
          const profile01 = getProfile(flexAuthList.data[0])
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                flexibleAuthenticationEnabled: true,
                authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
                authenticationCustomize: false,
                ...profile01
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                flexibleAuthenticationEnabled: true,
                authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
                authenticationCustomize: false,
                ...profile01
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={true}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeDisabled()
          expect(await screen.findByText('Customize')).toBeVisible()

          await userEvent.hover(await screen.findByTestId('flex-enable-switch'))
          expect(await screen.findByRole('tooltip', { hidden: false }))
            .toHaveTextContent(/Authentication cannot be enabled on the uplink port/)
        })

        it('should render correctly when either of the selected ports has IPSG enabled', async () => {
          const profile01 = getProfile(flexAuthList.data[0])
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                flexibleAuthenticationEnabled: true,
                authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
                authenticationCustomize: false,
                ...profile01
              }, {
                ...portSetting[2]
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={true}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          const flexAuthOverrideCheckbox
            = await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')
          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(flexAuthOverrideCheckbox).toBeVisible()
          expect(flexAuthOverrideCheckbox).toBeDisabled()
          expect(screen.queryAllByText(/Multiple values/)).toHaveLength(17)
        })

        it('should render correctly when either of the selected switch firmware versions is below 10.0.10f', async () => {
          const profile01 = getProfile(flexAuthList.data[0])
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                flexibleAuthenticationEnabled: true,
                authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
                authenticationCustomize: false,
                ...profile01
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                flexibleAuthenticationEnabled: true,
                authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
                authenticationCustomize: false,
                ...profile01
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={[{
                id: 'c0:c5:20:aa:32:79',
                firmware: 'SPS09010j_cd3'
              }, {
                id: '58:fb:96:0e:82:8a',
                firmware: 'SPR10010f_b467'
              }] as SwitchRow[]}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          // expect(screen.queryAllByText(/Multiple values/)).toHaveLength(16)

          await userEvent.click(
            await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')
          )
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeDisabled()

          await userEvent.hover(await screen.findByTestId('flex-enable-switch'))
          expect(await screen.findByRole('tooltip', { hidden: false }))
            .toHaveTextContent(/The firmware version on the selected switches must be FI 10.0.10f or higher/)
        })

        it('should render correctly when either of the selected ports is an untagged port', async () => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '3',
                flexibleAuthenticationEnabled: false,
                authenticationCustomize: false
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '3',
                flexibleAuthenticationEnabled: false,
                authenticationCustomize: false
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeDisabled()

          await userEvent.hover(await screen.findByTestId('flex-enable-switch'))
          expect(await screen.findByRole('tooltip', { hidden: false }))
            .toHaveTextContent(/This port is Untagged port/)
        })

        it('should render correctly when the auth profile is applied', async () => {
          const profile01 = getProfile(flexAuthList.data[0])
          const profile03 = getProfile(flexAuthList.data[2])
          const authFields = Object.keys(profile03)

          const excludedFields = new Set([
            'authenticationProfileId',
            'flexibleAuthenticationEnabled',
            'authenticationCustomize',
            'changeAuthOrder',
            ...authFields
          ])
          const ignoreFields = getIgnoreFields(allMultipleEditableFields, excludedFields)

          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                flexibleAuthenticationEnabled: true,
                authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
                authenticationCustomize: false,
                ...profile01
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '2',
                flexibleAuthenticationEnabled: true,
                authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
                authenticationCustomize: false,
                ...profile01
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()
          expect(await screen.findByText('Customize')).toBeVisible()

          const profileCombobox = await screen.findByRole('combobox', { name: /Profile/ })
          expect(profileCombobox).toBeDisabled()

          await userEvent.click(
            await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')
          )
          await userEvent.click(
            await screen.findByTestId('authenticationProfileId-override-checkbox')
          )

          expect(await screen.findByTestId('flex-enable-switch')).not.toBeDisabled()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()
          expect(profileCombobox).not.toBeDisabled()

          await userEvent.click(profileCombobox)
          await userEvent.click(await screen.findByText('Profile03--auth10-r3-c4-g99'))

          await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
          expect(mockedSavePortsSetting).toHaveBeenLastCalledWith({
            enableRbac: true,
            option: { skip: false },
            params: {
              tenantId: 'tenant-id',
              venueId: 'a98653366d2240b9ae370e48fab3a9a1'
            },
            payload: [{
              switchId: 'c0:c5:20:aa:32:79',
              ignoreFields: ignoreFields.concat(['revert']).toString(),
              port: '5',
              ports: ['5'],
              authenticationProfileId: 'dccf7d0272024d3ca03bcf5b48497685',
              flexibleAuthenticationEnabled: true,
              authenticationCustomize: false,
              changeAuthOrder: false,
              ...profile03
            }, {
              switchId: '58:fb:96:0e:82:8a',
              ignoreFields: ignoreFields.concat(['revert']).toString(),
              port: '1/1/5',
              ports: ['1/1/5'],
              authenticationProfileId: 'dccf7d0272024d3ca03bcf5b48497685',
              flexibleAuthenticationEnabled: true,
              authenticationCustomize: false,
              changeAuthOrder: false,
              ...profile03
            }]
          })
        })

        it.skip('should set Auth Default Vlan as Switch Level Auth Default Vlan when the port control is set to "Force Unauthorized" or "Force Authorized" and all switches have the same Switch Level Auth Default Vlan', async () => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                flexibleAuthenticationEnabled: false,
                authenticationCustomize: false,
                switchLevelAuthDefaultVlan: 4
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '2',
                flexibleAuthenticationEnabled: false,
                authenticationCustomize: false,
                switchLevelAuthDefaultVlan: 4
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).not.toBeChecked()

          await userEvent.click(
            await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')
          )
          await userEvent.click(await screen.findByTestId('flex-enable-switch'))

          expect(await screen.findByText('Customize')).toBeVisible()
          await userEvent.click(await screen.findByText('Customize'))

          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()
          expect(await screen.findByText('Use Profile Settings')).toBeVisible()
          expect(await screen.findByTestId('authDefaultVlan-override-checkbox')).toBeChecked() //checked by default

          const portControlCombobox = await screen.findByRole('combobox', { name: /Port Control/ })
          await userEvent.click(portControlCombobox)
          await userEvent.click(await screen.findByText('Force Unauthorized'))

          expect(await screen.findByTestId('authDefaultVlan-override-checkbox')).toBeDisabled()
          expect(await screen.findByLabelText(/Auth Default VLAN/)).toBeDisabled()
          expect(await screen.findByLabelText(/Auth Default VLAN/)).toHaveValue('4') // switch auth default vlan
        })

        it.skip('should handle field changes correctly', async () => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                flexibleAuthenticationEnabled: false,
                authenticationCustomize: false,
                switchLevelAuthDefaultVlan: 3
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '2',
                flexibleAuthenticationEnabled: false,
                authenticationCustomize: false,
                switchLevelAuthDefaultVlan: 4
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).not.toBeChecked()

          await userEvent.click(
            await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')
          )
          await userEvent.click(await screen.findByTestId('flex-enable-switch'))

          expect(await screen.findByText('Customize')).toBeVisible()
          await userEvent.click(await screen.findByText('Customize'))

          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()
          expect(await screen.findByText('Use Profile Settings')).toBeVisible()
          expect(await screen.findByTestId('authDefaultVlan-override-checkbox')).toBeChecked() //checked by default

          const portControlCombobox = await screen.findByRole('combobox', { name: /Port Control/ })
          const typeCombobox = await screen.findByRole('combobox', { name: 'Type' })
          expect(portControlCombobox).not.toBeDisabled()
          expect(typeCombobox).not.toBeDisabled()

          await userEvent.click(portControlCombobox)
          await userEvent.click(await screen.findByText('Force Authorized'))

          const authDefaultVlanOverride = await screen.findByTestId('authDefaultVlan-override-checkbox')
          const authFailActionOverride = await screen.findByTestId('authFailAction-override-checkbox')
          const restrictedVlanOverride = await screen.findByTestId('restrictedVlan-override-checkbox')
          const dot1xPortControlOverride = await screen.findByTestId('dot1xPortControl-override-checkbox')

          expect(authDefaultVlanOverride).toBeChecked()
          expect(authDefaultVlanOverride).toBeDisabled()
          expect(await screen.findByLabelText(/Auth Default VLAN/)).toHaveValue('') // has different switch auth default vlan
          expect(authFailActionOverride).toBeChecked()
          expect(authFailActionOverride).toBeDisabled()
          expect(restrictedVlanOverride).toBeChecked()
          expect(restrictedVlanOverride).toBeDisabled()

          await userEvent.click(typeCombobox)
          await userEvent.click(await screen.findByText(/802.1x and MAC-AUTH/))

          expect(await screen.findByTestId('changeAuthOrder-override-checkbox')).not.toBeDisabled()
          expect(dot1xPortControlOverride).toBeChecked()
          expect(dot1xPortControlOverride).toBeDisabled()
        })

        it('should handle untagged vlan changes correctly', async () => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['3'],
                untaggedVlan: '1', //defaultVlan = 1
                flexibleAuthenticationEnabled: false,
                authenticationCustomize: false
              }, {
                ...portSetting[2],
                taggedVlans: ['3'],
                untaggedVlan: '2', //defaultVlan = 2
                flexibleAuthenticationEnabled: false,
                authenticationCustomize: false
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')).not.toBeDisabled()
          await userEvent.click(await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox'))
          expect(await screen.findByTestId('flex-enable-switch')).not.toBeChecked()

          // Edit Port VLANs
          // enable override portVlans
          await userEvent.click(await screen.findByTestId('portVlans-override-checkbox'))
          await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
          const dialog = await screen.findByTestId('select-port-vlans')

          const untaggedTabPanel = await screen.findByRole('tabpanel', { hidden: false })
          await userEvent.click(await within(untaggedTabPanel).findByText(/VLAN-ID-5/))
          await userEvent.click(await within(dialog).findByRole('button', { name: 'OK' }))

          expect(await screen.findByText(/VLAN-ID: 5/)).toBeVisible()
          // port is untagged port, so disable the flex auth setting automatically
          expect(await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')).toBeDisabled()
          expect(await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')).toBeChecked()

          // disable override portVlans
          await userEvent.click(await screen.findByTestId('portVlans-override-checkbox'))
          expect(await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')).not.toBeDisabled()
        })

        it('should disable the Untagged tab correctly when flex auth enabled', async () => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['3'],
                untaggedVlan: '1', //defaultVlan = 1
                flexibleAuthenticationEnabled: false,
                authenticationCustomize: false
              }, {
                ...portSetting[2],
                taggedVlans: ['3'],
                untaggedVlan: '2', //defaultVlan = 2
                flexibleAuthenticationEnabled: false,
                authenticationCustomize: false
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')).not.toBeDisabled()
          await userEvent.click(await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox'))
          await userEvent.click(await screen.findByTestId('flex-enable-switch'))

          await userEvent.click(await screen.findByTestId('portVlans-override-checkbox'))
          await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
          const dialog = await screen.findByTestId('select-port-vlans')

          const untaggedTab = await within(dialog).findByRole('tab', { name: /Untagged VLAN/ })
          const taggedTab = await within(dialog).findByRole('tab', { name: /Tagged VLAN/ })
          expect(untaggedTab.getAttribute('aria-disabled')).toBeTruthy()
          expect(taggedTab.getAttribute('aria-disabled')).not.toBeTruthy()
          expect(taggedTab.getAttribute('aria-selected')).toBeTruthy()
        })

        it('should validate guest vlan correctly', async () => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                flexibleAuthenticationEnabled: false,
                authenticationCustomize: false,
                switchLevelAuthDefaultVlan: 3
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '2',
                flexibleAuthenticationEnabled: false,
                authenticationCustomize: false,
                switchLevelAuthDefaultVlan: 4
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).not.toBeChecked()

          await userEvent.click(
            await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')
          )
          await userEvent.click(await screen.findByTestId('flex-enable-switch'))

          expect(await screen.findByText('Customize')).toBeVisible()
          await userEvent.click(await screen.findByText('Customize'))

          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()
          expect(await screen.findByText('Use Profile Settings')).toBeVisible()
          expect(await screen.findByTestId('authDefaultVlan-override-checkbox')).toBeChecked() //checked by default

          await userEvent.click(
            await screen.findByTestId('guestVlan-override-checkbox')
          )

          await userEvent.type(await screen.findByLabelText(/Auth Default VLAN/), '5')

          const guestVlanInput = await screen.findByLabelText('Guest VLAN')
          await userEvent.type(guestVlanInput, '1')
          expect(await screen.findByText('VLAN ID can not be the same as Default VLAN')).toBeVisible()

          await userEvent.clear(guestVlanInput)
          await userEvent.type(guestVlanInput, '3')
          expect(await screen.findByText('VLAN ID can not be the same as Switch Level Auth Default VLAN')).toBeVisible()

          await userEvent.clear(guestVlanInput)
          await userEvent.type(guestVlanInput, '5')
          expect(await screen.findByText('VLAN ID can not be the same as Auth Default VLAN')).toBeVisible()
        })

        it('should validate VLANs correctly when the Auth Default VLAN has multiple values', async () => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: true,
                authDefaultVlan: 7,
                switchLevelAuthDefaultVlan: 3,
                authFailAction: 'restricted_vlan',
                restrictedVlan: 5,
                authTimeoutAction: 'critical_vlan',
                criticalVlan: 5
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '2',
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: true,
                authDefaultVlan: 8,
                switchLevelAuthDefaultVlan: 4,
                authFailAction: 'restricted_vlan',
                restrictedVlan: 5,
                authTimeoutAction: 'critical_vlan',
                criticalVlan: 5
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()
          expect(await screen.findByText('Use Profile Settings')).toBeVisible()

          await userEvent.click(
            await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')
          )

          expect(await screen.findByTestId('authDefaultVlan-override-checkbox')).not.toBeChecked()
          await userEvent.click(
            await screen.findByTestId('restrictedVlan-override-checkbox')
          )
          await userEvent.click(
            await screen.findByTestId('criticalVlan-override-checkbox')
          )
          await userEvent.click(
            await screen.findByTestId('guestVlan-override-checkbox')
          )

          await userEvent.type(await screen.findByLabelText('Restricted VLAN'), '9')
          await userEvent.type(await screen.findByLabelText('Critical VLAN'), '9')

          const guestVlanInput = await screen.findByLabelText('Guest VLAN')
          await userEvent.type(guestVlanInput, '1')
          expect(await screen.findByText('VLAN ID can not be the same as Default VLAN')).toBeVisible()

          await userEvent.clear(guestVlanInput)
          await userEvent.type(guestVlanInput, '3')
          expect(await screen.findByText('VLAN ID can not be the same as Switch Level Auth Default VLAN')).toBeVisible()

          await userEvent.clear(guestVlanInput)
          await userEvent.type(guestVlanInput, '7')
          expect(await screen.findByText('VLAN ID can not be the same as Auth Default VLAN')).toBeVisible()
        })

        it('should validate VLANs correctly when the guest vlan is inconsistent', async () => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: true,
                authDefaultVlan: 7,
                switchLevelAuthDefaultVlan: 3,
                guestVlan: 99,
                enableAuthPorts: ['1/1/9']
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '2',
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: true,
                authDefaultVlan: 8,
                switchLevelAuthDefaultVlan: 4
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()
          expect(await screen.findByText('Use Profile Settings')).toBeVisible()

          await userEvent.click(
            await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')
          )

          expect(await screen.findByTestId('authDefaultVlan-override-checkbox')).not.toBeChecked()
          await userEvent.click(
            await screen.findByTestId('guestVlan-override-checkbox')
          )

          const guestVlanInput = await screen.findByLabelText('Guest VLAN')
          await userEvent.type(guestVlanInput, '9')
          expect(await screen.findByText(/Guest VLAN is already defined previously and needs to be consistent across all the ports/)).toBeVisible()
        })

        it('should not apply different profile auth default vlan', async () => {
          const profile01 = getProfile(flexAuthList.data[0])
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                enableAuthPorts: ['1/1/9'],
                authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: false,
                profileAuthDefaultVlan: profile01.authDefaultVlan,
                ...profile01
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '2',
                authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: false,
                profileAuthDefaultVlan: profile01.authDefaultVlan,
                ...profile01
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()
          expect(await screen.findByText('Customize')).toBeVisible()

          const profileCombobox = await screen.findByRole('combobox', { name: /Profile/ })
          expect(profileCombobox).toBeDisabled()

          await userEvent.click(
            await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')
          )
          await userEvent.click(
            await screen.findByTestId('authenticationProfileId-override-checkbox')
          )

          expect(await screen.findByTestId('flex-enable-switch')).not.toBeDisabled()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()
          expect(profileCombobox).not.toBeDisabled()

          await userEvent.click(profileCombobox)
          await userEvent.click(await screen.findByText('Profile02--auth1-guest5'))

          expect(await screen.findByText(/Another Auth-Default VLAN is already defined on this switch/)).toBeVisible()
        })

        it('should not apply different guest vlan when applying profile', async () => {
          const profile01 = getProfile(flexAuthList.data[0])
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                enableAuthPorts: ['1/1/9'],
                authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: false,
                profileAuthDefaultVlan: profile01.authDefaultVlan,
                ...profile01
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '2',
                flexibleAuthenticationEnabled: false,
                authenticationCustomize: false
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(screen.queryByTestId('flex-enable-switch')).toBeNull() //Multiple Values

          await userEvent.click(
            await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')
          )
          await userEvent.click(await screen.findByTestId('flex-enable-switch'))
          expect(await screen.findByTestId('authenticationProfileId-override-checkbox')).toBeChecked() //checked by default

          const profileCombobox = await screen.findByRole('combobox', { name: /Profile/ })
          expect(await screen.findByTestId('flex-enable-switch')).not.toBeDisabled()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()
          expect(profileCombobox).not.toBeDisabled()

          await userEvent.click(profileCombobox)
          await userEvent.click(await screen.findByText('Profile03--auth10-r3-c4-g99'))

          expect(await screen.findByText(/Select a different profile that has a matching Guest VLAN/)).toBeVisible()
        })

        it('should apply different profile auth default vlan when selected ports matches all enabled authentication ports', async () => {
          const profile01 = getProfile(flexAuthList.data[0])
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                enableAuthPorts: ['1/1/5'],
                authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: false,
                profileAuthDefaultVlan: profile01.authDefaultVlan,
                ...profile01
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '2',
                enableAuthPorts: ['1/1/5'],
                authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: false,
                profileAuthDefaultVlan: profile01.authDefaultVlan,
                ...profile01
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()
          expect(await screen.findByText('Customize')).toBeVisible()

          const profileCombobox = await screen.findByRole('combobox', { name: /Profile/ })
          expect(profileCombobox).toBeDisabled()

          await userEvent.click(
            await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')
          )
          await userEvent.click(
            await screen.findByTestId('authenticationProfileId-override-checkbox')
          )

          expect(await screen.findByTestId('flex-enable-switch')).not.toBeDisabled()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()
          expect(profileCombobox).not.toBeDisabled()

          await userEvent.click(profileCombobox)
          await userEvent.click(await screen.findByText('Profile02--auth1-guest5'))

          expect(await screen.findByText(/Auth Default VLAN can not be the same as Default VLAN/)).toBeVisible()

          await userEvent.click(profileCombobox)
          await userEvent.click(await screen.findByText('Profile04--auth100-g5'))
          expect(await screen.findByTestId('auth-profile-card')).toBeVisible()

        })

        it('should apply different guest vlan from porfile when selected ports matches all enabled authentication ports', async () => {
          const profile01 = getProfile(flexAuthList.data[0])
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                enableAuthPorts: ['1/1/5'],
                authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: false,
                profileAuthDefaultVlan: profile01.authDefaultVlan,
                ...profile01
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '2',
                enableAuthPorts: ['1/1/5'],
                authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: false,
                profileAuthDefaultVlan: profile01.authDefaultVlan,
                ...profile01
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()
          expect(await screen.findByText('Customize')).toBeVisible()

          const profileCombobox = await screen.findByRole('combobox', { name: /Profile/ })
          expect(profileCombobox).toBeDisabled()

          await userEvent.click(
            await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')
          )
          await userEvent.click(
            await screen.findByTestId('authenticationProfileId-override-checkbox')
          )

          expect(await screen.findByTestId('flex-enable-switch')).not.toBeDisabled()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()
          expect(profileCombobox).not.toBeDisabled()

          await userEvent.click(profileCombobox)
          await userEvent.click(await screen.findByText('Profile02--auth1-guest5'))

          expect(await screen.findByText(/Auth Default VLAN can not be the same as Default VLAN/)).toBeVisible()

          await userEvent.click(profileCombobox)
          await userEvent.click(await screen.findByText('Profile03--auth10-r3-c4-g99'))
          expect(await screen.findByTestId('auth-profile-card')).toBeVisible()

        })

        it('should apply different guest vlan from customized when selected ports matches all enabled authentication ports', async () => {
          const profile01 = getProfile(flexAuthList.data[0])
          const excludedFields = new Set(['flexibleAuthenticationEnabled', 'authenticationCustomize', 'guestVlan'])
          const ignoreFields = getIgnoreFields(allMultipleEditableFields, excludedFields)

          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                enableAuthPorts: ['1/1/5'],
                authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: false,
                profileAuthDefaultVlan: profile01.authDefaultVlan,
                ...profile01
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '2',
                enableAuthPorts: ['1/1/5'],
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: true,
                authenticationType: '802.1x_and_macauth',
                changeAuthOrder: true,
                dot1xPortControl: 'auto',
                authDefaultVlan: 10,
                guestVlan: 9,
                authFailAction: 'block',
                authTimeoutAction: 'none'
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()
          expect(await screen.findByText('Customize')).toBeVisible()

          await userEvent.click(
            await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')
          )
          await userEvent.click(await screen.findByText('Customize'))
          await userEvent.click(
            await screen.findByTestId('restrictedVlan-override-checkbox')
          )
          await userEvent.click(
            await screen.findByTestId('criticalVlan-override-checkbox')
          )
          await userEvent.click(
            await screen.findByTestId('guestVlan-override-checkbox')
          )

          const guestVlanInput = await screen.findByLabelText('Guest VLAN')
          await userEvent.type(guestVlanInput, '7')

          await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
          expect(mockedSavePortsSetting).toHaveBeenLastCalledWith({
            enableRbac: true,
            option: { skip: false },
            params: {
              tenantId: 'tenant-id',
              venueId: 'a98653366d2240b9ae370e48fab3a9a1'
            },
            payload: [{
              switchId: 'c0:c5:20:aa:32:79',
              ignoreFields: ignoreFields.concat(['revert']).toString(),
              port: '5',
              ports: ['5'],
              flexibleAuthenticationEnabled: true,
              authenticationCustomize: true,
              guestVlan: '7'
            }, {
              switchId: '58:fb:96:0e:82:8a',
              ignoreFields: ignoreFields.concat(['revert']).toString(),
              port: '1/1/5',
              ports: ['1/1/5'],
              flexibleAuthenticationEnabled: true,
              authenticationCustomize: true,
              guestVlan: '7'
            }]
          })
        })

        it('should override VLANs correctly', async () => {
          const excludedFields = new Set(['flexibleAuthenticationEnabled', 'authenticationCustomize', 'restrictedVlan', 'criticalVlan', 'guestVlan'])
          const ignoreFields = getIgnoreFields(allMultipleEditableFields, excludedFields)

          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                enableAuthPorts: ['1/1/5'],
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: true,
                authenticationType: '802.1x_and_macauth',
                changeAuthOrder: true,
                dot1xPortControl: 'auto',
                authDefaultVlan: 10,
                authFailAction: 'restricted_vlan',
                restrictedVlan: 8,
                authTimeoutAction: 'critical_vlan',
                criticalVlan: 8,
                guestVlan: 8
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '2',
                enableAuthPorts: ['1/1/5'],
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: true,
                authenticationType: '802.1x',
                dot1xPortControl: 'auto',
                authDefaultVlan: 10,
                authFailAction: 'restricted_vlan',
                restrictedVlan: 7,
                authTimeoutAction: 'critical_vlan',
                criticalVlan: 7,
                guestVlan: 7
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()

          await userEvent.click(
            await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')
          )
          await userEvent.click(
            await screen.findByTestId('restrictedVlan-override-checkbox')
          )
          await userEvent.click(
            await screen.findByTestId('criticalVlan-override-checkbox')
          )
          await userEvent.click(
            await screen.findByTestId('guestVlan-override-checkbox')
          )

          const restrictedVlanInput = await screen.findByLabelText('Restricted VLAN')
          await userEvent.type(restrictedVlanInput, '7')
          const criticalVlanInput = await screen.findByLabelText('Critical VLAN')
          await userEvent.type(criticalVlanInput, '7')
          const guestVlanInput = await screen.findByLabelText('Guest VLAN')
          await userEvent.type(guestVlanInput, '7')

          await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
          expect(mockedSavePortsSetting).toHaveBeenLastCalledWith({
            enableRbac: true,
            option: { skip: false },
            params: {
              tenantId: 'tenant-id',
              venueId: 'a98653366d2240b9ae370e48fab3a9a1'
            },
            payload: [{
              switchId: 'c0:c5:20:aa:32:79',
              ignoreFields: ignoreFields.concat(['revert']).toString(),
              port: '5',
              ports: ['5'],
              flexibleAuthenticationEnabled: true,
              authenticationCustomize: true,
              restrictedVlan: '7',
              criticalVlan: '7',
              guestVlan: '7'
            }, {
              switchId: '58:fb:96:0e:82:8a',
              ignoreFields: ignoreFields.concat(['revert']).toString(),
              port: '1/1/5',
              ports: ['1/1/5'],
              flexibleAuthenticationEnabled: true,
              authenticationCustomize: true,
              restrictedVlan: '7',
              criticalVlan: '7',
              guestVlan: '7'
            }]
          })
        })

        it('should show an error message correctly when the authentication settings are enabled and the Auth Default VLAN has multiple values', async () => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                enableAuthPorts: ['1/1/5'],
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: true,
                authenticationType: '802.1x_and_macauth',
                changeAuthOrder: true,
                dot1xPortControl: 'auto',
                authDefaultVlan: 10,
                authFailAction: 'block',
                authTimeoutAction: 'none'
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '2',
                enableAuthPorts: ['1/1/5'],
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: true,
                authenticationType: '802.1x',
                dot1xPortControl: 'auto',
                authDefaultVlan: 11,
                authFailAction: 'block',
                authTimeoutAction: 'none'
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()

          await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
          expect(mockedSavePortsSetting).not.toBeCalled()

          await userEvent.click(
            await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')
          )
          await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
          expect(await screen.findByText(/The selected ports have different or no Auth Default VLAN set previously/)).toBeVisible()
        })

        it('should validate with auth default vlan correctly when VLANs have multiple values', async () => {
          //restrictedVlan, criticalVlan, guestVlan > Multiple values
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                enableAuthPorts: ['1/1/5'],
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: true,
                authenticationType: '802.1x_and_macauth',
                changeAuthOrder: true,
                dot1xPortControl: 'auto',
                authDefaultVlan: 10,
                authFailAction: 'restricted_vlan',
                restrictedVlan: 8,
                authTimeoutAction: 'critical_vlan',
                criticalVlan: 8,
                guestVlan: 8
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '2',
                enableAuthPorts: ['1/1/5'],
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: true,
                authenticationType: '802.1x',
                dot1xPortControl: 'auto',
                authDefaultVlan: 10,
                authFailAction: 'restricted_vlan',
                restrictedVlan: 7,
                authTimeoutAction: 'critical_vlan',
                criticalVlan: 7,
                guestVlan: 7
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()

          await userEvent.click(
            await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')
          )
          await userEvent.click(
            await screen.findByTestId('authDefaultVlan-override-checkbox')
          )

          const authVlanInput = await screen.findByLabelText(/Auth Default VLAN/)
          await userEvent.clear(authVlanInput)
          await userEvent.type(authVlanInput, '7')
          await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))

          expect(mockedSavePortsSetting).not.toBeCalled()
          // auth default vlan cannot be the same as either of the other VLANs
          expect(await screen.findByText(/Among the selected ports, Restricted VLAN ID is same as Auth Default which is not allowed. Please use a different Restricted VLAN ID/)).toBeVisible()
          expect(await screen.findByText(/Among the selected ports, Critical VLAN ID is same as Auth Default which is not allowed. Please use a different Critical VLAN ID/)).toBeVisible()
          expect(await screen.findByText(/Among the selected ports, Guest VLAN ID is same as Auth Default which is not allowed. Please use a different Guest VLAN ID/)).toBeVisible()
        })

        it('should pre-select the fields correctly when either port has a different enable status.', async () => {
          const profile01 = getProfile(flexAuthList.data[0])
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                flexibleAuthenticationEnabled: true,
                authenticationCustomize: true,
                switchLevelAuthDefaultVlan: 3,
                ...profile01
              }, {
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                id: 'c0:c5:20:aa:32:79/1/1/7',
                port: '1/1/7',
                ports: ['1/1/7'],
                flexibleAuthenticationEnabled: false,
                authenticationCustomize: false,
                switchLevelAuthDefaultVlan: 3
              }]))
            )
          )

          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 2)?.length > 1}
              isVenueLevel={true}
              selectedPorts={selectedPorts?.slice(0, 2)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(screen.queryByTestId('flex-enable-switch')).toBeNull()

          await userEvent.click(
            await screen.findByTestId('flexibleAuthenticationEnabled-override-checkbox')
          )
          await userEvent.click(await screen.findByTestId('flex-enable-switch'))

          expect(await screen.findByTestId('authenticationProfileId-override-checkbox')).toBeChecked() //checked by default

          expect(await screen.findByText('Customize')).toBeVisible()
          await userEvent.click(await screen.findByText('Customize'))

          expect(await screen.findByTestId('authenticationType-override-checkbox')).toBeChecked() //checked by default
          expect(await screen.findByTestId('dot1xPortControl-override-checkbox')).toBeChecked() //checked by default
          expect(await screen.findByTestId('authDefaultVlan-override-checkbox')).toBeChecked() //checked by default
        })
      })
    })
  })
})
