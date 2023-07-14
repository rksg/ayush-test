import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { CommonUrlsInfo, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import {
  render,
  screen,
  mockServer,
  waitForElementToBeRemoved,
  within,
  fireEvent
} from '@acx-ui/test-utils'

import { aclList, freeVePortVlans, routedList, successResponse, switchDetailHeader, switchList, switchesList, venueRoutedList } from './__tests__/fixtures'

import { SwitchVeTable } from '.'

const venueSwitchSetting = {
  cliApplied: false,
  id: '45aa5ab71bd040be8c445be8523e0b6c',
  name: 'My-Venue',
  profileId: ['6a757409dc1f47c2ad48689db4a0846a'],
  switchLoginPassword: 'xxxxxxxxx',
  switchLoginUsername: 'admin',
  syslogEnabled: false
}

describe('Switch VE Table', () => {
  const params = {
    tenantId: 'tenant-id',
    switchId: 'switch-id',
    serialNumber: 'switch-serialNumber',
    venueId: 'venue-id'
  }

  beforeEach(() => {
    mockServer.use(
      rest.delete(
        SwitchUrlsInfo.deleteVePorts.url,
        (req, res, ctx) => res(ctx.json(successResponse))),
      rest.post(
        SwitchUrlsInfo.getSwitchRoutedList.url,
        (_, res, ctx) => res(ctx.json(routedList))),
      rest.post(
        SwitchUrlsInfo.addVePort.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(
        SwitchUrlsInfo.getAclUnion.url,
        (_, res, ctx) => res(ctx.json(aclList))),
      rest.get(
        SwitchUrlsInfo.getSwitch.url,
        (_, res, ctx) => res(ctx.json(switchList))),
      rest.get(
        SwitchUrlsInfo.getFreeVePortVlans.url,
        (_, res, ctx) => res(ctx.json(freeVePortVlans))),
      rest.get(
        SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(switchDetailHeader))),
      rest.put(
        SwitchUrlsInfo.updateVePort.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(
        SwitchUrlsInfo.getVenueRoutedList.url,
        (_, res, ctx) => res(ctx.json(venueRoutedList))),
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (_, res, ctx) => res(ctx.json(switchesList))),
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json(venueSwitchSetting)))
    )
  })

  afterEach(() => Modal.destroyAll())

  it('should render VE table correctly', async () => {
    render(<Provider><SwitchVeTable isVenueLevel={false} /></Provider>, {
      route: {
        params,
        path: '/:tenantId/t/:switchId'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/TEST-VE3/i)).toBeVisible()
  })

  it('should Add VE correctly', async () => {
    render(<Provider><SwitchVeTable isVenueLevel={false} /></Provider>, {
      route: {
        params,
        path: '/:tenantId/t/:switchId'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByRole('row', { name: /TEST-VE3/i })
    await userEvent.click(screen.getByText(/add vlan interface \(ve\)/i))
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    const vlanIdSelect = await screen.findByRole('combobox', { name: /VLAN ID/i })
    await userEvent.click(vlanIdSelect)
    await userEvent.click((await screen.findByTitle(/VLAN\-5/i)))

    const veInput = screen.getByRole('spinbutton', {
      name: /ve/i
    })
    await userEvent.type(veInput, '40')

    fireEvent.change(screen.getByLabelText(/ip address/i), { target: { value: '1.1.1.1' } })
    fireEvent.change(screen.getByLabelText(/ip subnet mask/i),
      { target: { value: '255.255.255.0' } })
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

  })

  it('should config VE correctly', async () => {
    render(<Provider><SwitchVeTable isVenueLevel={false} /></Provider>, {
      route: {
        params,
        path: '/:tenantId/t/:switchId'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /TEST-VE3/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
  })

  it('should config VE-1 correctly', async () => {
    render(<Provider><SwitchVeTable isVenueLevel={false} /></Provider>, {
      route: {
        params,
        path: '/:tenantId/t/:switchId'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /VE-1/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await screen.findByRole('combobox', { name: /VLAN ID/i })

    fireEvent.change(screen.getByLabelText(/ve name/i), { target: { value: 'default' } })
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  })

  it('should delete VE correctly', async () => {
    render(<Provider><SwitchVeTable isVenueLevel={false} /></Provider>, {
      route: {
        params,
        path: '/:tenantId/t/:switchId'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /TEST-VE3/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText(/delete "test\-ve3"\?/i)
    await userEvent.click(screen.getByRole('button', { name: /delete routed interface/i }))
  })

  it('should delete VEs correctly', async () => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchRoutedList.url,
        (_, res, ctx) => res(ctx.json(routedList)))
    )

    render(<Provider><SwitchVeTable isVenueLevel={false} /></Provider>, {
      route: {
        params,
        path: '/:tenantId/t/:switchId'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row1 = await screen.findByRole('row', { name: /TEST-VE3/i })
    await userEvent.click(within(row1).getByRole('checkbox'))
    const row2 = await screen.findByRole('row', { name: /ve\-2/i })
    await userEvent.click(within(row2).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText(/delete "2 routed interface"\?/i)
    await userEvent.click(screen.getByRole('button', { name: /delete routed interface/i }))
  })

  it('should not delete default VE correctly', async () => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchRoutedList.url,
        (_, res, ctx) => res(ctx.json(routedList)))
    )


    render(<Provider><SwitchVeTable isVenueLevel={false} /></Provider>, {
      route: {
        params,
        path: '/:tenantId/t/:switchId'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row2 = await screen.findByRole('row', { name: /ve\-1/i })
    await userEvent.click(within(row2).getByRole('checkbox'))
    await screen.findByRole('button', { name: 'Delete' })
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
  })

  it('should validate VE correctly', async () => {
    render(<Provider><SwitchVeTable isVenueLevel={false} /></Provider>, {
      route: {
        params,
        path: '/:tenantId/t/:switchId'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByRole('row', { name: /TEST-VE3/i })
    await userEvent.click(screen.getByText(/add vlan interface \(ve\)/i))

    const veInput = screen.getByRole('spinbutton', {
      name: /ve/i
    })
    await userEvent.type(veInput, 'x')

    fireEvent.change(screen.getByLabelText(/ve name/i), { target: { value: 'x' } })
    fireEvent.change(screen.getByLabelText(/ip address/i), { target: { value: 'x' } })
    fireEvent.change(screen.getByLabelText(/dhcp relay agent/i), { target: { value: 'x' } })
    fireEvent.change(screen.getByLabelText(/ospf area/i), { target: { value: 'x' } })
    fireEvent.change(screen.getByLabelText(/ip subnet mask/i),
      { target: { value: 'x' } })
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  })

  it('should render VE table in venue level correctly', async () => {
    render(<Provider><SwitchVeTable isVenueLevel={true} /></Provider>, {
      route: {
        params,
        path: '/:tenantId/t/venues/:venueId/edit/switch/interfaces'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/VE-1/i)).toBeVisible()

    await userEvent.click(screen.getByText(/add vlan interface \(ve\)/i))
    const drawer = await screen.findByRole('dialog')
    expect(drawer).toBeVisible()
  })
})
