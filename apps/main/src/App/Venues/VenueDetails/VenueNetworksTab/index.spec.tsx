/* eslint-disable max-len */
import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {

  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { VenueNetworksTab } from './index'

const networks = [{
  type: 'guest',
  wlan: {
    wlanSecurity: 'None',
    bypassCPUsingMacAddressAuthentication: true,
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
      respectiveAccessControl: true,
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
    macAddressAuthentication: false,
    vlanId: 3000,
    ssid: 'Captive_Portal_test1',
    enabled: true,
    bypassCNA: false
  },
  guestPortal: {
    guestNetworkType: 'SelfSignIn',
    enableSelfService: true,
    enableSmsLogin: false,
    maxDevices: 1,
    endOfDayReauthDelay: false,
    macCredentialsDuration: 240,
    lockoutPeriod: 120,
    lockoutPeriodEnabled: false,
    guestPage: {
      langCode: 'en',
      welcomeMessage: 'Welcome Guest',
      wifi4Eu: false
    },
    socialIdentities: {
      google: {
        source: 'CUSTOM',
        config: {
          appId: '983051719104-jd30gsn22j30vs28jomm3a6g0fi9vp1d.apps.googleusercontent.com',
          appSecret: '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'
        }
      }
    },
    socialEmails: false,
    redirectUrl: 'https://www.commscope.com/blog/2016/announcing-arriss-new-rd-center-in-bangalore-india/',
    userSessionTimeout: 1440,
    userSessionGracePeriod: 60
  },
  tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
  venues: [
    {
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      dual5gEnabled: true,
      tripleBandEnabled: false,
      networkId: '8e4f073d37484266b5e4f82b32172a32',
      allApGroupsRadio: 'Both',
      allApGroupsRadioTypes: [
        '2.4-GHz',
        '5-GHz'
      ],
      isAllApGroups: true,
      id: 'b06cc4ef00b741c5a059470944281b3a'
    }
  ],
  enableDhcp: true,
  name: 'Captive_Portal_test1',
  id: '8e4f073d37484266b5e4f82b32172a32'
},
{
  type: 'guest',
  wlan: {
    wlanSecurity: 'None',
    bypassCPUsingMacAddressAuthentication: true,
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
      respectiveAccessControl: true,
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
    macAddressAuthentication: false,
    vlanId: 1,
    ssid: 'CP- Self Sign In',
    enabled: true,
    bypassCNA: false
  },
  guestPortal: {
    smsPasswordDuration: {
      duration: 1,
      unit: 'HOUR'
    },
    guestNetworkType: 'SelfSignIn',
    enableSelfService: true,
    enableSmsLogin: true,
    maxDevices: 1,
    endOfDayReauthDelay: false,
    macCredentialsDuration: 240,
    lockoutPeriod: 120,
    lockoutPeriodEnabled: false,
    guestPage: {
      langCode: 'en',
      welcomeMessage: 'Welcome Guest',
      wifi4Eu: false
    },
    socialEmails: false,
    userSessionTimeout: 1440,
    userSessionGracePeriod: 60
  },
  tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
  venues: [
    {
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      dual5gEnabled: true,
      tripleBandEnabled: false,
      networkId: '16eb894aba984f4796769ffb76239a70',
      allApGroupsRadio: 'Both',
      allApGroupsRadioTypes: [
        '2.4-GHz',
        '5-GHz'
      ],
      isAllApGroups: true,
      id: '8b3105c66a8f48b89b1928d9aaa521f2'
    }
  ],
  enableDhcp: false,
  name: 'CP- Self Sign In',
  id: '16eb894aba984f4796769ffb76239a70'
}]
const apGroup = [ {
  venueId: 'aac17720c83e475f83ef626d159be9ea',
  tripleBandEnabled: false,
  networkId: '389f2b4ec26a4494a73a07e730e1ba95',
  apGroups: [
    {
      apGroupId: 'fcdb8fbfaab4436897d5111745440e77',
      radio: 'Both',
      isDefault: true,
      validationErrorReachedMaxConnectedNetworksLimit: false,
      validationErrorSsidAlreadyActivated: false,
      validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
      validationError: false
    }
  ],
  allApGroupsRadio: 'Both',
  isAllApGroups: false
},
{
  venueId: 'aac17720c83e475f83ef626d159be9ea',
  tripleBandEnabled: false,
  networkId: '7ee1aede6ca542caa1fda9468396d2a9',
  apGroups: [
    {
      apGroupId: 'fcdb8fbfaab4436897d5111745440e77',
      radio: 'Both',
      radioTypes: [
        '5-GHz',
        '2.4-GHz'
      ],
      isDefault: true,
      validationErrorReachedMaxConnectedNetworksLimit: false,
      validationErrorSsidAlreadyActivated: false,
      validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
      validationError: false,
      id: 'f4d51f579c354e57a49cb73bdec12dc2'
    }
  ],
  allApGroupsRadio: 'Both',
  isAllApGroups: false
}]
const list = {
  totalCount: 2,
  page: 1,
  data: [
    {
      name: 'test1',
      id: '389f2b4ec26a4494a73a07e730e1ba95',
      vlan: 1,
      nwSubType: 'guest',
      captiveType: 'SelfSignIn',
      ssid: 'test1',
      description: '1003.2',
      venues: {
        count: 1,
        names: [
          'Aparna-Venue'
        ]
      },
      aps: 1,
      activated: {
        isActivated: false,
        isDisabled: false,
        errors: []
      },
      deepNetwork: {
        type: 'guest',
        wlan: {
          wlanSecurity: 'None',
          bypassCPUsingMacAddressAuthentication: true,
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
            respectiveAccessControl: true,
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
          macAddressAuthentication: false,
          vlanId: 1,
          ssid: 'test1',
          enabled: true,
          bypassCNA: false
        },
        tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
        venues: [
          {
            venueId: '7ae27179b7b84de89eb7e56d9b15943d',
            dual5gEnabled: true,
            tripleBandEnabled: false,
            networkId: '389f2b4ec26a4494a73a07e730e1ba95',
            allApGroupsRadio: 'Both',
            allApGroupsRadioTypes: [
              '2.4-GHz',
              '5-GHz'
            ],
            isAllApGroups: true,
            id: 'b926d7e7cb4e482ba7060f36f600acd1'
          }
        ],
        enableDhcp: false,
        name: 'test1',
        description: '1003.2',
        id: '389f2b4ec26a4494a73a07e730e1ba95'
      }
    },
    {
      name: '!!!NEW_VK_Evolink!!!',
      id: '7ee1aede6ca542caa1fda9468396d2a9',
      vlan: 3000,
      nwSubType: 'guest',
      captiveType: 'SelfSignIn',
      ssid: '!!!NEW_VK_Evolink!!!',
      description: '!!!NEW_VK_Evolink!!!',
      venues: {
        count: 5,
        names: [
          'kesava_venue',
          'Vasanth-Venue',
          'My-Venue',
          'Govind',
          'Aparna-Venue'
        ]
      },
      aps: 3,
      activated: {
        isActivated: false,
        isDisabled: false,
        errors: []
      },
      deepNetwork: {
        type: 'guest',
        wlan: {
          wlanSecurity: 'None',
          bypassCPUsingMacAddressAuthentication: true,
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
            respectiveAccessControl: true,
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
          macAddressAuthentication: false,
          vlanId: 3000,
          ssid: '!!!NEW_VK_Evolink!!!',
          enabled: true,
          bypassCNA: false
        },
        tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
        venues: [
          {
            venueId: '7ae27179b7b84de89eb7e56d9b15943d',
            dual5gEnabled: true,
            tripleBandEnabled: false,
            networkId: '7ee1aede6ca542caa1fda9468396d2a9',
            apGroups: [
              {
                apGroupId: '9095a8cf11c845a9afe4d3643c46a44d',
                vlanId: 3000,
                radio: 'Both',
                radioTypes: [
                  '5-GHz',
                  '2.4-GHz'
                ],
                isDefault: false,
                apGroupName: 'ewrw',
                validationErrorReachedMaxConnectedNetworksLimit: false,
                validationErrorSsidAlreadyActivated: false,
                validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
                validationError: false,
                id: '689e0abc91f24b2cb053f54dd2adebdd'
              }
            ],
            allApGroupsRadio: 'Both',
            allApGroupsRadioTypes: [
              '2.4-GHz',
              '5-GHz'
            ],
            isAllApGroups: false,
            id: '1bfa6cd982434c3db7a2379c33cde73c'
          },
          {
            venueId: '3c2f0b7d57cc4f0581eebd7352680f11',
            dual5gEnabled: true,
            tripleBandEnabled: false,
            networkId: '7ee1aede6ca542caa1fda9468396d2a9',
            allApGroupsRadio: 'Both',
            allApGroupsRadioTypes: [
              '2.4-GHz',
              '5-GHz'
            ],
            isAllApGroups: true,
            id: '6891815908f54cbdbff66084b5f839a0'
          },
          {
            venueId: 'aac17720c83e475f83ef626d159be9ea',
            tripleBandEnabled: false,
            networkId: '7ee1aede6ca542caa1fda9468396d2a9',
            allApGroupsRadio: 'Both',
            allApGroupsRadioTypes: [
              '2.4-GHz',
              '5-GHz'
            ],
            isAllApGroups: true,
            id: '74118bf864064c119dbd5d30f974ead9'
          },
          {
            venueId: '01d74a2c947346a1a963a310ee8c9f6f',
            dual5gEnabled: true,
            tripleBandEnabled: false,
            networkId: '7ee1aede6ca542caa1fda9468396d2a9',
            allApGroupsRadio: 'Both',
            allApGroupsRadioTypes: [
              '2.4-GHz',
              '5-GHz'
            ],
            isAllApGroups: true,
            id: '92dcdb327d12469ea27afa85295905c9'
          }
        ],
        enableDhcp: true,
        name: '!!!NEW_VK_Evolink!!!',
        description: '!!!NEW_VK_Evolink!!!',
        id: '7ee1aede6ca542caa1fda9468396d2a9'
      }
    }
  ]
}
describe('VenueNetworksTab', () => {
  // beforeEach(() => {
  //   act(() => {
  //     store.dispatch(networkApi.util.resetApiState())
  //   })
  // })

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
    await screen.findByText('test1')
    expect(asFragment()).toMatchSnapshot()
  })

  // xit('activate Network', async () => {
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

  //   const newVenues = [
  //     ...network.venues,
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