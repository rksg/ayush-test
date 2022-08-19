/* eslint-disable max-len */
import '@testing-library/jest-dom'
import { rest } from 'msw'

import { networkApi }                           from '@acx-ui/rc/services'
import { CommonUrlsInfo, GuestNetworkTypeEnum } from '@acx-ui/rc/utils'
import { Provider, store }                      from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { VenueNetworksTab } from './index'

const networks = {
  response: [
    {
      type: 'aaa',
      wlan: {
        advancedCustomization: {
          userUplinkRateLimiting: 0,
          userDownlinkRateLimiting: 0,
          totalUplinkRateLimiting: 0,
          totalDownlinkRateLimiting: 0,
          maxClientsOnWlanPerRadio: 100,
          enableBandBalancing: true,
          clientIsolation: false,
          clientIsolationOptions: {
            autoVrrp: false
          },
          hideSsid: false,
          forceMobileDeviceDhcp: false,
          clientLoadBalancingEnable: true,
          enableAaaVlanOverride: true,
          directedThreshold: 5,
          enableNeighborReport: true,
          enableFastRoaming: false,
          mobilityDomainId: 1,
          radioCustomization: {
            rfBandUsage: 'BOTH',
            bssMinimumPhyRate: 'default',
            phyTypeConstraint: 'OFDM',
            managementFrameMinimumPhyRate: '6'
          },
          enableSyslog: false,
          clientInactivityTimeout: 120,
          accessControlEnable: false,
          respectiveAccessControl: false,
          applicationPolicyEnable: false,
          l2AclEnable: false,
          l3AclEnable: false,
          wifiCallingEnabled: false,
          singleSessionIdAccounting: false,
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
        ssid: 'test_2',
        enabled: true,
        bypassCPUsingMacAddressAuthentication: false,
        bypassCNA: false
      },
      authRadius: {
        primary: {
          ip: '3.3.3.3',
          port: 1812,
          sharedSecret: 'dddddddd'
        },
        id: '03649e4122f74870b89d2a4517e09cfb'
      },
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      name: 'test_2',
      enableAuthProxy: false,
      enableAccountingProxy: false,
      id: 'cd922ec00f744a16b4b784f3305ec0aa'
    },
    {
      type: 'psk',
      wlan: {
        wlanSecurity: 'WPA2Personal',
        advancedCustomization: {
          userUplinkRateLimiting: 0,
          userDownlinkRateLimiting: 0,
          totalUplinkRateLimiting: 0,
          totalDownlinkRateLimiting: 0,
          maxClientsOnWlanPerRadio: 100,
          enableBandBalancing: true,
          clientIsolation: false,
          clientIsolationOptions: {
            autoVrrp: false
          },
          hideSsid: false,
          forceMobileDeviceDhcp: false,
          clientLoadBalancingEnable: true,
          directedThreshold: 5,
          enableNeighborReport: true,
          enableFastRoaming: false,
          mobilityDomainId: 1,
          radioCustomization: {
            rfBandUsage: 'BOTH',
            bssMinimumPhyRate: 'default',
            phyTypeConstraint: 'OFDM',
            managementFrameMinimumPhyRate: '6'
          },
          enableSyslog: false,
          clientInactivityTimeout: 120,
          accessControlEnable: false,
          respectiveAccessControl: false,
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
        macAddressAuthentication: false,
        macAuthMacFormat: 'UpperDash',
        managementFrameProtection: 'Disabled',
        vlanId: 1,
        ssid: 'test_1',
        enabled: true,
        passphrase: '15215215'
      },
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      name: 'test_1',
      id: 'd556bb683e4248b7a911fdb40c307aa5'
    }
  ]
}
const apGroup = {
  response: [
    {
      venueId: '45aa5ab71bd040be8c445be8523e0b6c',
      networkId: 'd556bb683e4248b7a911fdb40c307aa5',
      apGroups: [
        {
          apGroupId: 'f9903daeeadb4af88969b32d185cbf27',
          radio: 'Both',
          isDefault: true,
          validationErrorReachedMaxConnectedNetworksLimit: false,
          validationErrorSsidAlreadyActivated: false,
          validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
          validationError: false
        }
      ],
      isAllApGroups: false,
      allApGroupsRadio: 'Both'
    },
    {
      venueId: '45aa5ab71bd040be8c445be8523e0b6c',
      networkId: 'cd922ec00f744a16b4b784f3305ec0aa',
      apGroups: [
        {
          apGroupId: 'f9903daeeadb4af88969b32d185cbf27',
          radio: 'Both',
          isDefault: true,
          validationErrorReachedMaxConnectedNetworksLimit: false,
          validationErrorSsidAlreadyActivated: false,
          validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
          validationError: false
        }
      ],
      isAllApGroups: false,
      allApGroupsRadio: 'Both'
    }
  ]
}
const list = {
  totalCount: 2,
  page: 1,
  data: [
    {
      name: 'test_1',
      id: 'd556bb683e4248b7a911fdb40c307aa5',
      vlan: 1,
      nwSubType: 'psk',
      ssid: 'test_1',
      venues: {
        count: 0,
        names: []
      },
      aps: 0,
      description: '', 
      clients: 0,
      captiveType: GuestNetworkTypeEnum.ClickThrough,
      activated: { isActivated: false }
    },
    {
      name: 'test_2',
      id: 'cd922ec00f744a16b4b784f3305ec0aa',
      vlan: 1,
      nwSubType: 'aaa',
      ssid: 'test_2',
      venues: {
        count: 0,
        names: []
      },
      aps: 0,
      description: '', 
      clients: 0,
      captiveType: GuestNetworkTypeEnum.ClickThrough,
      activated: { isActivated: false }
    }
  ]
}

// const queryResult = aggregatedVenueNetworksData(list, apGroup, networks)

describe('VenueNetworksTab', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
    })
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenueNetworkList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => res(ctx.json(networks))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(apGroup))
      )
    )

    const params = {
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
      venueId: '3b2ffa31093f41648ed38ed122510029'
    }

    const { asFragment } = render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/venue-details/networks' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('test_1')
    expect(asFragment()).toMatchSnapshot()
  })

  // it('activate Network', async () => {
  //   mockServer.use(
  //     rest.post(
  //       CommonUrlsInfo.getNetworksVenuesList.url,
  //       (req, res, ctx) => res(ctx.json(list))
  //     ),
  //     rest.get(
  //       CommonUrlsInfo.getNetwork.url,
  //       (req, res, ctx) => res(ctx.json(networks))
  //     ),
  //     rest.get(
  //       CommonUrlsInfo.getAllUserSettings.url,
  //       (req, res, ctx) => res(ctx.json(apGroup))
  //     )
  //   )
  //   const params = {
  //     tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
  //     venueId: '3b2ffa31093f41648ed38ed122510029'
  //   }

  //   const { asFragment } = render(<Provider><VenueNetworksTab /></Provider>, {
  //     route: { params, path: '/:tenantId/venues/:venueId/venue-details/networks' }
  //   })

  //   await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

  //   const newVenues = [
  //     ...list.data[0].deepNetwork.venues,
  //     {
  //       ...network.venues[0],
  //       venueId: '02e2ddbc88e1428987666d31edbc3d9a'
  //     }
  //   ]
  //   mockServer.use(
  //     rest.get(
  //       CommonUrlsInfo.getNetwork.url,
  //       (req, res, ctx) => res(ctx.json({ ...network, venues: newVenues }))
  //     ),
  //     rest.post(
  //       CommonUrlsInfo.addNetworkVenue.url,
  //       (req, res, ctx) => res(ctx.json({ requestId: '123' }))
  //     )
  //   )

  //   const toogleButton = await screen.findByRole('switch', { checked: false })
  //   fireEvent.click(toogleButton)

  //   await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

  //   const rows = await screen.findAllByRole('switch')
  //   expect(rows).toHaveLength(2)
  //   await waitFor(() => rows.forEach(row => expect(row).toBeChecked()))
  // })

  // xit('deactivate Network', async () => {
  //   mockServer.use(
  //     rest.post(
  //       CommonUrlsInfo.getNetworksVenuesList.url,
  //       (req, res, ctx) => res(ctx.json(list))
  //     ),
  //     rest.get(
  //       CommonUrlsInfo.getNetwork.url,
  //       (req, res, ctx) => res(ctx.json(network))
  //     ),
  //     rest.get(
  //       CommonUrlsInfo.getAllUserSettings.url,
  //       (req, res, ctx) => res(ctx.json(user))
  //     )
  //   )
  //   const params = {
  //     tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  //     networkId: '373377b0cb6e46ea8982b1c80aabe1fa'
  //   }

  //   render(<Provider><VenueNetworksTab /></Provider>, {
  //     route: { params, path: '/:tenantId/:networkId' }
  //   })

  //   await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

  //   mockServer.use(
  //     rest.get(
  //       CommonUrlsInfo.getNetwork.url,
  //       (req, res, ctx) => res(ctx.json({ ...network, venues: [] }))
  //     ),
  //     rest.delete(
  //       CommonUrlsInfo.deleteNetworkVenue.url,
  //       (req, res, ctx) => res(ctx.json({ requestId: '456' }))
  //     )
  //   )

  //   const toogleButton = await screen.findByRole('switch', { checked: true })
  //   fireEvent.click(toogleButton)

  //   await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

  //   const rows = await screen.findAllByRole('switch')
  //   expect(rows).toHaveLength(2)
  //   await waitFor(() => rows.forEach(row => expect(row).not.toBeChecked()))
  // })

})