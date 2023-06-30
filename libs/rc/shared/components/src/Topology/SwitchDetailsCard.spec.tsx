import '@testing-library/jest-dom'

import { SwitchViewModel }          from '@acx-ui/rc/utils'
import { dataApiURL, Provider }     from '@acx-ui/store'
import { mockGraphqlQuery, render } from '@acx-ui/test-utils'

import { SwitchDetailsCard } from './SwitchDetailsCard'

const switchDetail = {
  type: 'Switch',
  isStack: false,
  rearModule: 'none',
  switchMac: 'c0:c5:20:aa:24:7b',
  switchName: 'test',
  model: 'ICX7150-C12P',
  id: 'c0:c5:20:aa:24:7b',
  firmwareVersion: 'SPR09010e',
  freeMemory: 229490688,
  clientCount: 1,
  floorplanId: '',
  deviceType: 'DVCNWTYPE_SWITCH',
  serialNumber: 'FEK3224R08J',
  yPercent: 0,
  portsStatus: {
    Down: 15,
    Up: 1
  },
  staticOrDynamic: 'dynamic',
  ipAddress: '10.206.10.16',
  dns: '10.10.10.106',
  cpu: 20,
  stackMember: false,
  cliApplied: true,
  subnetMask: '255.255.254.0',
  unitSerialNumbers: 'FEK3224R08J',
  modules: 'switch',
  venueName: 'CLI_PROVIOSION',
  isIpFullContentParsed: true,
  name: 'test',
  activeSerial: 'FEK3224R08J',
  suspendingDeployTime: '',
  cloudPort: '1/1/1',
  stackMemberOrder: '',
  numOfUnits: 1,
  memory: 77,
  switchType: 'router',
  portModuleIds: 'FEK3224R08J',
  configReady: true,
  deviceStatus: 'ONLINE',
  sendedHostname: true,
  venueId: '4924f2938f674234ad70e5110f53900e',
  firmware: 'SPR09010e',
  timestamp: 1667372099489,
  xPercent: 0,
  syncedSwitchConfig: true,
  lastSeenTime: '11/12/2022',
  defaultGateway: '10.206.11.254',
  stackMembers: [],
  uptime: '1 days, 0:42:16.00',
  poeUsage: {
    poeFree: 124000,
    poeTotal: 124000,
    poeUtilization: 0
  },
  totalMemory: 1019744256,
  formStacking: false,
  tenantId: '4a3bc3bf3116490496ee2e6e1cafe74e',
  family: 'ICX7150-C12P',
  numOfPorts: 16
}

const sample = { P1: 1, P2: 2, P3: 3, P4: 4 }

describe('Topology Switch Card', () => {
  it('should render orrectly', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
      data: { network: { hierarchyNode: { ...sample } } }
    })
    const { asFragment } = render(<Provider><SwitchDetailsCard
      switchDetail={switchDetail as SwitchViewModel}
      isLoading={false}
    /></Provider>, { route: {} })

    expect(asFragment()).toMatchSnapshot()
  })
})