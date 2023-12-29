/* eslint-disable max-len */
import '@testing-library/jest-dom'

import React from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { useIsSplitOn }    from '@acx-ui/feature-toggle'
import { NetworkSaveData } from '@acx-ui/rc/utils'
import { Provider }        from '@acx-ui/store'
import { render, screen }  from '@acx-ui/test-utils'

import { mockGuestMoreData } from '../../../__tests__/fixtures'
import NetworkFormContext    from '../../../NetworkFormContext'

import { QosMapSetForm } from './QosMapSetForm'

const wlanData = {
  name: 'sdfasdf',
  type: 'open',
  isCloudpathEnabled: false,
  venues: [],
  wlan: {
    wlanSecurity: 'Open',
    advancedCustomization: {
      vlanPool: null,
      clientIsolation: false,
      userUplinkRateLimiting: 0,
      userDownlinkRateLimiting: 0,
      totalUplinkRateLimiting: 0,
      totalDownlinkRateLimiting: 0,
      maxClientsOnWlanPerRadio: 100,
      enableBandBalancing: true,
      clientIsolationOptions: {
        autoVrrp: false
      },
      hideSsid: false,
      forceMobileDeviceDhcp: false,
      clientLoadBalancingEnable: true,
      enableAaaVlanOverride: true,
      directedThreshold: 5,
      enableNeighborReport: true,
      enableAdditionalRegulatoryDomains: true,
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
        enable6G: false
      },
      enableMulticastUplinkRateLimiting: false,
      multicastUplinkRateLimiting: 1,
      enableMulticastDownlinkRateLimiting: false,
      multicastDownlinkRateLimiting: 1,
      enableMulticastUplinkRateLimiting6G: false,
      enableMulticastDownlinkRateLimiting6G: false,
      multicastFilterEnabled: false,
      qosMirroringEnabled: false,
      qosMirroringScope: 'MSCS_REQUESTS_ONLY',
      qosMapSetEnabled: true,
      qosMapSetOptions: {
        rules: [
          {
            priority: 1,
            enabled: true,
            dscpLow: 8,
            dscpHigh: 15,
            id: '861c21e0744a4256a8a07d9934752093'
          },
          {
            priority: 2,
            enabled: true,
            dscpLow: 16,
            dscpHigh: 23,
            id: 'f6c7d388b9c142b9a09f288a9030d6f0'
          },
          {
            priority: 3,
            enabled: true,
            dscpLow: 24,
            dscpHigh: 31,
            id: 'd57323afc14e407599b2ee300e9f3ae6'
          },
          {
            priority: 4,
            enabled: true,
            dscpLow: 32,
            dscpHigh: 39,
            id: '946f7fdca57846b498c407ebaa5ccb35'
          },
          {
            priority: 5,
            enabled: true,
            dscpLow: 40,
            dscpHigh: 47,
            id: 'ab527534b0284d00bb2e1f7d42dd8711'
          },
          {
            priority: 7,
            enabled: true,
            dscpLow: 56,
            dscpHigh: 63,
            id: '3139aaaa096f49aebf2c7c3c710f9367'
          },
          {
            priority: 0,
            enabled: true,
            dscpLow: 0,
            dscpHigh: 7,
            id: '0defc22bb5774872bc1e8e949b6769c5'
          },
          {
            priority: 6,
            enabled: true,
            dscpLow: 48,
            dscpHigh: 55,
            dscpExceptionValues: [
              46
            ]
          }
        ]
      },
      centralizedForwardingEnabled: false
    },
    macAddressAuthentication: false,
    vlanId: 1,
    ssid: 'sdfasdf',
    enabled: true
  },
  tenantId: '651fac8f1d0c414db9b7da218a713a7b',
  isOweMaster: false,
  enableAuthProxy: false,
  enableAccountingProxy: false,
  id: 'ca0425715d1e473787a7e7b9faec3b0c',
  enableAccountingService: false
} as NetworkSaveData

describe('QosMapSetFrom', () => {
  it('Test case for Qos Map Set Enabled', async ()=> {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    // eslint-disable-next-line testing-library/no-render-in-setup
    render(
      <Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: false, cloneMode: false, data: mockGuestMoreData
          }}>
          <Form>
            <QosMapSetForm/>
          </Form>
        </NetworkFormContext.Provider>
      </Provider>,
      { route: { params } })

    expect(await screen.findByTestId('qos-map-set-enabled')).toBeVisible()
  })

  it('After click Qos Map Set should render Qos Map Set option table', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    // eslint-disable-next-line testing-library/no-render-in-setup
    render(
      <Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: false, cloneMode: false, data: wlanData
          }}>
          <Form>
            <QosMapSetForm/>
          </Form>
        </NetworkFormContext.Provider>
      </Provider>,
      { route: { params } })

    await userEvent.click(await screen.findByRole('switch'))
    expect(await screen.findByTestId('qos-map-set-option-table')).toBeVisible()

    await userEvent.click(await screen.findByText('46'))

    await userEvent.click(await screen.findByText('Edit'))

    expect(await screen.findByText(/edit qos map: priority 6/i)).toBeVisible()

    // dscpRange
    await userEvent.type(await screen.getAllByRole('textbox')[2], '4')

    // exceptionDscpValues
    await userEvent.type(await screen.getAllByRole('textbox')[3], '5')

    await userEvent.click(await screen.findByText('Apply'))

    expect(await screen.findByText(/edit qos map: priority 6/i)).toBeVisible()
  })
})
