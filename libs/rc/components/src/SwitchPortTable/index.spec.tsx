import '@testing-library/jest-dom'
import { rest } from 'msw'

import { switchApi }                                     from '@acx-ui/rc/services'
import { SwitchUrlsInfo }                                from '@acx-ui/rc/utils'
import { Provider, store }                               from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, within } from '@acx-ui/test-utils'

import { SwitchPortTable } from '.'
import { Modal } from "antd";

const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  switchId: 'switch-id',
  serialNumber: 'serial'
}

const portlistData_7650 = {
  data: [{
    adminStatus: 'Up',
    broadcastIn: '436434',
    broadcastOut: '2432',
    cloudPort: true,
    crcErr: '0',
    deviceStatus: 'ONLINE',
    id: '38-45-3b-3b-b8-10_1-1-1',
    inDiscard: '0',
    inErr: '0',
    lagId: '0',
    lagName: '',
    multicastIn: '348193',
    multicastOut: '19730',
    name: 'GigabitEthernet1/1/1',
    neighborName: 'HP1920S_6F_DC_F3_8U_10.206.2.4',
    opticsType: '1 Gbits per second copper',
    outErr: '0',
    poeEnabled: true,
    poeTotal: 0,
    poeType: 'n/a',
    poeUsed: 0,
    portId: '38-45-3b-3b-b8-10_1-1-1',
    portIdentifier: '1/1/1',
    portSpeed: '1 Gb/sec',
    signalIn: 0,
    signalOut: 0,
    stack: false,
    status: 'Up',
    switchMac: '38:45:3b:3b:b8:10',
    switchModel: 'ICX7650-48ZP',
    switchName: 'ICX7650-48ZP Router',
    switchSerial: '38:45:3b:3b:b8:10',
    switchUnitId: 'EZC4312T00C',
    syncedSwitchConfig: true,
    unTaggedVlan: '1',
    unitState: 'ONLINE',
    unitStatus: 'Standalone',
    usedInFormingStack: false,
    vlanIds: '1'
  }, {
    adminStatus: 'Up',
    broadcastIn: '0',
    broadcastOut: '0',
    cloudPort: false,
    crcErr: '0',
    deviceStatus: 'ONLINE',
    id: '38-45-3b-3b-b8-11_1-1-2',
    inDiscard: '0',
    inErr: '0',
    lagId: '1',
    lagName: 'test1',
    multicastIn: '0',
    multicastOut: '0',
    name: 'GigabitEthernet1/1/2',
    neighborName: '',
    opticsType: '1 Gbits per second copper',
    outErr: '0',
    poeEnabled: true,
    poeTotal: 0,
    poeType: 'n/a',
    poeUsed: 0,
    portId: '38-45-3b-3b-b8-11_1-1-2',
    portIdentifier: '1/1/2',
    portSpeed: 'link down or no traffic',
    signalIn: 0,
    signalOut: 0,
    stack: false,
    status: 'Down',
    switchMac: '38:45:3b:3b:b8:10',
    switchModel: 'ICX7650-48ZP',
    switchName: 'ICX7650-48ZP Router',
    switchSerial: '38:45:3b:3b:b8:10',
    switchUnitId: 'EZC4312T00C',
    syncedSwitchConfig: true,
    unTaggedVlan: '1',
    unitState: 'ONLINE',
    unitStatus: 'Standalone',
    usedInFormingStack: false,
    vlanIds: ''
  }, {
    adminStatus: 'Up',
    broadcastIn: '0',
    broadcastOut: '0',
    cloudPort: false,
    crcErr: '0',
    id: '38-45-3b-3b-b8-12_1-1-3',
    inDiscard: '0',
    inErr: '0',
    lagId: '2',
    lagName: 'test2',
    multicastIn: '0',
    multicastOut: '0',
    name: 'GigabitEthernet1/1/3',
    neighborName: '',
    opticsType: '1 Gbits per second copper',
    outErr: '0',
    poeEnabled: false,
    poeTotal: 0,
    poeType: 'n/a',
    poeUsed: 0,
    portId: '38-45-3b-3b-b8-12_1-1-3',
    portIdentifier: '1/1/3',
    portSpeed: 'link down or no traffic',
    signalIn: 0,
    signalOut: 0,
    stack: false,
    status: 'Down',
    switchMac: '38:45:3b:3b:b8:10',
    switchModel: 'ICX7650-48ZP',
    switchName: 'ICX7650-48ZP Router',
    switchSerial: '38:45:3b:3b:b8:10',
    switchUnitId: 'EZC4312T00C',
    syncedSwitchConfig: true,
    unTaggedVlan: '1',
    unitState: 'ONLINE',
    unitStatus: 'Standalone',
    usedInFormingStack: false,
    vlanIds: '1 2 3'
  }, {
    adminStatus: 'Up',
    broadcastIn: '0',
    broadcastOut: '0',
    cloudPort: false,
    crcErr: '0',
    deviceStatus: 'ONLINE',
    id: '38-45-3b-3b-b8-13_1-1-4',
    inDiscard: '0',
    inErr: '0',
    lagId: '0',
    lagName: '',
    multicastIn: '0',
    multicastOut: '0',
    name: 'GigabitEthernet1/1/4',
    neighborName: '',
    opticsType: '1 Gbits per second copper',
    outErr: '0',
    poeEnabled: true,
    poeTotal: 100,
    poeType: 'n/a',
    poeUsed: 10,
    portId: '38-45-3b-3b-b8-13_1-1-4',
    portIdentifier: '1/3/4',
    portSpeed: 'link down or no traffic',
    signalIn: 0,
    signalOut: 0,
    stack: false,
    status: 'Down',
    switchMac: '38:45:3b:3b:b8:10',
    switchModel: 'ICX7650-48ZP',
    switchName: 'ICX7650-48ZP Router',
    switchSerial: '38:45:3b:3b:b8:10',
    switchUnitId: 'EZC4312T00C',
    syncedSwitchConfig: true,
    unTaggedVlan: '',
    unitState: 'ONLINE',
    unitStatus: 'Standalone',
    usedInFormingStack: false,
    vlanIds: '1 2 3'
  }],
  page: 1,
  totalCount: 3
}

const portlistData_7150 = {
  data: [{
    adminStatus: 'Up',
    broadcastIn: '436434',
    broadcastOut: '2432',
    cloudPort: true,
    crcErr: '0',
    deviceStatus: 'ONLINE',
    id: '38-45-3b-3b-b8-10_1-1-1',
    inDiscard: '0',
    inErr: '0',
    lagId: '0',
    lagName: '',
    multicastIn: '348193',
    multicastOut: '19730',
    name: 'GigabitEthernet1/1/1',
    neighborName: 'HP1920S_6F_DC_F3_8U_10.206.2.4',
    opticsType: '1 Gbits per second copper',
    outErr: '0',
    poeEnabled: true,
    poeTotal: 0,
    poeType: 'n/a',
    poeUsed: 1000,
    portId: '38-45-3b-3b-b8-10_1-1-1',
    portIdentifier: '1/1/1',
    portSpeed: '1 Gb/sec',
    signalIn: 0,
    signalOut: 0,
    stack: false,
    status: 'Up',
    switchMac: '38:45:3b:3b:b8:10',
    switchModel: 'ICX7150-48ZP',
    switchName: 'ICX7150-48ZP Router',
    switchSerial: '38:45:3b:3b:b8:10',
    switchUnitId: 'FJN4312T00C',
    syncedSwitchConfig: true,
    unTaggedVlan: '1',
    unitState: 'ONLINE',
    unitStatus: 'Standalone',
    usedInFormingStack: false,
    vlanIds: '1',
    SwitchPortStackingPortField: '10'
  }, {
    adminStatus: 'Up',
    broadcastIn: '436434',
    broadcastOut: '2432',
    cloudPort: true,
    crcErr: '0',
    deviceStatus: 'ONLINE',
    id: '38-45-3b-3b-b8-10_1-1-2',
    inDiscard: '0',
    inErr: '0',
    lagId: '0',
    lagName: '',
    multicastIn: '348193',
    multicastOut: '19730',
    name: 'GigabitEthernet1/1/2',
    neighborName: 'HP1920S_6F_DC_F3_8U_10.206.2.4',
    opticsType: '1 Gbits per second copper',
    outErr: '0',
    poeEnabled: true,
    poeTotal: 1000,
    poeType: 'n/a',
    poeUsed: 1000,
    portId: '38-45-3b-3b-b8-10_1-1-2',
    portIdentifier: '1/1/2',
    portSpeed: '1 Gb/sec',
    signalIn: 0,
    signalOut: 0,
    stack: true,
    status: 'Up',
    switchMac: '38:45:3b:3b:b8:10',
    switchModel: 'ICX7150-48ZP',
    switchName: 'ICX7150-48ZP Router',
    switchSerial: '38:45:3b:3b:b8:10',
    switchUnitId: 'FJN4312T00C',
    syncedSwitchConfig: true,
    unTaggedVlan: '1',
    unitState: 'ONLINE',
    unitStatus: 'Standalone',
    usedInFormingStack: false,
    vlanIds: '1',
    SwitchPortStackingPortField: '10'
  }],
  page: 1,
  totalCount: 2
}

jest.mock('./SwitchLagDrawer', () => ({
  SwitchLagDrawer: () => <div data-testid='SwitchLagDrawer' />
}))

jest.mock('./editPortDrawer', () => ({
  EditPortDrawer: () => <div data-testid='editPortDrawer' />
}))


describe('SwitchPortTable', () => {
  afterEach(() => {
    Modal.destroyAll()
  })

  it('should render ports of switch ICX7650 correctly', async () => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchPortlist.url,
        (req, res, ctx) => res(ctx.json(portlistData_7650))
      ),
      rest.get(
        SwitchUrlsInfo.getSwitchVlanUnion.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
    render(<Provider>
      <SwitchPortTable isVenueLevel={false} />
    </Provider>, {
      route: { params, path: '/:tenantId/:switchId' }
    })

    await screen.findAllByText('1/1/1')
    await screen.findByRole('button', { name: 'Manage LAG' })

    const row = await screen.findAllByRole('row')
    fireEvent.click(await within(row[1]).findByRole('checkbox'))
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    expect(await screen.findByTestId('editPortDrawer')).toBeVisible()
  })

  it('should render ports of switch ICX7150 correctly', async () => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchPortlist.url,
        (req, res, ctx) => res(ctx.json(portlistData_7150))
      ),
      rest.post(
        SwitchUrlsInfo.getSwitchVlanUnionByVenue.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
    render(<Provider>
      <SwitchPortTable isVenueLevel={true} />
    </Provider>, {
      route: { params, path: '/:tenantId/:venueId' }
    })

    await screen.findAllByText('1/1/1')
    expect(screen.queryByText('Manage LAG')).not.toBeInTheDocument()
  })
})
