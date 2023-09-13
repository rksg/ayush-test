import { Form } from 'antd'
import { rest } from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo }                          from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

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

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    // check AP name is existed on AP table
    expect(await screen.findByText('FAKE-R710-AP')).toBeInTheDocument()
  })
})
