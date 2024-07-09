import { rest } from 'msw'

import { switchApi }                  from '@acx-ui/rc/services'
import { Node, SwitchUrlsInfo }       from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import NodeTooltip from './NodeTooltip'

const nodeData = {
  type: 'Switch',
  name: 'STACK-0313',
  mac: 'c0:c5:20:aa:32:67',
  serial: 'FEK3224R09T',
  id: 'c0:c5:20:aa:32:67',
  status: 'Operational',
  childCount: 0,
  parentId: 'c0:c5:20:b2:10:d5',
  cloudPort: '1/1/1',
  isConnectedCloud: true,
  children: [
    {
      type: 'Switch',
      name: 'FMF3250Q06J-1',
      mac: 'c0:c5:20:b2:10:d5',
      serial: 'FMF3250Q06J',
      id: 'c0:c5:20:b2:10:d5',
      status: 'Disconnected',
      childCount: 0,
      cloudPort: '1/1/7',
      isConnectedCloud: false,
      children: [
        {
          type: 'Ap',
          name: '302002029754-C08P',
          mac: '34:20:E3:1C:E6:10',
          serial: '302002029754',
          id: '302002029754',
          status: 'Disconnected',
          childCount: 0,
          parentId: 'c0:c5:20:b2:10:d5',
          meshRole: 'DISABLED',
          uplink: [],
          downlink: [],
          downlinkChannel: '36(5G)',
          uplinkChannel: '144(5G)',
          isMeshEnable: true,
          children: []
        }
      ]
    },
    {
      type: 'ApMeshRoot',
      name: '302002029829-C12P',
      mac: '34:20:E3:1C:EA:C0',
      serial: '302002029829',
      id: '302002029829',
      status: 'Operational',
      childCount: 0,
      parentId: 'c0:c5:20:aa:32:67',
      meshRole: 'RAP',
      uplink: [],
      downlink: [],
      downlinkChannel: '108(5G)',
      isMeshEnable: true,
      children: []
    }
  ]
}

const nodeDetail = {
  type: 'device',
  isStack: true,
  rearModule: 'none',
  switchMac: 'c0:c5:20:aa:32:67',
  switchName: 'STACK-0313',
  model: 'ICX7150-C12P',
  id: 'c0:c5:20:aa:32:67',
  syncDataEndTime: 1710745623751,
  firmwareVersion: 'SPR09010h_cd2',
  freeMemory: 376397824,
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
  memory: 63,
  switchType: 'router',
  crtTime: '1701070759780',
  configReady: true,
  portModuleIds: 'FEK3224R07XFEK3224R09T',
  deviceStatus: 'ONLINE',
  vlanMapping: '{"1":"DEFAULT-VLAN","200":"VLAN-200"}',
  // eslint-disable-next-line max-len
  temperatureGroups: '[{"serialNumber":"FEK3224R09T","stackId":"C0:C5:20:AA:32:67","temperatureSlotList":[{"slotNumber":3,"temperatureValue":54.5},{"slotNumber":4,"temperatureValue":54.5},{"slotNumber":1,"temperatureValue":70.5},{"slotNumber":2,"temperatureValue":10}]},{"serialNumber":"FEK3224R07X","stackId":"C0:C5:20:AA:2C:A3","temperatureSlotList":[{"slotNumber":1,"temperatureValue":64},{"slotNumber":4,"temperatureValue":50},{"slotNumber":2,"temperatureValue":10},{"slotNumber":3,"temperatureValue":50}]}]',
  sendedHostname: true,
  venueId: '91e6862c732b412889e70ad511c239ce',
  unitId: 1,
  hasPoECapability: true,
  firmware: 'SPR09010h_cd2',
  timestamp: 1710745584983,
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
  uptime: '102 days, 22:17:36.00',
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

const r1RaApiURL = '/api/a4rc/api/rsa-data-api/graphql/analytics'


const expectedIncidents = {
  incidentCount0: { P1: 1, P2: 2, P3: 3, P4: 4 },
  incidentCount1: { P1: 4, P2: 3, P3: 2, P4: 1 },
  incidentCount2: { P1: 0, P2: 3, P3: 2, P4: 0 }
}

describe('NodeTooltip', () => {
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    global.window.innerWidth = 1920
    global.window.innerHeight = 1080
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(nodeDetail))),
      rest.post(
        r1RaApiURL,
        (req, res, ctx) => res(ctx.json(expectedIncidents))
      )
    )
  })
  it('should render correctly', async () => {
    const params = {
      tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
      venueId: '7231da344778480d88f37f0cca1c534f'
    }
    const position = { x: 100, y: 180 }
    render(<Provider>
      <NodeTooltip
        tooltipPosition={position}
        tooltipNode={nodeData as unknown as Node}
        closeTooltip={jest.fn()} />
    </Provider>,{
      route: { params }
    })
    expect(await screen.findByText('STACK-0313')).toBeVisible()
    expect(await screen.findByText('ICX7150-C12P')).toBeVisible()
    expect(await screen.findByText('c0:c5:20:aa:32:67')).toBeVisible()
    expect(await screen.findByText('10.206.1.112')).toBeVisible()
    expect(await screen.findByText('Operational')).toBeVisible()
  })
})
