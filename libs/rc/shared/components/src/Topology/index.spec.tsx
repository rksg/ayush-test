import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi }                                                                                   from '@acx-ui/rc/services'
import { CommonUrlsInfo, TopologyDeviceStatus, DeviceTypes, ShowTopologyFloorplanOn, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                            from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, within }                                     from '@acx-ui/test-utils'

import { TopologyTreeContext } from './TopologyTree/TopologyTreeContext'

import { DeviceIcon, TopologyGraph } from '.'


jest.mock('@acx-ui/analytics/components', () => ({
  useIncidentToggles: () => ({}),
  useIncidentsBySeverityQuery: () => ([])
}))

const fields = [
  'deviceType',
  'venueName',
  'serialNumber',
  'switchMac',
  'name',
  'tenantId',
  'apMac',
  'model',
  'syncDataStartTime',
  'customerName',
  'deviceStatus'
]

const graphData = {
  fields,
  totalCount: 1,
  page: null,
  data: [
    {
      edges: [
        {
          from: 'c0:c5:20:b2:10:d5',
          to: '302002029754',
          fromMac: 'C0:C5:20:B2:10:D5',
          toMac: '34:20:E3:1C:E6:10',
          fromName: 'FMF3250Q06J-1',
          toName: '302002029754-C08P',
          poeEnabled: true,
          linkSpeed: '1 Gb/sec',
          poeUsed: 6000,
          poeTotal: 28850,
          connectedPort: '1/1/2',
          connectionType: 'Wired',
          connectionStatus: 'Good',
          fromSerial: 'FMF3250Q06J',
          toSerial: '302002029754',
          connectedPortUntaggedVlan: '1',
          connectedPortTaggedVlan: ''
        },
        {
          from: 'c0:c5:20:aa:32:67',
          to: 'c0:c5:20:b2:10:d5',
          fromMac: 'C0:C5:20:AA:32:67',
          toMac: 'C0:C5:20:B2:10:D5',
          fromName: 'STACK-1',
          toName: 'FMF3250Q06J-1',
          poeEnabled: true,
          linkSpeed: '1 Gb/sec',
          poeUsed: 0,
          poeTotal: 0,
          connectedPort: '1/1/11',
          correspondingPort: '1/1/6',
          connectionType: 'Wired',
          connectionStatus: 'Good',
          fromSerial: 'FEK3224R09T',
          toSerial: 'FMF3250Q06J',
          connectedPortUntaggedVlan: '1',
          correspondingPortUntaggedVlan: '1',
          connectedPortTaggedVlan: '',
          correspondingPortTaggedVlan: ''
        },
        {
          from: 'c0:c5:20:aa:32:67',
          to: '302002029829',
          fromMac: 'C0:C5:20:AA:32:67',
          toMac: '34:20:E3:1C:EA:C0',
          fromName: 'STACK-1',
          toName: '302002029829-C12P',
          poeEnabled: true,
          linkSpeed: '1 Gb/sec',
          poeUsed: 6700,
          poeTotal: 28850,
          connectedPort: '2/1/2',
          connectionType: 'Wired',
          connectionStatus: 'Good',
          fromSerial: 'FEK3224R09T',
          toSerial: '302002029829',
          connectedPortUntaggedVlan: '1',
          connectedPortTaggedVlan: ''
        }
      ],
      nodes: [
        {
          type: 'Switch',
          name: 'STACK-1',
          mac: 'c0:c5:20:aa:32:67',
          serial: 'FEK3224R09T',
          id: 'c0:c5:20:aa:32:67',
          status: 'Operational',
          childCount: 0,
          cloudPort: '1/1/1',
          isConnectedCloud: true
        },
        {
          type: 'Ap',
          name: '302002015736-DEV',
          mac: '34:20:E3:19:79:F0',
          serial: '302002015736',
          id: '302002015736',
          status: 'Operational',
          childCount: 0,
          meshRole: 'DOWN',
          uplink: [],
          downlink: [],
          downlinkChannel: '36(5G)',
          isMeshEnable: true
        },
        {
          type: 'Ap',
          name: '302002029754-C08P',
          mac: '34:20:E3:1C:E6:10',
          serial: '302002029754',
          id: '302002029754',
          status: 'Operational',
          childCount: 0,
          meshRole: 'DOWN',
          uplink: [],
          downlink: [],
          downlinkChannel: '36(5G)',
          uplinkChannel: '144(5G)',
          isMeshEnable: true
        },
        {
          type: 'ApMeshRoot',
          name: '302002029829-C12P',
          mac: '34:20:E3:1C:EA:C0',
          serial: '302002029829',
          id: '302002029829',
          status: 'Operational',
          childCount: 0,
          meshRole: 'RAP',
          uplink: [],
          downlink: [],
          downlinkChannel: '144(5G)',
          isMeshEnable: true
        },
        {
          type: 'Switch',
          name: 'FMF3250Q06J-1',
          mac: 'c0:c5:20:b2:10:d5',
          serial: 'FMF3250Q06J',
          id: 'c0:c5:20:b2:10:d5',
          status: 'Operational',
          childCount: 0,
          cloudPort: '1/1/6',
          isConnectedCloud: false
        }
      ]
    }
  ]
}

// const scaleData = { ...graphData }

// const mock = {
//   inverse: () => mock,
//   multiply: () => mock,
//   translate: () => ({ e: 0, f: 0 })
// }

// Object.defineProperty(global.SVGElement.prototype, 'getScreenCTM', {
//   writable: true,
//   value: jest.fn().mockReturnValue(mock)
// })
// const value = jest.fn()
// Object.defineProperty(global.SVGElement.prototype, 'getBBox', {
//   writable: true,
//   value: value
// })
// value.mockReturnValue({ x: 0, y: 0, width: 0, height: 0 })

// Object.defineProperty(global.SVGElement.prototype, 'getComputedTextLength', {
//   writable: true,
//   value: jest.fn().mockReturnValue(0)
// })

// Object.defineProperty(global.SVGElement.prototype, 'createSVGMatrix', {
//   writable: true,
//   value: jest.fn().mockReturnValue({
//     x: 10,
//     y: 10,
//     inverse: () => {},
//     multiply: () => {}
//   })
// })

// Object.defineProperty(global.SVGElement.prototype, 'width', {
//   writable: true,
//   value: {
//     baseVal: {
//       value: 10
//     }
//   }
// })

// Object.defineProperty(global.SVGElement.prototype, 'height', {
//   writable: true,
//   value: {
//     baseVal: {
//       value: 10
//     }
//   }
// })

const editStackDetail = {
  type: 'device',
  isStack: true,
  rearModule: 'none',
  switchMac: 'c0:c5:20:aa:32:67',
  switchName: 'STACK-0313',
  model: 'ICX7150-C12P',
  id: 'c0:c5:20:aa:32:67',
  syncDataEndTime: 1710384783381,
  firmwareVersion: 'SPR09010h_cd2',
  freeMemory: 379555840,
  clientCount: 3,
  floorplanId: 'e2a04b0989424b9f8386e3a61b5e40c5',
  deviceType: 'DVCNWTYPE_SWITCH',
  serialNumber: 'FEK3224R09T',
  yPercent: 63.3405647277832,
  portsStatus: {
    Down: 27,
    Up: 5
  },
  staticOrDynamic: 'dynamic',
  ipAddress: '10.206.1.112',
  dns: '10.10.10.106',
  cpu: 10,
  stackMember: false,
  cliApplied: false,
  subnetMask: '255.255.255.0',
  unitSerialNumbers: 'FEK3224R09T,FEK3224R07X',
  modules: 'stack',
  venueName: 'Topology-Venue',
  name: 'STACK-0313',
  activeSerial: 'FEK3224R09T',
  syncedAdminPassword: true,
  suspendingDeployTime: '',
  cloudPort: '1/1/1',
  ipFullContentParsed: true,
  stackMemberOrder: 'FEK3224R09T,FEK3224R07X',
  numOfUnits: 2,
  memory: 62,
  switchType: 'router',
  crtTime: '1701070759780',
  configReady: true,
  portModuleIds: 'FEK3224R07XFEK3224R09T',
  deviceStatus: 'ONLINE',
  vlanMapping: '{"1":"DEFAULT-VLAN","200":"VLAN-200"}',
  // eslint-disable-next-line max-len
  temperatureGroups: '[{"serialNumber":"FEK3224R09T","stackId":"C0:C5:20:AA:32:67","temperatureSlotList":[{"slotNumber":3,"temperatureValue":53.5},{"slotNumber":4,"temperatureValue":53.5},{"slotNumber":1,"temperatureValue":69},{"slotNumber":2,"temperatureValue":10}]},{"serialNumber":"FEK3224R07X","stackId":"C0:C5:20:AA:2C:A3","temperatureSlotList":[{"slotNumber":1,"temperatureValue":62.5},{"slotNumber":4,"temperatureValue":48.5},{"slotNumber":2,"temperatureValue":10},{"slotNumber":3,"temperatureValue":48.5}]}]',
  sendedHostname: true,
  venueId: '91e6862c732b412889e70ad511c239ce',
  unitId: 1,
  hasPoECapability: true,
  firmware: 'SPR09010h_cd2',
  timestamp: 1710384742050,
  adminPassword: '7f^MX+Uf0j',
  syncedSwitchConfig: true,
  xPercent: 72.7272720336914,
  defaultGateway: '10.206.1.254',
  stackMembers: [
    {
      model: 'ICX7150-C12P',
      id: 'FEK3224R09T'
    },
    {
      model: 'ICX7150-C12P',
      id: 'FEK3224R07X'
    }
  ],
  uptime: '98 days, 18:3:33.00',
  extIp: '210.58.90.254',
  poeUsage: {
    poeFree: 219150,
    poeTotal: 248000,
    poeUtilization: 28850
  },
  totalMemory: 1019875328,
  tenantId: 'cc0629e4eb974498aa9f51a2d1a1311f',
  family: 'ICX7150-C12P',
  numOfPorts: 32
}

const editApDetail = {
  isMeshEnable: true,
  downLinkCount: 0,
  serialNumber: '302002015736',
  lastUpdTime: '1.710314749626E12',
  lastSeenTime: '2024-03-14T02:53:41.758Z',
  name: '302002015736-DEV',
  model: 'R550',
  fwVersion: '6.2.1.103.2579',
  venueId: '91e6862c732b412889e70ad511c239ce',
  venueName: 'Topology-Venue',
  deviceStatus: '2_00_Operational',
  deviceStatusSeverity: '2_Operational',
  IP: '10.206.1.21',
  extIp: '210.58.90.254',
  apMac: '34:20:E3:19:79:F0',
  apStatusData: {
    APRadio: [
      {
        txPower: 'max',
        channel: 6,
        band: '2.4G',
        Rssi: null,
        operativeChannelBandwidth: '20',
        radioId: 0
      },
      {
        txPower: 'max',
        channel: 140,
        band: '5G',
        Rssi: null,
        operativeChannelBandwidth: '80',
        radioId: 1
      }
    ],
    APSystem: {
      uptime: 1970506,
      ipType: 'dynamic',
      netmask: '255.255.255.0',
      gateway: '10.206.1.254',
      primaryDnsServer: '10.10.10.106',
      secondaryDnsServer: '10.10.10.10',
      secureBootEnabled: false,
      managementVlan: 1,
      poeModeSetting: 0,
      poeMode: 2
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
  downlink: [],
  uplink: [],
  meshRole: 'DOWN',
  hops: 0,
  deviceGroupId: '1d137a2cf4dd46818ab9f987efa83cdf',
  clients: 1,
  downlinkCount: 0,
  deviceGroupName: '',
  deviceModelType: 'Indoor',
  healthStatus: 'Excellent'
}

describe('Topology', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    global.window.innerWidth = 1920
    global.window.innerHeight = 1080
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getTopology.url,
        (req, res, ctx) => {return res(ctx.json(graphData))}),
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(editStackDetail))),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ data: [editApDetail], totalCount: 0 })))
    )
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
      venueId: '7231da344778480d88f37f0cca1c534f'
    }

    const scale = 1
    const translate = [0,0]
    const setTranslate = jest.fn()
    render(<Provider>
      <TopologyTreeContext.Provider value={{ scale, translate, setTranslate }}>
        <TopologyGraph
          showTopologyOn={ShowTopologyFloorplanOn.VENUE_OVERVIEW}
          venueId='7231da344778480d88f37f0cca1c534f' />
      </TopologyTreeContext.Provider></Provider>,{
      route: { params }
    })

    await screen.findByTestId('topologyGraph')

    const zoomInButton = await screen.findByTestId('graph-zoom-in')
    await userEvent.click(zoomInButton)
    const zoomOutButton = await screen.findByTestId('graph-zoom-out')
    await userEvent.click(zoomOutButton)
    const zoomFitButton = await screen.findByTestId('graph-zoom-fit')
    await userEvent.click(zoomFitButton)

    const nodeCloudElement = screen.queryByTestId('node_Cloud')
    expect(nodeCloudElement).toBeInTheDocument()
  })

  it('should render modal fullscreen correctly', async () => {
    const params = {
      tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
      venueId: '7231da344778480d88f37f0cca1c534f'
    }

    const scale = 1
    const translate = [0,0]
    const setTranslate = jest.fn()
    render(<Provider>
      <TopologyTreeContext.Provider value={{ scale, translate, setTranslate }}>
        <TopologyGraph
          showTopologyOn={ShowTopologyFloorplanOn.VENUE_OVERVIEW}
          venueId='7231da344778480d88f37f0cca1c534f' />
      </TopologyTreeContext.Provider></Provider>,{
      route: { params }
    })

    const fullScreenButton = await screen.findByTestId('enter-fullscreen')
    await userEvent.click(fullScreenButton)

    const dialog = await screen.findByRole('dialog')
    await waitFor(async () =>
      expect(await within(dialog).findByTestId('topologyGraph')).toBeInTheDocument()
    )
  })

  it('should render hover device and show tooltip panel correctly', async () => {
    const params = {
      tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
      venueId: '7231da344778480d88f37f0cca1c534f'
    }

    const scale = 1
    const translate = [0,0]
    const setTranslate = jest.fn()
    render(<Provider>
      <TopologyTreeContext.Provider value={{ scale, translate, setTranslate }}>
        <TopologyGraph
          showTopologyOn={ShowTopologyFloorplanOn.VENUE_OVERVIEW}
          venueId='7231da344778480d88f37f0cca1c534f' />
      </TopologyTreeContext.Provider></Provider>,{
      route: { params }
    })

    const deviceNode = await screen.findByTestId('node_c0:c5:20:aa:32:67')
    const node = { data: { id: 'c0:c5:20:aa:32:67' } }
    const event = { nativeEvent: { layerX: 10, layerY: 10 } }
    fireEvent.mouseEnter(deviceNode, { data: node, ...event })
  })

  it('should render search device correctly', async () => {
    const params = {
      tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
      venueId: '7231da344778480d88f37f0cca1c534f'
    }

    const scale = 1
    const translate = [0,0]
    const setTranslate = jest.fn()
    render(<Provider>
      <TopologyTreeContext.Provider value={{ scale, translate, setTranslate }}>
        <TopologyGraph
          showTopologyOn={ShowTopologyFloorplanOn.VENUE_OVERVIEW}
          venueId='7231da344778480d88f37f0cca1c534f' />
      </TopologyTreeContext.Provider></Provider>,{
      route: { params }
    })

    const searchBar = await screen.findByTestId('searchNodes')
    const searchInput = await within(searchBar).findByRole('combobox')
    fireEvent.change(searchInput, { target: { value: 'c0:c5:20:aa:32:67' } })
  })

  it('should render expand/collapse device correctly', async () => {
    const params = {
      tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
      venueId: '7231da344778480d88f37f0cca1c534f'
    }

    const scale = 1
    const translate = [0,0]
    const setTranslate = jest.fn()
    render(<Provider>
      <TopologyTreeContext.Provider value={{ scale, translate, setTranslate }}>
        <TopologyGraph
          showTopologyOn={ShowTopologyFloorplanOn.VENUE_OVERVIEW}
          venueId='7231da344778480d88f37f0cca1c534f' />
      </TopologyTreeContext.Provider></Provider>,{
      route: { params }
    })


    const collapseButton = await screen.findAllByTestId('collapseButton')
    await userEvent.click(collapseButton[0])
    const expandButton = await screen.findAllByTestId('expandButton')
    await userEvent.click(expandButton[0])
  })


  it('should render device icons correctly', async () => {
    const params = {
      tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
      venueId: '7231da344778480d88f37f0cca1c534f'
    }
    const { container } = render(<Provider>
      <DeviceIcon deviceType={DeviceTypes.Switch} deviceStatus={TopologyDeviceStatus.Operational} />
      <DeviceIcon deviceType={DeviceTypes.SwitchStack}
        deviceStatus={TopologyDeviceStatus.Operational} />
      <DeviceIcon deviceType={DeviceTypes.Ap} deviceStatus={TopologyDeviceStatus.Operational} />
      <DeviceIcon deviceType={DeviceTypes.Cloud} deviceStatus={TopologyDeviceStatus.Operational} />
      <DeviceIcon deviceType={DeviceTypes.ApMesh} deviceStatus={TopologyDeviceStatus.Operational} />
      <DeviceIcon deviceType={DeviceTypes.ApMeshRoot}
        deviceStatus={TopologyDeviceStatus.Operational} />
      <DeviceIcon deviceType={DeviceTypes.ApWired}
        deviceStatus={TopologyDeviceStatus.Operational} />
      <DeviceIcon deviceType={DeviceTypes.Unknown} deviceStatus={TopologyDeviceStatus.Unknown} />
    </Provider>,{
      route: { params }
    })

    expect(container).toMatchSnapshot()
  })
})
