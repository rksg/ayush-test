import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { switchApi }                                     from '@acx-ui/rc/services'
import { SwitchUrlsInfo, SwitchRbacUrlsInfo, SwitchRow } from '@acx-ui/rc/utils'
import { Provider, store }                               from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
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

const transformSubmitValueForRbac = (updateValue?: object) => {
  return {
    enableRbac: true,
    option: { skip: false },
    params: {
      tenantId: 'tenant-id',
      venueId: 'a98653366d2240b9ae370e48fab3a9a1'
    },
    payload: [{
      switchId: 'c0:c5:20:aa:32:79',
      ...initPortValue,
      ...updateValue
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
      rest.get(SwitchUrlsInfo.getVlansByVenue.url,
        (_, res, ctx) => res(ctx.json(vlansByVenue))
      ),
      rest.get(SwitchUrlsInfo.getSwitchConfigurationProfileByVenue.url,
        (_, res, ctx) => res(ctx.json(switchProfile))
      )
    )
  })
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

    describe('FF disabled', () => {
      it('should render correctly', async () => {
        render(<Provider>
          <EditPortDrawer
            visible={true}
            setDrawerVisible={jest.fn()}
            isCloudPort={false}
            isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
            isVenueLevel={false}
            selectedPorts={selectedPorts?.slice(0, 1)}
            switchList={[]}
            authProfiles={[]}
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
        expect(await screen.findByText('VLAN-ID: 1 (Default VLAN)')).toBeVisible()
        expect(await screen.findByText('VLAN-ID: 2')).toBeVisible()
        expect(screen.queryByText('Port Authentication')).toBeNull()
      })
    })

    describe('FF enabled', () => {
      beforeEach(() => {
        jest.mocked(useIsSplitOn).mockImplementation(
          ff => ff === Features.SWITCH_RBAC_API || ff === Features.SWITCH_FLEXIBLE_AUTHENTICATION
        )
      })

      describe('Single edit', () => {
        const switchList = [{
          id: 'c0:c5:20:aa:32:79',
          firmware: 'SPR10010f_b467'
        }] as SwitchRow[]

        it('should render correctly', async () => {
          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
              isVenueLevel={false}
              selectedPorts={selectedPorts?.slice(0, 1)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
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
          expect(await screen.findByText('VLAN-ID: 1 (Default VLAN)')).toBeVisible()
          expect(await screen.findByText('VLAN-ID: 2')).toBeVisible()
          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).not.toBeDisabled()
        })

        it('should render correctly when the firmware of the selected switch is below the 10.0.10f version', async () => {
          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
              isVenueLevel={false}
              selectedPorts={selectedPorts?.slice(0, 1)}
              switchList={[{
                id: 'c0:c5:20:aa:32:79',
                firmware: 'SPS09010j_cd3'
              }] as SwitchRow[]}
              authProfiles={flexAuthList.data}
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
          expect(await screen.findByText('VLAN-ID: 1 (Default VLAN)')).toBeVisible()
          expect(await screen.findByText('VLAN-ID: 2')).toBeVisible()
          expect(screen.queryByText('Port Authentication')).toBeNull()
        })

        it('should render correctly when the auth profile is applied', async () => {
          const { id, profileName, ...profile01 } = flexAuthList.data[0]
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
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
              isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
              isVenueLevel={false}
              selectedPorts={selectedPorts?.slice(0, 1)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
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
          expect(await screen.findByText('VLAN-ID: 1 (Default VLAN)')).toBeVisible()
          expect(await screen.findByText('VLAN-ID: 2')).toBeVisible()
          expect(await screen.findByRole('button', { name: 'Use Venue settings' })).toBeDisabled()

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).not.toBeDisabled()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()

          expect(await screen.findByText('Customize')).toBeVisible()
          expect(await screen.findByTestId('auth-profile-card')).toBeVisible()
        })

        it('should show an error messsage when the profile\'s Restricted VLAN duplicate with the Default VLAN', async () => {
          const { id, profileName, ...profile01 } = flexAuthList.data[0]
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
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
              isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
              isVenueLevel={false}
              selectedPorts={selectedPorts?.slice(0, 1)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/ports'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')
          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).not.toBeDisabled()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()

          expect(await screen.findByText('Customize')).toBeVisible()
          expect(await screen.findByTestId('auth-profile-card')).toBeVisible()

          const profileCombobox = await screen.findByRole('combobox', { name: /Profile/ })
          await userEvent.click(profileCombobox)
          await userEvent.click(await screen.findByText('Profile05--auth10-r1-c4-g5'))
          expect(await screen.findByText(/Restricted VLAN can not be the same as Default VLAN/)).toBeVisible()
          expect(screen.queryByTestId('auth-profile-card')).toBeNull()
        })

        it('should render correctly when customizing the flex authentication', async () => {
          const { id, profileName, ...profile01 } = flexAuthList.data[0]
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                flexibleAuthenticationEnabled: true,
                authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
                authenticationCustomize: true,
                ...profile01
              }]))
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
              switchList={switchList}
              authProfiles={flexAuthList.data}
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
          expect(await screen.findByText('VLAN-ID: 1 (Default VLAN)')).toBeVisible()
          expect(await screen.findByText('VLAN-ID: 2')).toBeVisible()
          expect(await screen.findByRole('button', { name: 'Use Venue settings' })).toBeDisabled()

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).not.toBeDisabled()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()
          expect(await screen.findByText('Use Profile Settings')).toBeVisible()
          expect(await screen.findByLabelText('Auth Default VLAN')).toHaveValue('10')
        })

        it('should load profile data after selecting a profile and clicking the customize button', async () => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
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
              isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
              isVenueLevel={false}
              selectedPorts={selectedPorts?.slice(0, 1)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/ports'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')
          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).not.toBeChecked()
          await userEvent.click(await screen.findByTestId('flex-enable-switch'))
          expect(await screen.findByText('Customize')).toBeVisible()

          const profileCombobox = await screen.findByRole('combobox', { name: /Profile/ })
          await userEvent.click(profileCombobox)
          await userEvent.click(await screen.findByText('Profile03--auth10-r3-c4-g99'))
          expect(await screen.findByTestId('auth-profile-card')).toBeVisible()

          await userEvent.click(await screen.findByText('Customize'))
          expect(await screen.findByLabelText(/Auth Default VLAN/)).toHaveValue(flexAuthList?.data[2].authDefaultVlan.toString())
          expect(await screen.findByLabelText(/Restricted VLAN/)).toHaveValue(flexAuthList?.data[2].restrictedVlan?.toString())
          expect(await screen.findByLabelText(/Guest VLAN/)).toHaveValue(flexAuthList?.data[2].guestVlan.toString())
        })

        it('should show an alert message if AAA RADIUS has not been configured when applying port settings', async () => {
          const { id, profileName, ...profile01 } = flexAuthList.data[0]
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                shouldAlertAaaAndRadiusNotApply: true,
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
              isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
              isVenueLevel={false}
              selectedPorts={selectedPorts?.slice(0, 1)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
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
          expect(await screen.findByText('VLAN-ID: 1 (Default VLAN)')).toBeVisible()
          expect(await screen.findByText('VLAN-ID: 2')).toBeVisible()
          expect(await screen.findByRole('button', { name: 'Use Venue settings' })).toBeDisabled()

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).not.toBeDisabled()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()

          await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
          expect(await screen.findByText('Modify Port?')).toBeVisible()
          expect(await screen.findByText(/Authentication needs RADIUS server and AAA policy to support/)).toBeVisible()

          await userEvent.click(await screen.findByRole('button', { name: 'Apply Changes' }))
          expect(mockedSavePortsSetting).toHaveBeenLastCalledWith(
            transformSubmitValueForRbac({
              flexibleAuthenticationEnabled: true,
              authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
              authenticationCustomize: false,
              changeAuthOrder: false,
              ...profile01
            })
          )
        })

        it.skip('should set Auth Default Vlan as Switch Level Auth Default Vlan when the port control is set to "Force Unauthorized" or "Force Authorized"', async () => {
          const { id, profileName, ...profile01 } = flexAuthList.data[0]
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                flexibleAuthenticationEnabled: true,
                authenticationProfileId: '7de28fc02c0245648dfd58590884bad2',
                authenticationCustomize: true,
                switchLevelAuthDefaultVlan: 4,
                ...profile01
              }]))
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
              switchList={switchList}
              authProfiles={flexAuthList.data}
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
          expect(await screen.findByText('VLAN-ID: 1 (Default VLAN)')).toBeVisible()
          expect(await screen.findByText('VLAN-ID: 2')).toBeVisible()
          expect(await screen.findByRole('button', { name: 'Use Venue settings' })).toBeDisabled()

          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).not.toBeDisabled()
          expect(await screen.findByTestId('flex-enable-switch')).toBeChecked()

          const portControlCombobox = await screen.findByRole('combobox', { name: /Port Control/ })
          await userEvent.click(portControlCombobox)
          await userEvent.click(await screen.findByText('Force Unauthorized'))

          expect(await screen.findByLabelText(/Auth Default VLAN/)).toBeDisabled()
          expect(await screen.findByLabelText(/Auth Default VLAN/)).toHaveValue('4') // switch auth default vlan
        })

        it('should show an error message correctly when the port control is set to "Force Unauthorized" or "Force Authorized" and the switch does not have an Auth Default VLAN configured', async () => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
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
              isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
              isVenueLevel={false}
              selectedPorts={selectedPorts?.slice(0, 1)}
              switchList={switchList}
              authProfiles={flexAuthList.data}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/ports'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')
          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).not.toBeDisabled()
          expect(await screen.findByTestId('flex-enable-switch')).not.toBeChecked()

          await userEvent.click(await screen.findByTestId('flex-enable-switch'))
          await userEvent.click(await screen.findByText('Customize'))

          const portControlCombobox = await screen.findByRole('combobox', { name: /Port Control/ })
          await userEvent.click(portControlCombobox)
          await userEvent.click(await screen.findByText('Force Unauthorized'))

          expect(await screen.findByLabelText(/Auth Default VLAN/)).not.toBeDisabled()
          await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
          expect(await screen.findByText(/Please enter Auth Default VLAN/)).toBeVisible()
        })

        it('should render correctly when IPSG enabled', async () => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                ipsg: true
              }]))
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
              switchList={switchList}
              authProfiles={flexAuthList.data}
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
          expect(await screen.findByText('VLAN-ID: 1 (Default VLAN)')).toBeVisible()
          expect(await screen.findByText('VLAN-ID: 2')).toBeVisible()
          expect(await screen.findByText('Port Authentication')).toBeVisible()
          expect(await screen.findByTestId('flex-enable-switch')).toBeDisabled()
        })
      })

    })
  })
})
