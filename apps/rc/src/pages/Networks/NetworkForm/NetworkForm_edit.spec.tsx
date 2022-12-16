import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                  from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, WifiUrlsInfo  } from '@acx-ui/rc/utils'
import { Provider }                      from '@acx-ui/store'
import {
  mockServer,
  render, screen,
  fireEvent,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  venuesResponse,
  networksResponse,
  successResponse,
  venueListResponse,
  policyListResponse
} from './__tests__/fixtures'
import NetworkForm from './NetworkForm'


async function fillInBeforeSettings (networkName: string) {
  const insertInput = screen.getByLabelText(/Network Name/)
  fireEvent.change(insertInput, { target: { value: networkName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating, { timeout: 7000 })

  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
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
  venues: [{
    tripleBandEnabled: false,
    venueId: '16b11938ee934928a796534e2ee47661',
    vlanPoolId: '0753a360ad9945b88249039ef6734498',
    dual5gEnabled: false,
    id: 'cf932d30cdd7492f8737da38a3e7b7af',
    isAllApGroups: true,
    networkId: '48477700abd34d14ac18746280d071f5',
    allApGroupsRadio: 'Both'
  }],
  type: 'open',
  name: 'open network test',
  description: 'open network test description',
  id: '5d45082c812c45fbb9aab24420f39bf0'
}

describe('NetworkForm', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkResponse))),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [networkResponse] }))),
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.put(WifiUrlsInfo.updateNetworkDeep.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.post(CommonUrlsInfo.getL2AclPolicyList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.post(CommonUrlsInfo.getL3AclPolicyList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.post(CommonUrlsInfo.getDevicePolicyList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.post(CommonUrlsInfo.getApplicationPolicyList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.get(CommonUrlsInfo.getWifiCallingProfileList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.get(CommonUrlsInfo.getVlanPoolList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.get(CommonUrlsInfo.getAccessControlProfileList.url,
        (_, res, ctx) => res(ctx.json([])))
    )
  })

  it('should edit open network successfully', async () => {
    const params = { networkId: '5d45082c812c45fbb9aab24420f39bf0'
      , tenantId: 'tenant-id', action: 'edit' }

    const { asFragment } = render(<Provider><NetworkForm /></Provider>, {
      route: { params }
    })

    expect(asFragment()).toMatchSnapshot()

    await fillInBeforeSettings('open network edit test')

    screen.getByText('Settings')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    const button = screen.getByRole('button', { name: /venues/i })
    await button.click()
    await userEvent.click(screen.getByText('Finish'))
  })

  it('should set different ssid successfully', async () => {
    const json = {
      requestId: '04a97b0b-c3ff-4184-812c-3267029e3f08',
      response: [{
        venueId: '908c47ee1cd445838c3bf71d4addccdf',
        tripleBandEnabled: false,
        networkId: '573c1d9efc5e4d9eada3f9b8be199186',
        apGroups: [{
          apGroupId: '3243f76d6cb04fa7ab18d0e6d17b6f18',
          radio: 'Both',
          radioTypes: ['2.4-GHz','5-GHz'],
          isDefault: true,
          validationErrorReachedMaxConnectedNetworksLimit: false,
          validationErrorSsidAlreadyActivated: false,
          validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
          validationError: false,
          id: 'b5275fde5b5f4a119665cd3a8bde30e5'
        },{
          apGroupId: '068a4db6f47d418ebbbdbca741253735',
          radio: 'Both',
          radioTypes: ['2.4-GHz','5-GHz'],
          isDefault: false,
          apGroupName: 'hhh',
          validationErrorReachedMaxConnectedNetworksLimit: false,
          validationErrorSsidAlreadyActivated: false,
          validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
          validationError: false,
          id: '5aee44348f174c94aeec545e8e7162fb'
        }],
        allApGroupsRadio: 'Both',
        isAllApGroups: false }] }

    mockServer.use(rest.post(
      CommonUrlsInfo.venueNetworkApGroup.url,
      (req, res, ctx) => res(ctx.json(json))
    ))

    const params = { networkId: '5d45082c812c45fbb9aab24420f39bf0'
      , tenantId: 'tenant-id', action: 'edit' }

    render(<Provider><NetworkForm /></Provider>, {
      route: { params }
    })

    await fillInBeforeSettings('open network edit test')

    screen.getByText('Settings')
    // fireEvent.click(await screen.findByText(/set different ssid/i))
    const ssidInput = await screen.findByRole('textbox', { name: /ssid/i })
    fireEvent.change(ssidInput, { target: { value: 'testSsid' } })
    fireEvent.blur(ssidInput)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: /settings/i })).toBeVisible()
  })

  it('should try ssid validation successfully', async () => {
    const json = {
      requestId: '04a97b0b-c3ff-4184-812c-3267029e3f08',
      response: [{
        venueId: '908c47ee1cd445838c3bf71d4addccdf',
        tripleBandEnabled: false,
        networkId: '573c1d9efc5e4d9eada3f9b8be199186',
        apGroups: [{
          apGroupId: '3243f76d6cb04fa7ab18d0e6d17b6f18',
          radio: 'Both',
          radioTypes: ['2.4-GHz', '5-GHz'],
          isDefault: true,
          validationErrorReachedMaxConnectedNetworksLimit: false,
          validationErrorSsidAlreadyActivated: true,
          validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
          validationError: false,
          id: 'b5275fde5b5f4a119665cd3a8bde30e5'
        }, {
          apGroupId: '068a4db6f47d418ebbbdbca741253735',
          radio: 'Both',
          radioTypes: ['2.4-GHz', '5-GHz'],
          isDefault: false,
          apGroupName: 'hhh',
          validationErrorReachedMaxConnectedNetworksLimit: false,
          validationErrorSsidAlreadyActivated: true,
          validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
          validationError: false,
          id: '5aee44348f174c94aeec545e8e7162fb'
        }],
        allApGroupsRadio: 'Both',
        isAllApGroups: false
      }]
    }

    mockServer.use(rest.post(
      CommonUrlsInfo.venueNetworkApGroup.url,
      (req, res, ctx) => res(ctx.json(json))
    ))

    const params = {
      networkId: '5d45082c812c45fbb9aab24420f39bf0'
      , tenantId: 'tenant-id', action: 'edit'
    }

    render(<Provider><NetworkForm /></Provider>, {
      route: { params }
    })

    await fillInBeforeSettings('open network edit test')

    screen.getByText('Settings')
    const ssidInput = await screen.findByRole('textbox', { name: /ssid/i })
    fireEvent.change(ssidInput, { target: { value: 'testSsid222' } })
    fireEvent.blur(ssidInput)
    fireEvent.change(ssidInput, { target: { value: '11111111111111111111111111111111111111' } })
    fireEvent.blur(ssidInput)
    fireEvent.change(ssidInput, { target: { value: '1' } })
    fireEvent.blur(ssidInput)
  })
})

