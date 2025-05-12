import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { apApi }        from '@acx-ui/rc/services'
import {
  CommonRbacUrlsInfo,
  CommonUrlsInfo,
  SwitchRbacUrlsInfo,
  SwitchUrlsInfo,
  WifiRbacUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store  }                      from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import { apDetails, apLanPorts, apRadio, currentAP, wifiCapabilities, currentAPWithModelR650, ApCapabilitiesR650 } from '../../__tests__/fixtures'

import { ApProperties } from '.'

const params = {
  venueId: 'venue-id',
  tenantId: 'tenant-id',
  serialNumber: 'serial-number'
}

const portData = {
  data: [{
    cloudPort: true,
    stack: false,
    name: 'GigabitEthernet1/1/7',
    portId: 'c0-c5-20-b2-08-11_1-1-7',
    status: 'Up',
    adminStatus: 'Up',
    vlanIds: '1',
    portSpeed: '1 Gb/sec',
    poeUsed: 0,
    poeTotal: 0,
    signalIn: 0,
    signalOut: 0,
    crcErr: '0',
    inErr: '0',
    outErr: '0',
    opticsType: '1 Gbits per second copper',
    switchUnitId: 'FMF3250Q06K',
    poeEnabled: true,
    usedInFormingStack: false,
    portIdentifier: '1/1/7',
    unTaggedVlan: '1',
    inDiscard: '0',
    broadcastIn: '13678856',
    broadcastOut: '1434',
    multicastIn: '58666052',
    multicastOut: '271660',
    poeType: 'n/a',
    switchMac: 'c0:c5:20:b2:08:11',
    id: 'c0-c5-20-b2-08-11_1-1-7',
    neighborName: 'FMF3250Q0BT-0702-R1',
    venueId: '3d995ef9a9c6426893629a89506f34fe',
    ingressAclName: '',
    egressAclName: '',
    vsixIngressAclName: '',
    vsixEgressAclName: '',
    lagName: '',
    switchName: 'R2',
    switchSerial: 'c0:c5:20:b2:08:11',
    lagId: '0',
    deviceStatus: 'ONLINE',
    unitStatus: 'Standalone',
    unitState: 'ONLINE',
    switchModel: 'ICX7150-C08P',
    neighborMacAddress: 'C0:C5:20:B7:95:09',
    syncedSwitchConfig: true,
    mediaType: 'MEDIA_TYPE_EMPTY',
    poeUsage: '0/0W (0%)'
  }]
}

const switchData = {
  type: 'device',
  isStack: false,
  rearModule: 'none',
  switchMac: 'C0:C5:20:B2:08:11',
  switchName: 'R2',
  model: 'ICX7150-C08P',
  id: 'c0:c5:20:b2:08:11',
  syncDataEndTime: 1722930373335,
  firmwareVersion: 'SPS09010h_cd2',
  freeMemory: 437207040,
  clientCount: 3,
  floorplanId: '',
  deviceType: 'DVCNWTYPE_SWITCH',
  serialNumber: 'FMF3250Q06K',
  yPercent: 0,
  portsStatus: {
    Down: 7,
    Up: 3
  },
  staticOrDynamic: 'dynamic',
  ipAddress: '10.206.1.58',
  dns: '10.10.10.106',
  cpu: 8,
  stackMember: false,
  cliApplied: false,
  subnetMask: '255.255.255.0',
  unitSerialNumbers: 'FMF3250Q06K',
  modules: 'switch',
  venueName: 'Ring_Topology_6F',
  name: 'R2',
  activeSerial: 'FMF3250Q06K',
  syncedAdminPassword: false,
  suspendingDeployTime: '',
  cloudPort: '1/1/7',
  ipFullContentParsed: true,
  stackMemberOrder: '',
  numOfUnits: 1,
  memory: 57,
  switchType: 'switch',
  crtTime: '1713785846270',
  configReady: true,
  portModuleIds: 'FMF3250Q06K',
  deviceStatus: 'ONLINE',
  vlanMapping: '{"1":"DEFAULT-VLAN"}',
  // eslint-disable-next-line max-len
  temperatureGroups: '[{"serialNumber":"FMF3250Q06K","stackId":"C0:C5:20:B2:08:11","temperatureSlotList":[{"slotNumber":3,"temperatureValue":58.5},{"slotNumber":4,"temperatureValue":58.5},{"slotNumber":1,"temperatureValue":69},{"slotNumber":2,"temperatureValue":52.5}]}]',
  sendedHostname: true,
  venueId: '3d995ef9a9c6426893629a89506f34fe',
  unitId: 1,
  hasPoECapability: true,
  firmware: 'SPS09010h_cd2',
  adminPassword: '',
  timestamp: 1722930360939,
  syncedSwitchConfig: true,
  xPercent: 0,
  defaultGateway: '10.206.1.254',
  stackMembers: [],
  extIp: '210.58.90.254',
  uptime: '94 days, 23:19:50.00',
  poeUsage: {
    poeFree: 33150,
    poeTotal: 62000,
    poeUtilization: 28850
  },
  totalMemory: 1019875328,
  tenantId: '20788b98365b427e8bedab7faa11b48b',
  family: 'ICX7150-C08P',
  numOfPorts: 10
}

const lagList = [
  {
    id: 'b5a96cc814354616a50c724a758fd2d6',
    lagId: 1,
    name: 'lag56',
    type: 'static',
    ports: [
      '1/1/5',
      '1/1/6'
    ],
    untaggedVlan: '1',
    switchId: 'c0:c5:20:b2:08:11',
    lastName: 'lag567',
    realRemove: true
  },
  {
    id: 'f7407e6bffc24e8b86a614a493038980',
    lagId: 1,
    name: 'lag567',
    type: 'static',
    ports: [
      '1/1/5',
      '1/1/6'
    ],
    untaggedVlan: '1',
    switchId: 'c0:c5:20:b2:08:11',
    realRemove: true
  }
]

const mockedApLldpNeighbors = {
  detectedTime: '2022-12-16T06:22:23.337+0000',
  neighbors: [
    {
      neighborManaged: false,
      neighborSerialNumber: '987654321',
      lldpInterface: 'eth0',
      lldpVia: 'LLDP',
      lldpRID: '5',
      lldpTime: '7 days, 21:03:20',
      lldpChassisID: 'mac d8:38:fc:36:8b:c0',
      lldpSysName: 'hank-hao-r610',
      lldpSysDesc: 'Ruckus R610 Multimedia Hotzone Wireless AP/SW Version: 6.2.1.103.2578',
      lldpMgmtIP: '10.206.78.111',
      lldpCapability: 'Bridge, on;Router, off;WLAN AP, on',
      lldpPortID: 'mac d8:38:fc:36:8b:c0',
      lldpPortDesc: 'eth0',
      lldpMFS: null,
      lldpPMDAutoNeg: 'supported: yes, enabled: yes',
      lldpAdv: '10Base-T, HD: yes, FD: yes;100Base-TX, HD: yes, FD: yes;10Base-T, HD: no, FD: yes',
      lldpMAUOperType: '100BaseTXFD - 2 pair category 5 UTP, full duplex mode',
      lldpMDIPower: null,
      lldpDeviceType: null,
      lldpPowerPairs: null,
      lldpClass: 'class 0',
      lldpPowerType: null,
      lldpPowerSource: null,
      lldpPowerPriority: null,
      lldpPDReqPowerVal: null,
      lldpPSEAllocPowerVal: null,
      lldpUPOE: '0'
    },
    {
      neighborManaged: true,
      neighborSerialNumber: '123456789',
      lldpInterface: 'eth1',
      lldpVia: 'LLDP',
      lldpRID: '7',
      lldpTime: '3 days, 21:03:20',
      lldpChassisID: 'mac d8:38:fc:36:8b:cc',
      lldpSysName: 'Jacky-r610',
      lldpSysDesc: 'Ruckus R610 Multimedia Hotzone Wireless AP/SW Version: 6.2.1.103.2578',
      lldpMgmtIP: '10.206.78.222',
      lldpCapability: 'Bridge, on;Router, off;WLAN AP, on',
      lldpPortID: 'mac d8:38:fc:36:8b:cc',
      lldpPortDesc: 'eth1',
      lldpMFS: null,
      lldpPMDAutoNeg: 'supported: yes, enabled: yes',
      lldpAdv: '10Base-T, HD: no, FD: yes;100Base-TX, HD: yes, FD: yes;1000Base-T, HD: no, FD: yes',
      lldpMAUOperType: '100BaseTXFD - 2 pair category 5 UTP, full duplex mode',
      lldpMDIPower: null,
      lldpDeviceType: null,
      lldpPowerPairs: null,
      lldpClass: 'class 4',
      lldpPowerType: 2,
      lldpPowerSource: null,
      lldpPowerPriority: null,
      lldpPDReqPowerVal: null,
      lldpPSEAllocPowerVal: '24000',
      lldpUPOE: '0'
    }
  ]
}

const mockedInitPokeSocketFn = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useApContext: () => params,
  initPokeSocket: (subscriptionId: string, handler: () => void) => {
    return mockedInitPokeSocketFn(subscriptionId, handler)
  },
  closePokeSocket: () => jest.fn()
}))

const mockedSocket = {
  on: (eventName: string, handler: () => void) => {
    if (eventName === 'connectedSocketEvent') setTimeout(handler, 0)
  }
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ venueId: 'mockVenueId', serialNumber: '422039000034' })
}))

describe('ApProperties', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (req, res, ctx) => res(ctx.json({
          address: {
            latitude: 37.4112751,
            longitude: -122.0191908
          }
        }))
      ),
      rest.get(
        CommonUrlsInfo.getVenueSettings.url,
        (req, res, ctx) => res(ctx.json({
          apPassword: 'admin!234'
        }))
      ),
      rest.get(
        WifiRbacUrlsInfo.getApOperational.url.replace('?operational=true', ''),
        (_, res, ctx) => res(ctx.json({
          loginPassword: 'admin!234'
        }))
      ),
      rest.post(
        CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({
          serialNumber: '422039000034',
          apGroupId: 'be41e3513eb7446bbdebf461dec67ed3',
          name: 'fake_AP'
        }))
      ),
      rest.post(
        WifiRbacUrlsInfo.getApGroupsList.url,
        (_, res, ctx) => res(ctx.json({
          totalCount: 1, page: 1, data: [
            {
              id: '1724eda6f49e4223be36f864f46faba5',
              name: ''
            }
          ]
        }))
      ),
      rest.get(
        WifiUrlsInfo.getApLanPorts.url,
        (req, res, ctx) => res(ctx.json(apLanPorts))
      ),
      rest.get(
        WifiRbacUrlsInfo.getApLanPorts.url,
        (req, res, ctx) => res(ctx.json(apLanPorts))
      ),
      rest.get(
        WifiUrlsInfo.getApRadioCustomization.url,
        (req, res, ctx) => res(ctx.json(apRadio))
      ),
      rest.get(
        WifiUrlsInfo.getApCapabilities.url,
        (_, res, ctx) => res(ctx.json(wifiCapabilities))
      ),
      rest.get(
        WifiUrlsInfo.getApValidChannel.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        WifiRbacUrlsInfo.getApRadioCustomization.url,
        (req, res, ctx) => res(ctx.json(apRadio))
      ),
      rest.get(
        WifiRbacUrlsInfo.getApCapabilities.url,
        (_, res, ctx) => {
          return res(ctx.json(ApCapabilitiesR650))
        }
      ),
      rest.get(
        WifiRbacUrlsInfo.getApValidChannel.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        SwitchUrlsInfo.getSwitchPortlist.url,
        (req, res, ctx) => res(ctx.json(portData))
      ),
      rest.post(SwitchRbacUrlsInfo.getSwitchPortlist.url,
        (req, res, ctx) => res(ctx.json(portData))
      ),
      rest.get(
        SwitchUrlsInfo.getSwitchDetailHeader.url,
        (req, res, ctx) => res(ctx.json(switchData))
      ),
      rest.get(SwitchRbacUrlsInfo.getSwitchDetailHeader.url,
        (req, res, ctx) => res(ctx.json(switchData))
      ),
      rest.get(
        SwitchUrlsInfo.getLagList.url,
        (req, res, ctx) => res(ctx.json(lagList))
      ),
      rest.get(SwitchRbacUrlsInfo.getLagList.url,
        (req, res, ctx) => res(ctx.json(lagList))
      ),
      rest.post(SwitchRbacUrlsInfo.getSwitchList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        SwitchUrlsInfo.getFlexAuthenticationProfiles.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        WifiRbacUrlsInfo.getApNeighbors.url,
        (_, res, ctx) => {
          return res(ctx.json({ ...mockedApLldpNeighbors }))
        }
      ),
      rest.patch(
        WifiRbacUrlsInfo.detectApNeighbors.url,
        (req, res, ctx) => {
          return res(ctx.json({ requestId: '123456789' }))
        }
      ),
      rest.patch(
        WifiUrlsInfo.detectApNeighbors.url,
        (req, res, ctx) => {
          return res(ctx.json({ requestId: '123456789' }))
        }
      )
    )
  })

  beforeEach(() => {
    mockedInitPokeSocketFn.mockImplementation(() => mockedSocket)
  })

  afterEach(() => {
    mockedInitPokeSocketFn.mockRestore()
  })

  it('should render correctly', async () => {
    render(<Provider>
      <ApProperties
        currentAP={currentAP}
        apDetails={apDetails}
        isLoading={false}
      /></Provider>, { route: { params } })
    expect(screen.getByText('AP Properties')).toBeVisible()
    fireEvent.click(screen.getByText('More'))
    const button = screen.getByRole('button', { name: /close/i })
    await userEvent.click(button)
  })

  it('should render show PoE related info correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockedInitPokeSocketFn.mockImplementation((requestId: string, handler: () => void) => {
      setTimeout(handler, 0) // Simulate receving the message from websocket
      return mockedSocket
    })
    render(<Provider>
      <ApProperties
        currentAP={currentAPWithModelR650}
        apDetails={apDetails}
        isLoading={false}
      /></Provider>, { route: { params } })
    expect(screen.getByText('AP Properties')).toBeVisible()
    fireEvent.click(screen.getByText('More'))
    expect(await screen.findByText('PoE Port Speed')).toBeVisible()
    expect(await screen.findByText('PoE Class')).toBeVisible()
    expect(await screen.findByText('Power Consumption')).toBeVisible()
    expect(await screen.findByText('24 mW')).toBeVisible()
    expect(await screen.findByText('Class 4 (802.3at 30 W)')).toBeVisible()
    expect(await screen.findByText('1000Mbps')).toBeVisible()
    const button = screen.getByRole('button', { name: /close/i })
    fireEvent.click(button)
    expect(screen.queryByText('PoE Port Speed')).not.toBeInTheDocument()
  })

  it('should render edit port drawer correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider>
      <ApProperties
        currentAP={currentAP}
        apDetails={apDetails}
        isLoading={false}
      /></Provider>, { route: { params } })
    expect(screen.getByText('AP Properties')).toBeVisible()
    await userEvent.click(screen.getByText('More'))
    const apPropertiesDialog = await screen.findByRole('dialog')
    expect(apPropertiesDialog).toHaveTextContent('AP Properties')
    const port = await screen.findByTestId('portButton')
    expect(port).toBeVisible()
    await userEvent.click(port)

    //const dialogs = await screen.findAllByRole('dialog')
    //expect(dialogs[1]).toBeVisible()
  })

  it('should render edit lag drawer correctly', async () => {
    const portLagData = {
      data: [{
        adminStatus: 'Up',
        broadcastIn: '15',
        broadcastOut: '116734',
        cloudPort: false,
        crcErr: '0',
        deviceStatus: 'ONLINE',
        egressAclName: '',
        id: 'c0-c5-20-b2-08-11_1-1-5',
        inDiscard: '0',
        inErr: '0',
        ingressAclName: '',
        lagId: '1',
        lagName: 'lag567',
        mediaType: 'MEDIA_TYPE_EMPTY',
        multicastIn: '2882',
        multicastOut: '669090',
        name: 'GigabitEthernet1/1/7',
        neighborMacAddress: '34:20:E3:19:79:F0',
        neighborName: '302002015736',
        opticsType: '1 Gbits per second copper',
        outErr: '0',
        poeEnabled: true,
        poeTotal: 28850,
        poeType: '2P-IEEE',
        poeUsage: '4/29W (14%)',
        poeUsed: 4400,
        portId: 'c0-c5-20-b2-08-11_1-1-5',
        portIdentifier: '1/1/7',
        portSpeed: '1 Gb/sec',
        signalIn: 0,
        signalOut: 0,
        stack: false,
        status: 'Up',
        switchMac: 'c0:c5:20:b2:08:11',
        switchModel: 'ICX7150-C08P',
        switchName: 'R2',
        switchSerial: 'c0:c5:20:b2:08:11',
        switchUnitId: 'FMF3250Q06K',
        syncedSwitchConfig: true,
        unTaggedVlan: '1',
        unitState: 'ONLINE',
        unitStatus: 'Standalone',
        usedInFormingStack: false,
        venueId: '3d995ef9a9c6426893629a89506f34fe',
        vlanIds: '1',
        vsixEgressAclName: '',
        vsixIngressAclName: ''
      }]
    }

    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchPortlist.url,
        (req, res, ctx) => res(ctx.json(portLagData))
      ),
      rest.post(SwitchRbacUrlsInfo.getSwitchPortlist.url,
        (req, res, ctx) => res(ctx.json(portLagData))
      )
    )

    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider>
      <ApProperties
        currentAP={currentAP}
        apDetails={apDetails}
        isLoading={false}
      /></Provider>, { route: { params } })
    expect(screen.getByText('AP Properties')).toBeVisible()
    await userEvent.click(screen.getByText('More'))
    const apPropertiesDialog = await screen.findByRole('dialog')
    expect(apPropertiesDialog).toHaveTextContent('AP Properties')
    const port = await screen.findByTestId('portButton')
    expect(port).toBeVisible()
    await userEvent.click(port)
  })
})
