import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { clientApi }    from '@acx-ui/rc/services'
import {
  AaaUrls,
  ClientUrlsInfo,
  CommonRbacUrlsInfo,
  CommonUrlsInfo,
  EthernetPortProfileUrls,
  LanPortsUrls,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { ApWiredClientTable } from '.'

const ApWiredClientData = [{
  apId: 'ap_serial_01',
  apName: 'ap_01',
  apMacAddress: 'aa:11:11:11:11:11',
  portNumber: 2,
  macAddress: '11:ff:11:11:11:11',
  deviceTypeStr: 'laptop',
  ipAddress: '192.168.0.10',
  hostname: 'wiredDevice1',
  venueId: 'venue_id_1',
  venueName: 'venue_01',
  vlanId: 10,
  status: 1,
  osType: 'MacOS'
},{
  apId: 'ap_serial_02',
  apName: 'ap_02',
  apMacAddress: 'aa:11:11:11:11:11',
  portNumber: 1,
  macAddress: '22:ff:11:11:11:11',
  deviceTypeStr: 'phone',
  ipAddress: '192.168.0.12',
  hostname: 'wiredDevice2',
  venueId: 'venue_id_1',
  venueName: 'venue_01',
  vlanId: 1,
  status: 0,
  osType: 'Linux'
},{
  macAddress: '33:ff:11:11:11:11',
  hostname: 'wiredDevice2',
  status: -1
}]

const LanPortSetting = {
  poeMode: 'Auto',
  lanPorts: [
    {
      type: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      portId: '1',
      enabled: true
    },
    {
      type: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      portId: '2',
      enabled: true
    }
  ],
  useVenueSettings: false
}

const RadiusList = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'f5cf248c518645248c1adafdcb60d99e',
      name: 'test-radius-1'
    }
  ]
}

const PortSetting = {
  overwriteUntagId: 1,
  overwriteVlanMembers: '1-4094',
  softGreEnabled: true,
  clientIsolationEnabled: true,
  clientIsolationSettings: {
    packetsType: 'UNICAST',
    autoVrrp: false
  },
  useVenueSettings: false,
  enabled: true
}

const EthernetPortProfiles = {
  fields: [
    'vni',
    'apActivations',
    'id',
    'apSerialNumbers',
    'venueIds',
    'venueActivations'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'a6bd9bfa129c402da8d146d649c6aad9',
      venueIds: [
        'venue_id_2'
      ],
      apSerialNumbers: [
        'ap_serial_01'
      ],
      venueActivations: [
        {
          venueId: 'venue_id_2',
          apModel: 'H670',
          portId: 3
        }
      ],
      apActivations: [
        {
          venueId: '14ef8a8eea324fdb99d3f86390b280cc',
          apSerialNumber: 'ap_serial_01',
          portId: 2
        }
      ]
    }
  ]
}

describe('ApWiredClientTable', () => {
  const params = { tenantId: 'tenant-id' }
  beforeEach(() => {
    store.dispatch(clientApi.util.resetApiState())
    mockServer.use(
      rest.post(ClientUrlsInfo.getApWiredClients.url,
        (_, res, ctx) => res(ctx.json({ data: ApWiredClientData, page: 1, totalCount: 0 }))
      ),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json([{ id: 'venue_id_1', name: 'venue_01' }]))
      ),
      rest.post(CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json([{ serialNumber: 'ap_serial_01', name: 'ap_01' }]))
      ),
      rest.get(WifiRbacUrlsInfo.getApLanPorts.url,
        (_, res, ctx) => res(ctx.json(LanPortSetting))
      ),
      rest.post(AaaUrls.queryAAAPolicyList.url,
        (_, res, ctx) => res(ctx.json(RadiusList))
      ),
      rest.get(LanPortsUrls.getApLanPortSettings.url,
        (_, res, ctx) => res(ctx.json(PortSetting))
      ),
      rest.post(EthernetPortProfileUrls.getEthernetPortProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(EthernetPortProfiles))
      )
    )
  })

  it('Should render correctly', async () => {
    render(<Provider>
      <ApWiredClientTable />
    </Provider>, { route: { params } })

    expect(await screen.findByText('Hostname')).toBeInTheDocument()
    expect(await screen.findByText('OS')).toBeInTheDocument()
    expect(await screen.findByText('MAC Address')).toBeInTheDocument()
    expect(await screen.findByText('IP Address')).toBeInTheDocument()
    expect(await screen.findAllByText('Venue')).toHaveLength(2)
    expect(await screen.findAllByText('AP')).toHaveLength(2)
    expect(await screen.findByText('AP MAC')).toBeInTheDocument()
    expect(await screen.findByText('LAN Port')).toBeInTheDocument()
    expect(await screen.findByText('VLAN')).toBeInTheDocument()
    expect(await screen.findByText('Auth Status')).toBeInTheDocument()
    expect(await screen.findByText('Device Type')).toBeInTheDocument()
  })

  it('Should render correctly with searchable config', async () => {
    render(<Provider>
      <ApWiredClientTable searchable={true}/>
    </Provider>, { route: { params } })

    expect(await screen.findByText('wiredDevice1')).toBeInTheDocument()
    expect(await screen.findByText('192.168.0.10')).toBeInTheDocument()
    expect(await screen.findAllByText('venue_01')).toHaveLength(2)
    expect(await screen.findByText('ap_01')).toBeInTheDocument()
    expect(await screen.findByText('11:ff:11:11:11:11')).toBeInTheDocument()
    expect(await screen.findByText('11:ff:11:11:11:11')).toBeInTheDocument()
    expect(await screen.findByText('22:ff:11:11:11:11')).toBeInTheDocument()
    expect(await screen.findByText('33:ff:11:11:11:11')).toBeInTheDocument()
    expect(await screen.findAllByText('aa:11:11:11:11:11')).toHaveLength(2)
    expect(await screen.findByRole('button', { name: 'LAN 1' })).toBeVisible()
    expect(await screen.findByRole('button', { name: 'LAN 2' })).toBeVisible()
  })

  it('Should render lan port profile detail drawer correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider>
      <ApWiredClientTable searchable={true}/>
    </Provider>, { route: { params } })

    await userEvent.click(await screen.findByRole('button', { name: 'LAN 1' }))

    expect(await screen.findByText('ap_01')).toBeInTheDocument()
    expect(await screen.findByText('LAN 2')).toBeInTheDocument()
    expect(await screen.findByText('Ethernet Port Profile')).toBeInTheDocument()
    expect(await screen.findByText('Port Type')).toBeInTheDocument()
    expect(await screen.findByText('VLAN Untag ID')).toBeInTheDocument()
    expect(await screen.findByText('VLAN Members')).toBeInTheDocument()
    expect(await screen.findByText('802.1X')).toBeInTheDocument()
    expect(await screen.findByText('802.1X Role')).toBeInTheDocument()
    expect(await screen.findByText('Authentication Service')).toBeInTheDocument()
    expect(await screen.findByText('Proxy Service (Auth)')).toBeInTheDocument()
    expect(await screen.findByText('Accounting Service')).toBeInTheDocument()
    expect(await screen.findByText('Proxy Service (Accounting)')).toBeInTheDocument()
    expect(await screen.findByText('SoftGRE Tunnel')).toBeInTheDocument()
    expect(await screen.findByText('Client Isolation')).toBeInTheDocument()
  })
})