import '@testing-library/jest-dom'


import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { AccessControlUrls, CommonUrlsInfo, NetworkSaveData, PskWlanAdvancedCustomization, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                                       from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within }                                                    from '@acx-ui/test-utils'

import {
  accessControlListResponse,
  applicationPolicyListResponse,
  devicePolicyListResponse,
  layer2PolicyListResponse,
  layer3PolicyListResponse,
  policyListResponse
} from '../__tests__/fixtures'
import NetworkFormContext from '../NetworkFormContext'

import { AccessControlForm } from './AccessControlForm'

const mockAccessControlReq = jest.fn()
const mockLayer2Req = jest.fn()
const mockLayer3Req = jest.fn()

describe('AccessControlForm', () => {

  beforeEach(() => {
    mockServer.use(
      rest.post(AccessControlUrls.getEnhancedDevicePolicies.url,
        (req, res, ctx) => res(ctx.json(devicePolicyListResponse))),
      rest.post(AccessControlUrls.getEnhancedApplicationPolicies.url,
        (_, res, ctx) => res(ctx.json(applicationPolicyListResponse))),
      rest.get(CommonUrlsInfo.getWifiCallingProfileList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.get(WifiUrlsInfo.getVlanPools.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.post(AccessControlUrls.getEnhancedAccessControlProfiles.url,
        (_, res, ctx) => {
          mockAccessControlReq()
          return res(ctx.json(accessControlListResponse))
        }),
      rest.post(AccessControlUrls.getEnhancedL2AclPolicies.url,
        (_, res, ctx) => {
          mockLayer2Req()
          return res(ctx.json(layer2PolicyListResponse))
        }),
      rest.post(AccessControlUrls.getEnhancedL3AclPolicies.url,
        (_, res, ctx) => {
          mockLayer3Req()
          return res(ctx.json(layer3PolicyListResponse))
        })
    )
  })

  it('should render Access Control form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(
      <Provider>
        <Form>
          <AccessControlForm />
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })


  it('after click client rate limit', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <AccessControlForm />
        </Form>
      </Provider>, {
        route: { params }
      })

    const selectBtn = screen.getByRole('button', { name: /Select separate profiles/i })
    await userEvent.click(selectBtn)

    const view = screen.getByText(/client rate limit/i)
    await userEvent.click(await within(view).findByRole('switch'))
    expect(screen.getByText(/upload limit/i)).toBeVisible()
    expect(screen.getByText(/download limit/i)).toBeVisible()

    const uploadLimitCheckbox = screen.getByTestId('enableUploadLimit')
    await userEvent.click(uploadLimitCheckbox)
    expect(screen.getByText(/200 mbps/i)).toBeVisible()
    await userEvent.click(uploadLimitCheckbox)

    const downloadLimitCheckbox = screen.getByTestId('enableDownloadLimit')
    await userEvent.click(downloadLimitCheckbox)
    expect(screen.getByText(/200 mbps/i)).toBeVisible()
    await userEvent.click(downloadLimitCheckbox)

  })

  it('render access control profile detail', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <AccessControlForm />
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText(/select separate profiles/i)).toBeVisible()
    expect(within(screen.getByText(/device & os/i)).getByText(/--/)).toBeVisible()
    expect(within(screen.getByText(/layer 2/i)).getByText(/--/)).toBeVisible()
    expect(within(screen.getByText(/layer 3/i)).getByText(/--/)).toBeVisible()
    expect(within(screen.getByText(/applications/i)).getByText(/--/)).toBeVisible()
    expect(within(screen.getByText(/client rate limit/i)).getByText(/--/)).toBeVisible()

    expect(await screen.findByText(/select separate profiles/i)).toBeInTheDocument()
  })

  it('render access control profile detail with existing profile', async () => {

    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const data = {
      name: 'test',
      type: 'psk',
      isCloudpathEnabled: false,
      venues: [],
      accessControlProfileEnable: true,
      wlan: {
        wlanSecurity: 'WPA2Personal',
        advancedCustomization: {
          accessControlProfileId: '2918e310075a4f5bb1b0d161769f6f64',
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
        } as PskWlanAdvancedCustomization,
        macAddressAuthentication: false,
        managementFrameProtection: 'Disabled',
        vlanId: 1,
        ssid: 'psk',
        enabled: true,
        passphrase: 'pskpskpskpsk'
      }
    } as NetworkSaveData
    const setData = jest.fn()
    const editMode = true
    const cloneMode = false

    render(
      <Provider>
        <Form>
          <NetworkFormContext.Provider value={{ data, setData, editMode, cloneMode }}>
            <AccessControlForm />
          </NetworkFormContext.Provider>
        </Form>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => expect(mockAccessControlReq).toBeCalled())
    await waitFor(() => expect(mockLayer2Req).toBeCalled())
    await waitFor(() => expect(mockLayer3Req).toBeCalled())


    await userEvent.click(await screen.findByRole('combobox', {
      name: /access control policy/i
    }))

    expect(screen.getByText(/select separate profiles/i)).toBeVisible()

    expect(await screen.findByText(/acl-1/i)).toBeInTheDocument()

    expect(within(screen.getByText(/device & os/i)).getByText(/--/)).toBeVisible()
    expect(within(screen.getByText(/layer 2/i)).getByText(/layer2policy1/)).toBeVisible()
    expect(within(screen.getByText(/layer 3/i)).getByText(/layer3policy1/)).toBeVisible()
    expect(within(screen.getByText(/applications/i)).getByText(/--/)).toBeVisible()
    expect(within(screen.getByText(/client rate limit/i)).getByText(/--/)).toBeVisible()
  })
})
