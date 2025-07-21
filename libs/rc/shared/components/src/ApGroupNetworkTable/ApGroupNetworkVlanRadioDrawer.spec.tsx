import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { KeyValue, Network, VenueApGroup } from '@acx-ui/rc/utils'
import { render, screen }                  from '@acx-ui/test-utils'

import { ApGroupNetworkVlanRadioDrawer } from './ApGroupNetworkVlanRadioDrawer'

import { ApGroupNetworkVlanRadioContext } from './index'

describe('ApGroupNetworkVlanRadioDrawer', () => {
  beforeEach(() => {

  })

  const tableData = [
    {
      name: 'nw-temp',
      id: '0be9ea6fb0cd47b3add309ec2f84b153',
      vlan: 1,
      nwSubType: 'psk',
      ssid: 'nw-temp',
      clientCount: 0,
      venueApGroups: [
        {
          venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096',
          apGroupIds: [
            'fb99f472c7d345e7828cbcf8c67e8d8e'
          ],
          isAllApGroups: false
        }
      ],
      clients: 0,
      activated: {
        isActivated: true,
        isDisabled: false,
        errors: []
      },
      deepNetwork: {
        type: 'psk',
        wlan: {
          wlanSecurity: 'WPA2Personal',
          advancedCustomization: {
            enableAaaVlanOverride: true,
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
            enableAdditionalRegulatoryDomains: true,
            mobilityDomainId: 1,
            radioCustomization: {
              rfBandUsage: 'BOTH',
              bssMinimumPhyRate: 'default',
              phyTypeConstraint: 'NONE',
              managementFrameMinimumPhyRate: '6'
            },
            enableSyslog: false,
            clientInactivityTimeout: 120,
            respectiveAccessControl: true,
            radiusOptions: {
              nasIdType: 'BSSID',
              nasIdDelimiter: 'DASH',
              nasRequestTimeoutSec: 3,
              nasMaxRetry: 2,
              nasReconnectPrimaryMin: 5,
              calledStationIdType: 'BSSID',
              singleSessionIdAccounting: false
            },
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
            dnsProxyEnabled: false,
            bssPriority: 'HIGH',
            enableGtkRekey: true,
            enableApHostNameAdvertisement: false,
            dhcpOption82Enabled: false,
            dhcpOption82SubOption1Enabled: false,
            dhcpOption82SubOption2Enabled: false,
            dhcpOption82SubOption150Enabled: false,
            dhcpOption82SubOption151Enabled: false,
            dhcpOption82MacFormat: 'COLON',
            agileMultibandEnabled: false,
            dtimInterval: 1,
            wifi6Enabled: true,
            wifi7Enabled: true,
            multiLinkOperationEnabled: false,
            multiLinkOperationOptions: {
              enable24G: true,
              enable50G: true,
              enable6G: true
            },
            enableMulticastUplinkRateLimiting: false,
            multicastUplinkRateLimiting: 1,
            enableMulticastDownlinkRateLimiting: false,
            multicastDownlinkRateLimiting: 1,
            enableMulticastUplinkRateLimiting6G: false,
            enableMulticastDownlinkRateLimiting6G: false,
            multicastFilterEnabled: false,
            qosMirroringEnabled: true,
            qosMirroringScope: 'MSCS_REQUESTS_ONLY',
            qosMapSetEnabled: false,
            qosMapSetOptions: {},
            centralizedForwardingEnabled: false,
            fastRoamingOptions: {
              statisticsOverDistributedSystemEnabled: false,
              reassociationTimeout: 20
            },
            applicationVisibilityEnabled: true
          },
          macAddressAuthentication: false,
          managementFrameProtection: 'Disabled',
          vlanId: 1,
          ssid: 'nw-temp',
          enabled: true,
          passphrase: 'asdfasdfasdf'
        },
        name: 'nw-temp',
        isEnforced: false,
        id: '0be9ea6fb0cd47b3add309ec2f84b153',
        venues: [
          {
            dual5gEnabled: false,
            tripleBandEnabled: false,
            allApGroupsRadio: 'Both',
            isAllApGroups: false,
            allApGroupsRadioTypes: [
              '2.4-GHz',
              '5-GHz'
            ],
            isEnforced: false,
            networkId: '0be9ea6fb0cd47b3add309ec2f84b153',
            apGroups: [
              {
                radioTypes: [
                  '2.4-GHz',
                  '5-GHz'
                ],
                apGroupId: 'fb99f472c7d345e7828cbcf8c67e8d8e',
                venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096',
                networkId: '0be9ea6fb0cd47b3add309ec2f84b153',
                radio: 'Both',
                isDefault: false,
                apGroupName: 'apg'
              }
            ],
            venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096'
          }
        ]
      },
      incompatible: 0,
      deepVenue: {
        dual5gEnabled: false,
        tripleBandEnabled: false,
        allApGroupsRadio: 'Both',
        isAllApGroups: false,
        allApGroupsRadioTypes: [
          '2.4-GHz',
          '5-GHz'
        ],
        isEnforced: false,
        networkId: '0be9ea6fb0cd47b3add309ec2f84b153',
        apGroups: [
          {
            radioTypes: [
              '2.4-GHz',
              '5-GHz'
            ],
            apGroupId: 'fb99f472c7d345e7828cbcf8c67e8d8e',
            venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096',
            networkId: '0be9ea6fb0cd47b3add309ec2f84b153',
            radio: 'Both',
            isDefault: false,
            apGroupName: 'apg'
          }
        ],
        venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096'
      }
    },
    {
      name: 'nw-temp-1',
      id: '316b945113ff45b189c23e0a7f29a8f7',
      vlan: 1,
      nwSubType: 'psk',
      ssid: 'nw-temp-1',
      venueApGroups: [
        {
          venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096',
          apGroupIds: [
            'b20e1a26eec44146b2687417ef5d7f0b',
            'fb99f472c7d345e7828cbcf8c67e8d8e',
            'bb16a3c5c79e4cb8a75fc25dc11f7a2e'
          ],
          isAllApGroups: true
        }
      ] as VenueApGroup[],
      clients: 0,
      activated: {
        isActivated: true,
        isDisabled: false,
        errors: []
      },
      deepNetwork: {
        type: 'psk',
        wlan: {
          wlanSecurity: 'WPA2Personal',
          advancedCustomization: {
            enableAaaVlanOverride: true,
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
            enableAdditionalRegulatoryDomains: true,
            mobilityDomainId: 1,
            radioCustomization: {
              rfBandUsage: 'BOTH',
              bssMinimumPhyRate: 'default',
              phyTypeConstraint: 'NONE',
              managementFrameMinimumPhyRate: '6'
            },
            enableSyslog: false,
            clientInactivityTimeout: 120,
            respectiveAccessControl: true,
            radiusOptions: {
              nasIdType: 'BSSID',
              nasIdDelimiter: 'DASH',
              nasRequestTimeoutSec: 3,
              nasMaxRetry: 2,
              nasReconnectPrimaryMin: 5,
              calledStationIdType: 'BSSID',
              singleSessionIdAccounting: false
            },
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
            dnsProxyEnabled: false,
            bssPriority: 'HIGH',
            enableGtkRekey: true,
            enableApHostNameAdvertisement: false,
            dhcpOption82Enabled: false,
            dhcpOption82SubOption1Enabled: false,
            dhcpOption82SubOption2Enabled: false,
            dhcpOption82SubOption150Enabled: false,
            dhcpOption82SubOption151Enabled: false,
            dhcpOption82MacFormat: 'COLON',
            agileMultibandEnabled: false,
            dtimInterval: 1,
            wifi6Enabled: true,
            wifi7Enabled: true,
            multiLinkOperationEnabled: false,
            multiLinkOperationOptions: {
              enable24G: true,
              enable50G: true,
              enable6G: true
            },
            enableMulticastUplinkRateLimiting: false,
            multicastUplinkRateLimiting: 1,
            enableMulticastDownlinkRateLimiting: false,
            multicastDownlinkRateLimiting: 1,
            enableMulticastUplinkRateLimiting6G: false,
            enableMulticastDownlinkRateLimiting6G: false,
            multicastFilterEnabled: false,
            qosMirroringEnabled: true,
            qosMirroringScope: 'MSCS_REQUESTS_ONLY',
            qosMapSetEnabled: false,
            qosMapSetOptions: {},
            centralizedForwardingEnabled: false,
            fastRoamingOptions: {
              statisticsOverDistributedSystemEnabled: false,
              reassociationTimeout: 20
            },
            applicationVisibilityEnabled: true
          },
          macAddressAuthentication: false,
          managementFrameProtection: 'Disabled',
          vlanId: 1,
          ssid: 'nw-temp-1',
          enabled: true,
          passphrase: 'asdfasdfasdfasdfasdf'
        },
        name: 'nw-temp-1',
        isEnforced: false,
        id: '316b945113ff45b189c23e0a7f29a8f7',
        venues: [
          {
            dual5gEnabled: false,
            tripleBandEnabled: false,
            allApGroupsRadio: 'Both',
            isAllApGroups: true,
            allApGroupsRadioTypes: [
              '2.4-GHz',
              '5-GHz'
            ],
            isEnforced: false,
            networkId: '316b945113ff45b189c23e0a7f29a8f7',
            apGroups: [],
            venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096'
          }
        ]
      },
      incompatible: 0,
      deepVenue: {
        dual5gEnabled: false,
        tripleBandEnabled: false,
        allApGroupsRadio: 'Both',
        isAllApGroups: true,
        allApGroupsRadioTypes: [
          '2.4-GHz',
          '5-GHz'
        ],
        isEnforced: false,
        networkId: '316b945113ff45b189c23e0a7f29a8f7',
        apGroups: [],
        venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096'
      }
    }
  ] as unknown as Network[]

  it('should render successfully', () => {
    const params = { tenantId: 'tenant-id', apGroupId: 'testApGroupId' }
    const mockedUpdateData = jest.fn()
    const venueId = 'testVenueId'
    const apGroupId = 'testApGroupId'
    const setTableData = jest.fn()
    const drawerStatus = {
      visible: false,
      editData: []
    }
    const setDrawerStatus = jest.fn()
    const vlanPoolingNameMap = [] as KeyValue<string, string>[]

    render(
      <Form>
        <ApGroupNetworkVlanRadioContext.Provider value={{
          venueId: venueId!, apGroupId: apGroupId!,
          tableData, setTableData,
          drawerStatus, setDrawerStatus,
          vlanPoolingNameMap }} >
          <ApGroupNetworkVlanRadioDrawer updateData={mockedUpdateData} />
        </ApGroupNetworkVlanRadioContext.Provider>
      </Form>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/details/networks' }
      }
    )

    expect(screen.queryAllByText('Edit VLAN & Radio')).toStrictEqual([])
  })

  it('should render successfully with drawer', async () => {
    const params = { tenantId: 'tenant-id', apGroupId: 'testApGroupId' }
    const mockedUpdateData = jest.fn()
    const venueId = 'testVenueId'
    const apGroupId = 'testApGroupId'
    const setTableData = jest.fn()
    const drawerStatus = {
      visible: true,
      editData: [{
        name: 'nw-temp',
        id: '0be9ea6fb0cd47b3add309ec2f84b153',
        vlan: 1,
        nwSubType: 'psk',
        ssid: 'nw-temp',
        clientCount: 0,
        venueApGroups: [
          {
            venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096',
            apGroupIds: [
              'fb99f472c7d345e7828cbcf8c67e8d8e'
            ],
            isAllApGroups: false
          }
        ],
        clients: 0,
        activated: {
          isActivated: true,
          isDisabled: false,
          errors: []
        },
        deepNetwork: {
          type: 'psk',
          wlan: {
            wlanSecurity: 'WPA2Personal',
            advancedCustomization: {
              enableAaaVlanOverride: true,
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
              enableAdditionalRegulatoryDomains: true,
              mobilityDomainId: 1,
              radioCustomization: {
                rfBandUsage: 'BOTH',
                bssMinimumPhyRate: 'default',
                phyTypeConstraint: 'NONE',
                managementFrameMinimumPhyRate: '6'
              },
              enableSyslog: false,
              clientInactivityTimeout: 120,
              respectiveAccessControl: true,
              radiusOptions: {
                nasIdType: 'BSSID',
                nasIdDelimiter: 'DASH',
                nasRequestTimeoutSec: 3,
                nasMaxRetry: 2,
                nasReconnectPrimaryMin: 5,
                calledStationIdType: 'BSSID',
                singleSessionIdAccounting: false
              },
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
              dnsProxyEnabled: false,
              bssPriority: 'HIGH',
              enableGtkRekey: true,
              enableApHostNameAdvertisement: false,
              dhcpOption82Enabled: false,
              dhcpOption82SubOption1Enabled: false,
              dhcpOption82SubOption2Enabled: false,
              dhcpOption82SubOption150Enabled: false,
              dhcpOption82SubOption151Enabled: false,
              dhcpOption82MacFormat: 'COLON',
              agileMultibandEnabled: false,
              dtimInterval: 1,
              wifi6Enabled: true,
              wifi7Enabled: true,
              multiLinkOperationEnabled: false,
              multiLinkOperationOptions: {
                enable24G: true,
                enable50G: true,
                enable6G: true
              },
              enableMulticastUplinkRateLimiting: false,
              multicastUplinkRateLimiting: 1,
              enableMulticastDownlinkRateLimiting: false,
              multicastDownlinkRateLimiting: 1,
              enableMulticastUplinkRateLimiting6G: false,
              enableMulticastDownlinkRateLimiting6G: false,
              multicastFilterEnabled: false,
              qosMirroringEnabled: true,
              qosMirroringScope: 'MSCS_REQUESTS_ONLY',
              qosMapSetEnabled: false,
              qosMapSetOptions: {},
              centralizedForwardingEnabled: false,
              fastRoamingOptions: {
                statisticsOverDistributedSystemEnabled: false,
                reassociationTimeout: 20
              },
              applicationVisibilityEnabled: true
            },
            macAddressAuthentication: false,
            managementFrameProtection: 'Disabled',
            vlanId: 1,
            ssid: 'nw-temp',
            enabled: true,
            passphrase: 'asdfasdfasdf'
          },
          name: 'nw-temp',
          isEnforced: false,
          id: '0be9ea6fb0cd47b3add309ec2f84b153',
          venues: [
            {
              dual5gEnabled: false,
              tripleBandEnabled: false,
              allApGroupsRadio: 'Both',
              isAllApGroups: false,
              allApGroupsRadioTypes: [
                '2.4-GHz',
                '5-GHz'
              ],
              isEnforced: false,
              networkId: '0be9ea6fb0cd47b3add309ec2f84b153',
              apGroups: [
                {
                  radioTypes: [
                    '2.4-GHz',
                    '5-GHz'
                  ],
                  apGroupId: 'fb99f472c7d345e7828cbcf8c67e8d8e',
                  venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096',
                  networkId: '0be9ea6fb0cd47b3add309ec2f84b153',
                  radio: 'Both',
                  isDefault: false,
                  apGroupName: 'apg'
                }
              ],
              venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096'
            }
          ]
        },
        incompatible: 0,
        deepVenue: {
          dual5gEnabled: false,
          tripleBandEnabled: false,
          allApGroupsRadio: 'Both',
          isAllApGroups: false,
          allApGroupsRadioTypes: [
            '2.4-GHz',
            '5-GHz'
          ],
          isEnforced: false,
          networkId: '0be9ea6fb0cd47b3add309ec2f84b153',
          apGroups: [
            {
              radioTypes: [
                '2.4-GHz',
                '5-GHz'
              ],
              apGroupId: 'fb99f472c7d345e7828cbcf8c67e8d8e',
              venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096',
              networkId: '0be9ea6fb0cd47b3add309ec2f84b153',
              radio: 'Both',
              isDefault: false,
              apGroupName: 'apg'
            }
          ],
          venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096'
        }
      }] as Network[]
    }
    const setDrawerStatus = jest.fn()
    const vlanPoolingNameMap = [] as KeyValue<string, string>[]

    render(
      <Form>
        <ApGroupNetworkVlanRadioContext.Provider value={{
          venueId: venueId!, apGroupId: apGroupId!,
          tableData, setTableData,
          drawerStatus, setDrawerStatus,
          vlanPoolingNameMap }} >
          <ApGroupNetworkVlanRadioDrawer updateData={mockedUpdateData} />
        </ApGroupNetworkVlanRadioContext.Provider>
      </Form>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/details/networks' }
      }
    )

    expect(await screen.findByText('Edit VLAN & Radio')).toBeVisible()

    await userEvent.click(screen.getByText(/ok/i))
    expect(mockedUpdateData).toHaveBeenCalled()
  })
})
