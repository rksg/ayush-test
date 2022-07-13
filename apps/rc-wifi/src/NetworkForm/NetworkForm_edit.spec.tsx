import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }                                 from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitFor } from '@acx-ui/test-utils'

import { NetworkForm } from './NetworkForm'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

const venuesResponse = {
  fields: [
    'country','city','aps','latitude','switches','description',
    'networks','switchClients','vlan','radios','name','scheduling',
    'id','aggregatedApStatus','mesh','activated','longitude','status'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '6cf550cdb67641d798d804793aaa82db',name: 'My-Venue',
      description: 'My-Venue',city: 'New York',country: 'United States',
      latitude: '40.7690084',longitude: '-73.9431541',switches: 2,
      status: '1_InSetupPhase',mesh: { enabled: false }
    },{
      id: 'c6ae1e4fb6144d27886eb7693ae895c8',name: 'TDC_Venue',
      description: 'Taipei',city: 'Zhongzheng District, Taipei City',
      country: 'Taiwan',latitude: '25.0346703',longitude: '121.5218293',
      networks: { count: 1,names: ['JK-Network'],vlans: [1] },
      aggregatedApStatus: { '2_00_Operational': 1 },
      switchClients: 1,switches: 1,status: '2_Operational',
      mesh: { enabled: false }
    }
  ]
}

const networkResponse = {
  wlan: {
    advancedCustomization: {
      clientIsolation: true,
      userUplinkRateLimiting: 0,
      userDownlinkRateLimiting: 0,
      totalUplinkRateLimiting: 0,
      totalDownlinkRateLimiting: 0,
      maxClientsOnWlanPerRadio: 100,
      enableBandBalancing: true,
      clientIsolationOptions: {
        packetsType: 'UNICAST',
        autoVrrp: false
      },
      hideSsid: false,
      forceMobileDeviceDhcp: false,
      clientLoadBalancingEnable: true,
      directedThreshold: 5,
      enableNeighborReport: true,
      radioCustomization: {
        rfBandUsage: 'BOTH',
        bssMinimumPhyRate: 'default',
        phyTypeConstraint: 'OFDM',
        managementFrameMinimumPhyRate: '6'
      },
      enableSyslog: false,
      clientInactivityTimeout: 120,
      accessControlEnable: false,
      respectiveAccessControl: true,
      applicationPolicyEnable: false,
      l2AclEnable: false,
      l3AclEnable: false,
      wifiCallingEnabled: false,
      proxyARP: false,
      enableAirtimeDecongestion: false,
      enableJoinRSSIThreshold: false,
      joinRSSIThreshold: -85,
      enableTransientClientManagement: false,
      joinWaitTime: 30,
      joinExpireTime: 300,
      joinWaitThreshold: 10,
      enableOptimizedConnectivityExperience: false,
      broadcastProbeResponseDelay: 15,
      rssiAssociationRejectionThreshold: -75,
      enableAntiSpoofing: false,
      enableArpRequestRateLimit: true,
      arpRequestRateLimit: 15,
      enableDhcpRequestRateLimit: true,
      dhcpRequestRateLimit: 15,
      dnsProxyEnabled: false
    },
    vlanId: 1,
    ssid: 'open',
    enabled: true
  },
  type: 'open',
  name: 'open network test',
  description: 'open network test description',
  id: '5d45082c812c45fbb9aab24420f39bf0'
}

const successResponse = { requestId: 'request-id' }


describe('NetworkForm', () => {
  it('should edit open network successfully', async () => {
    const params = { networkId: 'network-id', tenantId: 'tenant-id', action: 'edit' }

    const { asFragment } = render(<Provider><NetworkForm /></Provider>, {
      route: { params }
    })

    expect(asFragment()).toMatchSnapshot()

    mockServer.use(
      rest.get(CommonUrlsInfo.getNetwork.url,
        (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json(networkResponse)
          )
        }),
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json(venuesResponse)
          )
        }),
      rest.post(CommonUrlsInfo.updateNetworkDeep.url,
        (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json(successResponse)
          )
        }),
      rest.get(CommonUrlsInfo.getCloudpathList.url, (_, res, ctx) => res(ctx.json([])))
    )
    
    await expect(waitFor(() => {
      expect(screen.getByRole('input')).toHaveValue('open network test')
    }, { timeout: 100 })).rejects.toThrow()
    fireEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Open Settings' })
    fireEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    fireEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Summary' })
    fireEvent.click(screen.getByText('Finish'))
  })
})
