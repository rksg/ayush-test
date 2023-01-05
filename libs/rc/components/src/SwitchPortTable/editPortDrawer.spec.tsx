import '@testing-library/jest-dom'
import { rest } from 'msw'

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
  portSetting,
  portsSetting,
  vlansByVenue
} from './__tests__/fixtures'
import { EditPortDrawer } from './editPortDrawer'

const params = {
  tenantId: 'tenant-id',
  switchId: 'switch-id',
  serialNumber: 'serial-number'
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
        (_, res, ctx) => res(ctx.json(portSetting))
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

  it('should render Edit Port Drawer correctly', async () => {
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
    const budgetInput = await screen.findByTestId('poe-budget-input')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(budgetInput, { target: { value: '1000' } })
    })

    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    const dialog = await screen.findAllByRole('dialog')
    await screen.findByText('Select Port VLANs')
    fireEvent.click(await within(dialog[1]).findByRole('button', { name: 'Cancel' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
  })

  it('should render Drawer and customized VLAN correctly', async () => {
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

    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    const dialog = await screen.findAllByRole('dialog')
    await screen.findByText('Select Port VLANs')
    const taggedTabPanel = screen.getByRole('tabpanel', { hidden: false })
    const taggedInput = await within(taggedTabPanel).findByTestId('tagged-input')
    fireEvent.change(taggedInput, { target: { value: 'VLAN-ID-6' } })
    expect(within(taggedTabPanel).queryByText(/VLAN-ID-55/)).not.toBeInTheDocument()
    fireEvent.click(await within(dialog[1]).findByText(/VLAN-ID-66/))

    fireEvent.click(await screen.findByRole('tab', { name: 'Untagged VLANs' }))
    const untaggedTabPanel = screen.getByRole('tabpanel', { hidden: false })
    const untaggedInput = await within(untaggedTabPanel).findByTestId('untagged-input')
    fireEvent.change(untaggedInput, { target: { value: 'VLAN-ID-' } })
    fireEvent.click(await within(untaggedTabPanel).findByText(/VLAN-ID-22/))
    fireEvent.click(await within(dialog[1]).findByRole('button', { name: 'OK' }))
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

  it('should render Edit ICX7650-48F Port Drawer correctly', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getPortSetting.url,
        (_, res, ctx) => res(ctx.json({
          ...portSetting,
          poeCapability: false,
          revert: true,
          poeBudget: 0
          // poeClass: 'ONE'
          // portSpeed:
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

    // const ipsg = await screen.findByLabelText('ipsg')
    // fireEvent.click(asFragment().querySelector('#ipsg').element)


    fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    await screen.findByText('Modify Uplink Port?')
    fireEvent.click(await screen.findByRole('button', { name: 'Apply Changes' }))
  })

  it('should render drawer of multiple oport correctly', async () => {
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

    fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
  })
})