import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { apApi }        from '@acx-ui/rc/services'
import {
  CommonRbacUrlsInfo,
  SwitchRbacUrlsInfo,
  SwitchUrlsInfo,
  WifiRbacUrlsInfo,
  AFCStatus,
  AFCPowerMode,
  ApVenueStatusEnum
} from '@acx-ui/rc/utils'
import { Provider, store  }                                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { apDetails, apLanPorts, apRadio, currentAP, currentAPWithModelR650, ApCapabilitiesR650 } from '../../__tests__/fixtures'

import { ApProperties } from '.'

// Mock useUserProfileContext
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: jest.fn()
}))

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
      lldpPSEAllocPowerVal: '25555',
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

describe('ApProperties', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    mockedInitPokeSocketFn.mockImplementation(() => mockedSocket)

    // Mock userProfile to show Admin Password field
    const { useUserProfileContext } = require('@acx-ui/user')
    useUserProfileContext.mockReturnValue({
      data: {
        support: true,
        var: false,
        dogfood: false
      }
    })
    mockServer.use(
      rest.get(
        CommonRbacUrlsInfo.getVenue.url,
        (req, res, ctx) => res(ctx.json({
          id: 'venue-id',
          name: 'venue-1',
          address: {
            latitude: 37.4112751,
            longitude: -122.0191908
          }
        }))
      ),
      rest.get(
        WifiRbacUrlsInfo.getApOperational.url.replace('?operational=true', ''),
        (_, res, ctx) => res(ctx.json({
          apPassword: 'admin!234'
        }))
      ),
      rest.post(
        CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({
          date: [{
            serialNumber: '422039000034',
            apGroupId: 'be41e3513eb7446bbdebf461dec67ed3',
            name: 'fake_AP',
            venueId: 'venue-id'
          }]
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
        WifiRbacUrlsInfo.getApLanPorts.url,
        (req, res, ctx) => res(ctx.json(apLanPorts))
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
      rest.get(SwitchRbacUrlsInfo.getLagList.url,
        (req, res, ctx) => res(ctx.json(lagList))
      ),
      rest.post(SwitchRbacUrlsInfo.getSwitchList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        SwitchRbacUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json({ data: [], totalCount: 0 }))
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
      )
    )
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
    expect(await screen.findByText('Allocated Power')).toBeVisible()
    expect(await screen.findByText('25.55 W')).toBeVisible()
    expect(await screen.findByText('Class 4 (802.3at 30 W)')).toBeVisible()
    expect(await screen.findByText('1000 Mbps')).toBeVisible()
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

  it('should render AFC correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const testAP = {
      ...currentAP,
      model: 'R760',
      apRadioDeploy: '2-5-6',
      apStatusData: {
        ...currentAP.apStatusData,
        afcInfo: {
          afcStatus: AFCStatus.AFC_NOT_REQUIRED,
          powerMode: AFCPowerMode.LOW_POWER
        }
      }
    }

    mockServer.use(
      rest.get(
        WifiRbacUrlsInfo.getApCapabilities.url,
        (_, res, ctx) => res(ctx.json({
          model: 'R760',
          supportTriRadio: true
        }))
      ),
      rest.get(
        WifiRbacUrlsInfo.getApValidChannel.url,
        (_, res, ctx) => res(ctx.json({ afcEnabled: true }))
      )
    )
    render(<Provider>
      <ApProperties
        currentAP={testAP}
        apDetails={apDetails}
        isLoading={false}
      /></Provider>, { route: { params } })
    expect(screen.getByText('AP Properties')).toBeVisible()
    fireEvent.click(screen.getByText('More'))
    const apPropertiesDialog = await screen.findByRole('dialog')
    expect(apPropertiesDialog).toHaveTextContent('AP Properties')
    const a = await within(apPropertiesDialog).findByText(/Low Power Indoor/)
    expect(a).not.toHaveTextContent('[User Set]')
    const button = screen.getByRole('button', { name: /close/i })
    await userEvent.click(button)
    await waitFor(() => {
      expect(apPropertiesDialog).not.toBeVisible()
    })
  })

  describe('Admin Password field', () => {
    beforeEach(() => {
      // Reset mocks before each test
      jest.mocked(useIsSplitOn).mockClear()
    })

    it('should show Admin Password with per-AP password enabled', async () => {
      // Mock feature flags to enable per-AP password and visibility
      jest.mocked(useIsSplitOn).mockImplementation((feature) => {
        if (feature === 'WIFI_AP_PASSWORD_PER_AP_TOGGLE') return true
        if (feature === 'WIFI_AP_PASSWORD_VISIBILITY_TOGGLE') return true
        return true
      })

      const { useUserProfileContext } = require('@acx-ui/user')
      useUserProfileContext.mockReturnValue({
        data: {
          support: true,
          var: false,
          dogfood: false
        }
      })

      render(<Provider>
        <ApProperties
          currentAP={currentAP}
          apDetails={apDetails}
          isLoading={false}
        /></Provider>, { route: { params } })

      fireEvent.click(screen.getByText('More'))
      const apPropertiesDialog = await screen.findByRole('dialog')

      expect(within(apPropertiesDialog).getByText('Admin Password')).toBeVisible()
      expect(within(apPropertiesDialog).getByText('Show AP Password')).toBeVisible()
    })

    it('should show Admin Password field for var user', async () => {
      // Mock feature flags to enable per-AP password and visibility
      jest.mocked(useIsSplitOn).mockImplementation((feature) => {
        if (feature === 'WIFI_AP_PASSWORD_PER_AP_TOGGLE') return true
        if (feature === 'WIFI_AP_PASSWORD_VISIBILITY_TOGGLE') return true
        return true
      })

      const { useUserProfileContext } = require('@acx-ui/user')
      useUserProfileContext.mockReturnValue({
        data: {
          support: false,
          var: true,
          dogfood: false
        }
      })

      render(<Provider>
        <ApProperties
          currentAP={currentAP}
          apDetails={apDetails}
          isLoading={false}
        /></Provider>, { route: { params } })

      fireEvent.click(screen.getByText('More'))
      const apPropertiesDialog = await screen.findByRole('dialog')

      expect(within(apPropertiesDialog).getByText('Admin Password')).toBeVisible()
      expect(within(apPropertiesDialog).getByText('Show AP Password')).toBeVisible()
    })

    it('should show Admin Password field for dogfood user', async () => {
      // Mock feature flags to enable per-AP password and visibility
      jest.mocked(useIsSplitOn).mockImplementation((feature) => {
        if (feature === 'WIFI_AP_PASSWORD_PER_AP_TOGGLE') return true
        if (feature === 'WIFI_AP_PASSWORD_VISIBILITY_TOGGLE') return true
        return true
      })

      const { useUserProfileContext } = require('@acx-ui/user')
      useUserProfileContext.mockReturnValue({
        data: {
          support: false,
          var: false,
          dogfood: true
        }
      })

      render(<Provider>
        <ApProperties
          currentAP={currentAP}
          apDetails={apDetails}
          isLoading={false}
        /></Provider>, { route: { params } })

      fireEvent.click(screen.getByText('More'))
      const apPropertiesDialog = await screen.findByRole('dialog')

      expect(within(apPropertiesDialog).getByText('Admin Password')).toBeVisible()
      expect(within(apPropertiesDialog).getByText('Show AP Password')).toBeVisible()
    })

    it('should not show Admin Password field for regular user', async () => {
      // Mock feature flags to enable per-AP password and visibility
      jest.mocked(useIsSplitOn).mockImplementation((feature) => {
        if (feature === 'WIFI_AP_PASSWORD_PER_AP_TOGGLE') return true
        if (feature === 'WIFI_AP_PASSWORD_VISIBILITY_TOGGLE') return true
        return true
      })

      const { useUserProfileContext } = require('@acx-ui/user')
      useUserProfileContext.mockReturnValue({
        data: {
          support: false,
          var: false,
          dogfood: false
        }
      })

      render(<Provider>
        <ApProperties
          currentAP={currentAP}
          apDetails={apDetails}
          isLoading={false}
        /></Provider>, { route: { params } })

      fireEvent.click(screen.getByText('More'))
      const apPropertiesDialog = await screen.findByRole('dialog')

      expect(within(apPropertiesDialog).queryByText('Admin Password')).not.toBeInTheDocument()
    })



    it('should show the "Show AP Password" button when per-AP password is enabled', async () => {
      // Mock feature flags to enable per-AP password and visibility
      jest.mocked(useIsSplitOn).mockImplementation((feature) => {
        if (feature === 'WIFI_AP_PASSWORD_PER_AP_TOGGLE') return true
        if (feature === 'WIFI_AP_PASSWORD_VISIBILITY_TOGGLE') return true
        return true
      })

      const { useUserProfileContext } = require('@acx-ui/user')
      useUserProfileContext.mockReturnValue({
        data: {
          support: true,
          var: false,
          dogfood: false
        }
      })

      render(<Provider>
        <ApProperties
          currentAP={currentAP}
          apDetails={apDetails}
          isLoading={false}
        /></Provider>, { route: { params } })

      fireEvent.click(screen.getByText('More'))
      const apPropertiesDialog = await screen.findByRole('dialog')

      expect(within(apPropertiesDialog).getByText('Admin Password')).toBeVisible()
      expect(within(apPropertiesDialog).getByText('Show AP Password')).toBeVisible()

      // Verify the button element exists and contains the text
      const showPasswordButton = within(apPropertiesDialog)
        .getByRole('button', { name: /Show AP Password/ })
      expect(showPasswordButton).toBeInTheDocument()
      expect(showPasswordButton).toBeVisible()
    })

    // eslint-disable-next-line max-len
    it('should hide Admin Password field when no feature flags are enabled and user without permission', async () => {
      // Mock feature flags to disable both per-AP password and visibility
      jest.mocked(useIsSplitOn).mockImplementation((feature) => {
        if (feature === 'WIFI_AP_PASSWORD_PER_AP_TOGGLE') return false
        if (feature === 'WIFI_AP_PASSWORD_VISIBILITY_TOGGLE') return false
        return true
      })

      const { useUserProfileContext } = require('@acx-ui/user')
      useUserProfileContext.mockReturnValue({
        data: {
          support: false,
          var: false,
          dogfood: false
        }
      })

      render(<Provider>
        <ApProperties
          currentAP={currentAP}
          apDetails={apDetails}
          isLoading={false}
        /></Provider>, { route: { params } })

      fireEvent.click(screen.getByText('More'))
      const apPropertiesDialog = await screen.findByRole('dialog')

      expect(within(apPropertiesDialog).queryByText('Admin Password')).not.toBeInTheDocument()
    })

    // eslint-disable-next-line max-len
    it('should show Admin Password field with legacy password when feature flags are disabled', async () => {
      // Mock feature flags to disable both per-AP password and visibility
      jest.mocked(useIsSplitOn).mockImplementation((feature) => {
        if (feature === 'WIFI_AP_PASSWORD_PER_AP_TOGGLE') return false
        if (feature === 'WIFI_AP_PASSWORD_VISIBILITY_TOGGLE') return false
        return true
      })

      const { useUserProfileContext } = require('@acx-ui/user')
      useUserProfileContext.mockReturnValue({
        data: {
          support: true,
          var: false,
          dogfood: false
        }
      })

      render(<Provider>
        <ApProperties
          currentAP={currentAP}
          apDetails={apDetails}
          isLoading={false}
        /></Provider>, { route: { params } })

      fireEvent.click(screen.getByText('More'))
      const apPropertiesDialog = await screen.findByRole('dialog')

      expect(within(apPropertiesDialog).getByText('Admin Password')).toBeVisible()
      expect(within(apPropertiesDialog).getByText('Show AP Password')).toBeVisible()
    })

    describe('Password Regeneration Message', () => {
      beforeEach(() => {
        // Mock feature flags to enable per-AP password and visibility
        jest.mocked(useIsSplitOn).mockImplementation((feature) => {
          if (feature === 'WIFI_AP_PASSWORD_PER_AP_TOGGLE') return true
          if (feature === 'WIFI_AP_PASSWORD_VISIBILITY_TOGGLE') return true
          return true
        })

        const { useUserProfileContext } = require('@acx-ui/user')
        useUserProfileContext.mockReturnValue({
          data: {
            support: true,
            var: false,
            dogfood: false
          }
        })

        // Mock the getApPassword API response
        mockServer.use(
          rest.get(
            WifiRbacUrlsInfo.getApPassword.url,
            (_, res, ctx) => res(ctx.json({
              apPassword: 'testPassword123',
              expireTime: '2024-01-15T10:30:00Z',
              updatedTime: '2024-01-15T09:30:00Z'
            }))
          )
        )
      })



      it('should return null when expireTime is missing', async () => {
        // Mock API to return password without expireTime
        mockServer.use(
          rest.get(
            WifiRbacUrlsInfo.getApPassword.url,
            (_, res, ctx) => res(ctx.json({
              apPassword: 'testPassword123',
              expireTime: undefined,
              updatedTime: '2024-01-15T09:30:00Z'
            }))
          )
        )

        render(<Provider>
          <ApProperties
            currentAP={currentAP}
            apDetails={apDetails}
            isLoading={false}
          /></Provider>, { route: { params } })

        fireEvent.click(screen.getByText('More'))
        const apPropertiesDialog = await screen.findByRole('dialog')

        // Click show password button to trigger password fetch
        const showPasswordButton = within(apPropertiesDialog)
          .getByRole('button', { name: /Show AP Password/ })
        await userEvent.click(showPasswordButton)

        // Should not show regeneration message
        expect(within(apPropertiesDialog)
          .queryByText(/AP Password will regenerate/)).not.toBeInTheDocument()
      })

      it('should show regeneration message for connected AP with expire today', async () => {
        const now = new Date()
        const todayExpireTime = new Date(
          now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59
        ).toISOString()

        // Override the mock for this specific test
        mockServer.use(
          rest.get(
            WifiRbacUrlsInfo.getApPassword.url,
            (_, res, ctx) => res(ctx.json({
              apPassword: 'testPassword123',
              expireTime: todayExpireTime,
              updatedTime: '2024-01-15T09:30:00Z'
            }))
          )
        )

        render(<Provider>
          <ApProperties
            currentAP={currentAP}
            apDetails={apDetails}
            isLoading={false}
          /></Provider>, { route: { params } })

        fireEvent.click(screen.getByText('More'))
        const apPropertiesDialog = await screen.findByRole('dialog')

        expect(within(apPropertiesDialog).getByText('Admin Password')).toBeVisible()
        expect(within(apPropertiesDialog).getByText('Show AP Password')).toBeVisible()

        expect(screen.getByText('Show AP Password')).toBeVisible()
        fireEvent.click(screen.getByText('Show AP Password'))

        // Wait for password to be displayed first
        await waitFor(() => {
          // Check if any password is displayed
          const passwordElement = within(apPropertiesDialog).getByText(/testPassword123/)
          expect(passwordElement).toBeVisible()
        })

        // Then wait for regeneration message to be displayed
        await waitFor(() => {
          expect(within(apPropertiesDialog)
            .getByText(/AP Password will regenerate at/)).toBeVisible()
        })

        // Check for the time and day label
        await waitFor(() => {
          expect(within(apPropertiesDialog).getByText(/23:59/)).toBeVisible()
        })
        await waitFor(() => {
          expect(within(apPropertiesDialog).getByText(/today/)).toBeVisible()
        })

      })

      it('should show regeneration message for connected AP with expire tomorrow', async () => {
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(now.getDate() + 1)
        const tomorrowExpireTime = new Date(
          tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59
        ).toISOString()

        // Override the mock for this specific test
        mockServer.use(
          rest.get(
            WifiRbacUrlsInfo.getApPassword.url,
            (_, res, ctx) => res(ctx.json({
              apPassword: 'testPassword123',
              expireTime: tomorrowExpireTime,
              updatedTime: '2024-01-15T09:30:00Z'
            }))
          )
        )

        render(<Provider>
          <ApProperties
            currentAP={currentAP}
            apDetails={apDetails}
            isLoading={false}
          /></Provider>, { route: { params } })

        fireEvent.click(screen.getByText('More'))
        const apPropertiesDialog = await screen.findByRole('dialog')

        expect(within(apPropertiesDialog).getByText('Admin Password')).toBeVisible()
        expect(within(apPropertiesDialog).getByText('Show AP Password')).toBeVisible()

        expect(screen.getByText('Show AP Password')).toBeVisible()
        fireEvent.click(screen.getByText('Show AP Password'))

        // Wait for password to be displayed first
        await waitFor(() => {
          // Check if any password is displayed
          const passwordElement = within(apPropertiesDialog).getByText(/testPassword123/)
          expect(passwordElement).toBeVisible()
        })

        // Then wait for regeneration message to be displayed
        await waitFor(() => {
          expect(within(apPropertiesDialog)
            .getByText(/AP Password will regenerate at/)).toBeVisible()
        })

        // Check for the time and day label
        await waitFor(() => {
          expect(within(apPropertiesDialog).getByText(/23:59/)).toBeVisible()
        })
        await waitFor(() => {
          expect(within(apPropertiesDialog).getByText(/tomorrow/)).toBeVisible()
        })

      })

      it('should show regeneration message for disconnected AP with expired password', async () => {
        const now = new Date()
        // Set expire time to 1 hour ago (expired)
        const expiredTime = new Date(now.getTime() - 60 * 60 * 1000).toISOString()

        const apDisconnected = {
          ...currentAP,
          deviceStatusSeverity: ApVenueStatusEnum.OFFLINE
        }

        // Override the mock for this specific test
        mockServer.use(
          rest.get(
            WifiRbacUrlsInfo.getApPassword.url,
            (_, res, ctx) => res(ctx.json({
              apPassword: 'testPassword123',
              expireTime: expiredTime,
              updatedTime: '2024-01-15T09:30:00Z'
            }))
          )
        )

        render(<Provider>
          <ApProperties
            currentAP={apDisconnected}
            apDetails={apDetails}
            isLoading={false}
          /></Provider>, { route: { params } })

        fireEvent.click(screen.getByText('More'))
        const apPropertiesDialog = await screen.findByRole('dialog')

        expect(within(apPropertiesDialog).getByText('Admin Password')).toBeVisible()
        expect(within(apPropertiesDialog).getByText('Show AP Password')).toBeVisible()

        expect(screen.getByText('Show AP Password')).toBeVisible()
        fireEvent.click(screen.getByText('Show AP Password'))

        // Wait for password to be displayed first
        await waitFor(() => {
          // Check if any password is displayed
          const passwordElement = within(apPropertiesDialog).getByText(/testPassword123/)
          expect(passwordElement).toBeVisible()
        })

        // Then wait for regeneration message to be displayed
        await waitFor(() => {
          const reconnectionMessage = /AP Password will regenerate upon cloud reconnection/
          expect(within(apPropertiesDialog)
            .getByText(reconnectionMessage))
            .toBeVisible()
        })
      })

      it('should show regeneration message for disconnected AP non-expired password', async () => {
        const now = new Date()
        // Set expire time to 1 hour from now (not expired)
        const futureExpireTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString()

        const apDisconnected = {
          ...currentAP,
          deviceStatusSeverity: ApVenueStatusEnum.OFFLINE
        }

        // Override the mock for this specific test
        mockServer.use(
          rest.get(
            WifiRbacUrlsInfo.getApPassword.url,
            (_, res, ctx) => res(ctx.json({
              apPassword: 'testPassword123',
              expireTime: futureExpireTime,
              updatedTime: '2024-01-15T09:30:00Z'
            }))
          )
        )

        render(<Provider>
          <ApProperties
            currentAP={apDisconnected}
            apDetails={apDetails}
            isLoading={false}
          /></Provider>, { route: { params } })

        fireEvent.click(screen.getByText('More'))
        const apPropertiesDialog = await screen.findByRole('dialog')

        expect(within(apPropertiesDialog).getByText('Admin Password')).toBeVisible()
        expect(within(apPropertiesDialog).getByText('Show AP Password')).toBeVisible()

        expect(screen.getByText('Show AP Password')).toBeVisible()
        fireEvent.click(screen.getByText('Show AP Password'))

        // Wait for password to be displayed first
        await waitFor(() => {
          // Check if any password is displayed
          const passwordElement = within(apPropertiesDialog).getByText(/testPassword123/)
          expect(passwordElement).toBeVisible()
        })

        // Then wait for regeneration message to be displayed
        await waitFor(() => {
          expect(within(apPropertiesDialog)
            .getByText(/AP Password will regenerate at/)).toBeVisible()
        })

        // Should also show the "upon cloud reconnection" message
        await waitFor(() => {
          expect(within(apPropertiesDialog)
            .getByText(/upon cloud reconnection/))
            .toBeVisible()
        })
      })

    })
  })
})
