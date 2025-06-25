/* eslint-disable max-len */
import { Form } from 'antd'
import { rest } from 'msw'

import {
  CommonRbacUrlsInfo,
  CommonUrlsInfo,
  SwitchRbacUrlsInfo,
  WifiRbacUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { NetworkApsTab } from '.'

const apsList = {
  fields: [
    'isMeshEnable',
    'apUpRssi',
    'description',
    'deviceStatus',
    'meshRole',
    'apStatusData.APSystem.uptime',
    'uplink',
    'deviceGroupId',
    'deviceStatusSeverity',
    'venueId',
    'deviceGroupName',
    'model',
    'fwVersion',
    'lastSeenTime',
    'serialNumber',
    'IP',
    'apMac',
    'lastUpdTime',
    'extIp',
    'tags',
    'venueName',
    'deviceModelType',
    'name',
    'hops',
    'apStatusData.cellularInfo',
    'apStatusData'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      serialNumber: '121603200805',
      lastUpdTime: '1.692248511124E12',
      lastSeenTime: '2023-08-22T07:19:03.816Z',
      name: 'FAKE-R710-AP',
      model: 'R710',
      fwVersion: '6.2.2.103.160',
      venueId: '9a572b2d00ca457eb93811d47ed1e5d1',
      venueName: 'CRRM-Dev-Venue',
      deviceStatus: '2_00_Operational',
      deviceStatusSeverity: '2_Operational',
      IP: '192.168.11.68',
      extIp: '134.242.238.1',
      apMac: 'F0:3E:90:36:D3:00',
      apStatusData: {
        APRadio: [
          {
            txPower: 'max',
            channel: 7,
            band: '2.4G',
            Rssi: null,
            operativeChannelBandwidth: '20',
            radioId: 0
          },
          {
            txPower: 'max',
            channel: 149,
            band: '5G',
            Rssi: null,
            operativeChannelBandwidth: '80',
            radioId: 1
          }
        ],
        APSystem: {
          uptime: 857504,
          ipType: 'dynamic',
          netmask: '255.255.0.0',
          gateway: '192.168.11.254',
          primaryDnsServer: '8.8.8.8',
          secondaryDnsServer: null,
          secureBootEnabled: false
        },
        lanPortStatus: [
          {
            port: '0',
            phyLink: 'Up 100Mbps half'
          },
          {
            port: '1',
            phyLink: 'Down  '
          }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: '2b5af77bb9894f7faf10c7f2aa0e4a15',
      tags: '',
      deviceGroupName: '',
      deviceModelType: 'Indoor',
      healthStatus: 'Excellent'
    }
  ]
}

const rbacApList = {
  totalCount: 1,
  page: 1,
  data: [{

    apGroupId: '8c0219e575d34e82b8e62f5caa5737e1',
    firmwareVersion: '7.0.0.104.1432',
    lanPortStatuses: [
      { id: '0', physicalLink: 'Down ' },
      { id: '1', physicalLink: 'Up 1000Mbps full' }
    ],
    macAddress: 'F0:3E:90:36:D3:00',
    meshRole: 'DISABLED',
    model: 'R710',
    name: 'FAKE-R710-AP',
    networkStatus: {
      ipAddress: '10.206.78.138',
      externalIpAddress: '210.58.90.254',
      ipAddressType: 'dynamic',
      managementTrafficVlan: 1,
      netmask: '255.255.254.0',
      primaryDnsServer: '10.10.10.10',
      secondaryDnsServer: '10.10.10.10'
    },
    poePort: '1',
    poePortStatus: 'Up 1000Mbps full',
    powerSavingStatus: 'NORMAL',
    radioStatuses: [
      { id: 0, band: '2.4G', transmitterPower: 'max', channel: 8, channelBandwidth: '20', rssi: 50 },
      { id: 1, band: '5G', transmitterPower: 'max', channel: 108, channelBandwidth: '40', rssi: 45 }
    ],
    serialNumber: '121603200805',
    status: '2_00_Operational',
    tags: [''],
    uptime: 19322879,
    venueId: '9a572b2d00ca457eb93811d47ed1e5d1'
  }]
}

const apGroupList = {
  fields: ['name', 'id'],
  totalCount: 2,
  page: 1,
  data: [{
    id: 'apgroup1',
    name: 'Fake-ap-group-1'
  }, {
    id: 'apgroup2',
    name: 'Fake-ap-group-2'
  }]
}

describe('NetworkApsTab', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(apsList))
      ),
      rest.post(
        WifiUrlsInfo.getApGroupsList.url,
        (req, res, ctx) => res(ctx.json(apGroupList))
      ),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesNetwork.url,
        (req, res, ctx) => res(ctx.json(apGroupList))
      ),
      rest.post(
        CommonRbacUrlsInfo.getWifiNetworksList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.get(
        WifiRbacUrlsInfo.getWifiCapabilities.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        WifiRbacUrlsInfo.getApGroupsList.url,
        (_, res, ctx) => res(ctx.json(apGroupList))
      ),
      rest.post(
        CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(rbacApList))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json({
          data: [{
            id: '9a572b2d00ca457eb93811d47ed1e5d1',
            name: 'CRRM-Dev-Venue'
          }]
        }))
      ),
      rest.post(
        SwitchRbacUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json({ totalCount: 0, data: [] }))
      )
    )
  })

  it('should render network APs tab successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <NetworkApsTab />
        </Form>
      </Provider>, {
        route: { params }
      })

    // check AP name is existed on AP table
    expect(await screen.findByText('FAKE-R710-AP')).toBeInTheDocument()
  })
})
