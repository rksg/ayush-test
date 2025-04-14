import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { switchApi }                                     from '@acx-ui/rc/services'
import { SwitchUrlsInfo, SwitchRbacUrlsInfo, SwitchRow } from '@acx-ui/rc/utils'
import { Provider, store }                               from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within,
  waitForElementToBeRemoved,
  fireEvent
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
  availablePortProfileList,
  macAclList
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

  /* eslint-disable max-len */
  describe('Port Profile (base on Switch RBAC FF enabled)', () => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_RBAC_API)
      mockServer.use(
        rest.get(SwitchRbacUrlsInfo.getSwitchDetailHeader.url,
          (_, res, ctx) => res(ctx.json({ ...switchDetailHeader, firmware: 'TNR10020b_b205' }))
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
        rest.get(SwitchRbacUrlsInfo.getSwitchVlanUnion.url,
          (_, res, ctx) => res(ctx.json(switchVlanUnion))
        ),
        rest.post(SwitchRbacUrlsInfo.getSwitchRoutedList.url,
          (_, res, ctx) => res(ctx.json(switchRoutedList))
        ),
        rest.post(SwitchRbacUrlsInfo.getPortSetting.url,
          (_, res, ctx) => res(ctx.json(portSetting.map(p => {
            return {
              ...p,
              switchPortProfileId: '61cd8961ebeb457f8a2403cd5d3a78ad'
            }
          })))
        ),
        rest.post(SwitchRbacUrlsInfo.getSwitchList.url,
          (_, res, ctx) => res(ctx.json({ data: [] }))
        ),
        rest.post(
          SwitchUrlsInfo.getPortProfileOptionsForMultiSwitches.url,
          (req, res, ctx) => res(ctx.json(availablePortProfileList))
        ),
        rest.post(SwitchUrlsInfo.getSwitchMacAcls.url,
          (_, res, ctx) => res(ctx.json(macAclList))
        ),
        rest.post(SwitchUrlsInfo.getLayer2Acls.url, (req, res, ctx) => {
          return res(ctx.json({
            data: [
              { id: 'acl-1', name: 'ACL 1' },
              { id: 'acl-2', name: 'ACL 2' }
            ]
          }))
        })
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
        expect(screen.queryByText('Port Profile')).toBeNull()
      })
    })

    describe('FF enabled', () => {
      beforeEach(() => {
        jest.mocked(useIsSplitOn).mockImplementation(
          ff => ff === Features.SWITCH_RBAC_API || ff === Features.SWITCH_CONSUMER_PORT_PROFILE_TOGGLE
        )
      })

      describe('Single edit', () => {
        const switchList = [{
          id: 'c0:c5:20:aa:32:79',
          firmware: 'TNR10020b_b205'
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
          expect(await screen.findByText('pProfileGlobal3')).toBeVisible()
        })

        it('should render SWITCH_LEVEL port profile options correctly', async () => {
          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={false}
              isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
              isVenueLevel={false}
              selectedPorts={selectedPorts?.slice(0, 1)}
              switchList={switchList}
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
          const portProfileSelectList = await screen.findByTestId('portProfileSelectList')
          await userEvent.click(portProfileSelectList)
          fireEvent.change(portProfileSelectList, {
            target: { label: 'pProfileGlobal (Modified locally)' }
          })
        })

        it('should render port profile select list disabled if the selected ports is uplink port', async () => {
          render(<Provider>
            <EditPortDrawer
              visible={true}
              setDrawerVisible={jest.fn()}
              isCloudPort={true}
              isMultipleEdit={selectedPorts?.slice(0, 1)?.length > 1}
              isVenueLevel={false}
              selectedPorts={selectedPorts?.slice(0, 1)}
              switchList={switchList}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/ports'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')
          const portProfileSelectList = await screen.findByTestId('portProfileSelectList')
          expect(portProfileSelectList).toHaveClass('ant-select-disabled')

          await userEvent.hover(portProfileSelectList)
          expect(await screen.findByRole('tooltip', { hidden: false }))
            .toHaveTextContent(/Port Profile cannot be enabled on the uplink port because it will result in switch losing connection to RUCKUS One./)
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
          expect(screen.queryByText('Port Profile')).toBeNull()
        })

      })

      describe('Multiple edit', () => {
        const switchList = [{
          id: 'c0:c5:20:aa:32:79',
          firmware: 'TNR10020b_b205'
        }, {
          id: '58:fb:96:0e:82:8a',
          firmware: 'TNR10020b_b205'
        }] as SwitchRow[]

        it('should render correctly when either of the selected ports is uplink port', async () => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                switchPortProfileId: '4e798541527e48b09f4744c24faf0e7a'
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                switchPortProfileId: '4e798541527e48b09f4744c24faf0e7a'
              }]))
            ),
            rest.post(SwitchRbacUrlsInfo.getDefaultVlan.url,
              (_, res, ctx) => res(ctx.json(defaultVlan.slice(0, 2)))
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
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          const portProfileSelectList = await screen.findByTestId('portProfileSelectList')
          expect(portProfileSelectList).toHaveClass('ant-select-disabled')

          await userEvent.hover(portProfileSelectList)
          expect(await screen.findByRole('tooltip', { hidden: false }))
            .toHaveTextContent(/Port Profile cannot be enabled on the uplink port because it will result in switch losing connection to RUCKUS One./)
        })

        it('should display multiple values when the selected ports have different port profiles', async () => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                switchPortProfileId: '4e798541527e48b09f4744c24faf0e7a'
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                switchPortProfileId: '61cd8961ebeb457f8a2403cd5d3a78ad'
              }]))
            ),
            rest.post(SwitchRbacUrlsInfo.getDefaultVlan.url,
              (_, res, ctx) => res(ctx.json(defaultVlan.slice(0, 2)))
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
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          const portProfileContainer = await screen.findByTestId('portProfileContainer')
          expect(await within(portProfileContainer).findByText('Multiple values')).toBeVisible()
        })

        it('should render correctly when the selected ports have different port profiles', async () => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                switchPortProfileId: '4e798541527e48b09f4744c24faf0e7a'
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                switchPortProfileId: '61cd8961ebeb457f8a2403cd5d3a78ad'
              }]))
            ),
            rest.post(SwitchRbacUrlsInfo.getDefaultVlan.url,
              (_, res, ctx) => res(ctx.json(defaultVlan.slice(0, 2)))
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
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          const portProfileContainer = await screen.findByTestId('portProfileContainer')
          const portProfileCheckbox = await within(portProfileContainer).findByRole('checkbox')
          expect(portProfileCheckbox).toBeVisible()
          await userEvent.click(portProfileCheckbox)

          const portProfileSelectList = await screen.findByTestId('portProfileSelectList')
          fireEvent.change(portProfileSelectList, {
            target: { label: 'pProfileGlobal (Modified locally)' }
          })
        })


        it('should render correctly when the selected ports have the same port profiles', async () => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                switchPortProfileId: '4e798541527e48b09f4744c24faf0e7a'
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                switchPortProfileId: '4e798541527e48b09f4744c24faf0e7a'
              }]))
            ),
            rest.post(SwitchRbacUrlsInfo.getDefaultVlan.url,
              (_, res, ctx) => res(ctx.json(defaultVlan.slice(0, 2)))
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
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          const portProfileContainer = await screen.findByTestId('portProfileContainer')
          const portProfileCheckbox = await within(portProfileContainer).findByRole('checkbox')
          expect(portProfileCheckbox).toBeVisible()

          const portProfileSelectList = await screen.findByTestId('portProfileSelectList')
          expect(portProfileSelectList).toHaveClass('ant-select-disabled')
        })

        it('should render correctly when either of the selected switch firmware versions is above 10.0.20b', async () => {
          mockServer.use(
            rest.post(SwitchRbacUrlsInfo.getPortsSetting.url,
              (_, res, ctx) => res(ctx.json([{
                ...portSetting[0],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                switchPortProfileId: '4e798541527e48b09f4744c24faf0e7a'
              }, {
                ...portSetting[2],
                taggedVlans: ['2'],
                untaggedVlan: '1',
                switchPortProfileId: '4e798541527e48b09f4744c24faf0e7a'
              }]))
            ),
            rest.post(SwitchRbacUrlsInfo.getDefaultVlan.url,
              (_, res, ctx) => res(ctx.json(defaultVlan.slice(0, 2)))
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
                firmware: 'TNR10020b_b205'
              }, {
                id: '58:fb:96:0e:82:8a',
                firmware: 'SPR10010f_b467'
              }] as SwitchRow[]}
            />
          </Provider>, {
            route: {
              params,
              path: '/:tenantId/t/venues/:venueId/venue-details/devices/switch/port'
            }
          })
          await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
          await screen.findByText('Edit Port')

          const portProfileSelectList = await screen.findByTestId('portProfileSelectList')
          expect(portProfileSelectList).toBeVisible()
        })

      })
    })
  })
})
