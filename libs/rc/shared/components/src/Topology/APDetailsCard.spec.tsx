import '@testing-library/jest-dom'

import { ApVenueStatusEnum, ApViewModel, CelluarInfo } from '@acx-ui/rc/utils'
import { dataApiURL, Provider }                        from '@acx-ui/store'
import { mockGraphqlQuery, render }                    from '@acx-ui/test-utils'

import { APDetailsCard } from './APDetailsCard'

const apDetail = {
  serialNumber: '132106000082',
  lastSeenTime: '2023-02-07T08:31:52.927Z',
  name: 'R760-181-66',
  model: 'R760',
  fwVersion: '6.2.1.103.1610',
  venueId: '1b48f908d285498d98c5a49ce65a8358',
  venueName: 'ThirdRadio',
  deviceStatus: '2_00_Operational',
  deviceStatusSeverity: ApVenueStatusEnum.OPERATIONAL,
  IP: '192.168.181.66',
  extIp: '134.242.238.1',
  apMac: 'B4:79:C8:3E:C8:70',
  channel24: {
    channel: '0',
    operativeChannelBandwidth: '20',
    txPower: 'max'
  },
  channel50: {
    channel: '2',
    operativeChannelBandwidth: '80',
    txPower: 'max'
  },
  channelL50: {
    channel: '2',
    operativeChannelBandwidth: '80',
    txPower: 'max'
  },
  channelU50: {
    channel: '2',
    operativeChannelBandwidth: '80',
    txPower: 'max'
  },
  channel60: {
    channel: '2',
    operativeChannelBandwidth: '80',
    txPower: 'max'
  },
  apStatusData: {
    APRadio: [
      {
        txPower: 'max',
        channel: '0',
        band: '2.4G',
        Rssi: '',
        operativeChannelBandwidth: '20',
        radioId: 0
      },
      {
        txPower: 'max',
        channel: '0',
        band: '5G',
        Rssi: '',
        operativeChannelBandwidth: '80',
        radioId: 1
      },
      {
        txPower: 'max',
        channel: '0',
        band: '5G',
        Rssi: '',
        operativeChannelBandwidth: '80',
        radioId: 2
      }
    ],
    cellularInfo: {} as CelluarInfo,
    APSystem: {
      uptime: 333842,
      ipType: 'dynamic',
      netmask: '255.255.255.0',
      gateway: '192.168.181.1',
      primaryDnsServer: '8.8.8.8',
      secondaryDnsServer: 'null'
    },
    lanPortStatus: [
      {
        port: '0',
        phyLink: 'Down  '
      },
      {
        port: '1',
        phyLink: 'Up 1000Mbps full'
      }
    ]
  },
  meshRole: 'DISABLED',
  deviceGroupId: '00dd4e142110489b9c21bcb1a2a5e93e',
  deviceGroupName: '',
  deviceModelType: 'Indoor',
  downLinkCount: 2
}

const apDetailWithNullTraffic = {
  serialNumber: '132106000082',
  lastSeenTime: '2023-02-07T08:31:52.927Z',
  name: 'R760-181-66',
  model: 'R760',
  fwVersion: '6.2.1.103.1610',
  venueId: '1b48f908d285498d98c5a49ce65a8358',
  venueName: 'ThirdRadio',
  deviceStatus: '2_00_Operational',
  deviceStatusSeverity: ApVenueStatusEnum.OPERATIONAL,
  IP: '192.168.181.66',
  extIp: '134.242.238.1',
  apMac: 'B4:79:C8:3E:C8:70',
  channel24: {},
  channel50: {},
  channelL50: {},
  channelU50: {},
  channel60: {},
  apStatusData: {
    APRadio: [
      {
        txPower: 'max',
        channel: '0',
        band: '2.4G',
        Rssi: '',
        operativeChannelBandwidth: '20',
        radioId: 0
      },
      {
        txPower: 'max',
        channel: '0',
        band: '5G',
        Rssi: '',
        operativeChannelBandwidth: '80',
        radioId: 1
      },
      {
        txPower: 'max',
        channel: '0',
        band: '5G',
        Rssi: '',
        operativeChannelBandwidth: '80',
        radioId: 2
      }
    ],
    cellularInfo: {} as CelluarInfo,
    APSystem: {
      uptime: 333842,
      ipType: 'dynamic',
      netmask: '255.255.255.0',
      gateway: '192.168.181.1',
      primaryDnsServer: '8.8.8.8',
      secondaryDnsServer: 'null'
    },
    lanPortStatus: [
      {
        port: '0',
        phyLink: 'Down  '
      },
      {
        port: '1',
        phyLink: 'Up 1000Mbps full'
      }
    ]
  },
  meshRole: 'DISABLED',
  deviceGroupId: '00dd4e142110489b9c21bcb1a2a5e93e',
  deviceGroupName: '',
  deviceModelType: 'Indoor',
  downLinkCount: 2
}

const sample = { P1: 1, P2: 2, P3: 3, P4: 4 }


describe('Topology AP Card', () => {
  it('should render correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
      data: { network: { hierarchyNode: { ...sample } } }
    })
    const { asFragment } = render(<Provider><APDetailsCard
      apDetail={apDetail as ApViewModel}
      isLoading={false}
    /></Provider>, {
      route: {}
    })
    const fragment = asFragment()
    // eslint-disable-next-line testing-library/no-node-access
    await fragment.querySelector('div[_echarts_instance_^="ec_"]')
      ?.removeAttribute('_echarts_instance_')

    expect(asFragment()).toMatchSnapshot()
  })

  it('should show empty traffic data', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
      data: { network: { hierarchyNode: { ...sample } } }
    })
    const { asFragment } = render(<Provider><APDetailsCard
      apDetail={apDetailWithNullTraffic as ApViewModel}
      isLoading={false}
    /></Provider>, {
      route: {}
    })
    const fragment = asFragment()
    // eslint-disable-next-line testing-library/no-node-access
    await fragment.querySelector('div[_echarts_instance_^="ec_"]')
      ?.removeAttribute('_echarts_instance_')
  })
})