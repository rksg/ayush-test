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
  describe('Switch MAC ACL(base on Switch RBAC FF enabled)', () => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_RBAC_API)
      mockServer.use(
        rest.get(SwitchRbacUrlsInfo.getSwitchDetailHeader.url,
          (_, res, ctx) => res(ctx.json({ ...switchDetailHeader }))
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
              portSecurity: false,
              portSecurityMaxEntries: 1
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
        }),
        rest.post(SwitchUrlsInfo.getSwitchStickyMacAcls.url,
          (_, res, ctx) => res(ctx.json({ data: [],fields: ['id'],page: 1,totalCount: 0,totalPages: 0 }))
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
        expect(screen.queryByText('Port MAC Security')).toBeNull()
      })
    })

    describe('FF enabled', () => {
      const switchList = [{
        id: 'c0:c5:20:aa:32:79',
        firmware: 'TNR10020b_cd1'
      }] as SwitchRow[]

      beforeEach(() => {
        jest.mocked(useIsSplitOn).mockImplementation(
          ff => ff === Features.SWITCH_RBAC_API || ff === Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE
        )

        mockServer.use(
          rest.get(SwitchRbacUrlsInfo.getSwitchDetailHeader.url,
            (_, res, ctx) => res(ctx.json({
              ...switchDetailHeader,
              firmware: 'TNR10020b_cd1',
              isMacAclSupported: true
            }))
          )
        )
      })
      it('should render port security and MAC ACL controls when enabled', async () => {
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

        const portSecurityToggle = await screen.findByTestId('port-security-checkbox')
        expect(portSecurityToggle).toBeVisible()

        await userEvent.click(portSecurityToggle)

        const maxEntriesInput = await screen.findByTestId('port-security-max-entries-input')
        expect(maxEntriesInput).toBeVisible()

        await userEvent.clear(maxEntriesInput)
        await userEvent.type(maxEntriesInput, '5')
        expect(maxEntriesInput).toHaveValue('5')

        const switchMacAclField = await screen.findByTestId('switchMacAclSelectList')
        expect(switchMacAclField).toBeVisible()

        const addMacAclButton = await screen.findByText('Add MAC ACL')
        expect(addMacAclButton).toBeVisible()
        expect(addMacAclButton).not.toBeDisabled()
      })

      it('should render correctly when the firmware of the selected switch is below the 10.0.20b version', async () => {
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
        expect(screen.queryByText('Port MAC Security')).toBeNull()
      })

      it('should render correctly when the sticky mac size limit is lower than 5', async () => {
        mockServer.use(
          rest.post(SwitchRbacUrlsInfo.getPortSetting.url,
            (_, res, ctx) => res(ctx.json(portSetting.map(p => {
              return {
                ...p,
                portSecurity: true,
                portSecurityMaxEntries: 10
              }
            })))
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
          />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/ports'
          }
        })
        await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
        await screen.findByText('Edit Port')

        const portSecurityToggle = await screen.findByTestId('port-security-checkbox')
        expect(portSecurityToggle).toBeVisible()

        const maxEntriesInput = await screen.findByTestId('port-security-max-entries-input')
        expect(maxEntriesInput).toBeVisible()

        fireEvent.change(maxEntriesInput, { target: { value: '5' } })
        expect(maxEntriesInput).toHaveValue('5')
        fireEvent.focusOut(maxEntriesInput)

        const switchMacAclField = await screen.findByRole('dialog')
        expect(switchMacAclField).toBeVisible()
      })
    })
  })
})
