import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                    from '@acx-ui/feature-toggle'
import { AccessControlUrls, CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                        from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved,
  waitFor,
  within
} from '@acx-ui/test-utils'
import { UserUrlsInfo } from '@acx-ui/user'

import {
  venuesResponse,
  networksResponse,
  successResponse,
  venueListResponse,
  policyListResponse,
  apGroupsResponse,
  externalProviders
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
  venues: [
    {
      tripleBandEnabled: false,
      venueId: '6cf550cdb67641d798d804793aaa82db',
      vlanPoolId: '0753a360ad9945b88249039ef6734498',
      dual5gEnabled: false,
      id: 'cf932d30cdd7492f8737da38a3e7b7af',
      isAllApGroups: true,
      networkId: '5d45082c812c45fbb9aab24420f39bf0',
      allApGroupsRadio: 'Both',
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      apGroups: [{
        apGroupId: 'c3b59e5f488c4d85b5044939f6a9449b',
        vlanId: 1,
        radio: 'Both',
        radioTypes: ['5-GHz', '2.4-GHz'],
        isDefault: false,
        apGroupName: 'eee',
        validationErrorReachedMaxConnectedNetworksLimit: false,
        validationErrorSsidAlreadyActivated: false,
        validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
        validationError: false,
        id: 'dc4358301fa54d95ad426d2c42f3f344'
      }],
      scheduler: {
        type: 'CUSTOM',
        // eslint-disable-next-line max-len
        sun: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        mon: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        tue: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        wed: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        thu: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        fri: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        sat: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'
      }
    }
  ],
  type: 'open',
  name: 'open network test',
  description: 'open network test description',
  id: '5d45082c812c45fbb9aab24420f39bf0'
}

const vlanList = [{
  tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
  name: 'test pool',
  vlanMembers: ['2'],
  id: '7b5b3b03492d4a0b84ff9d1d11c4770d'
},
{
  tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
  name: 'test pool2',
  vlanMembers: ['2'],
  id: '0753a360ad9945b88249039ef6734498'
}]

describe('NetworkForm', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.get(WifiUrlsInfo.getNetwork.url, (_, res, ctx) =>
        res(ctx.json(networkResponse))
      ),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url, (_, res, ctx) =>
        res(ctx.json({ response: [networkResponse] }))
      ),
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url, (_, res, ctx) =>
        res(ctx.json(venuesResponse))
      ),
      rest.post(CommonUrlsInfo.getVMNetworksList.url, (_, res, ctx) =>
        res(ctx.json(networksResponse))
      ),
      rest.put(
        WifiUrlsInfo.updateNetworkDeep.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(successResponse))
      ),
      rest.get(CommonUrlsInfo.getCloudpathList.url, (_, res, ctx) =>
        res(ctx.json([]))
      ),
      rest.post(CommonUrlsInfo.getVenuesList.url, (_, res, ctx) =>
        res(ctx.json(venueListResponse))
      ),
      rest.get(AccessControlUrls.getL2AclPolicyList.url, (_, res, ctx) =>
        res(ctx.json(policyListResponse))
      ),
      rest.get(AccessControlUrls.getL3AclPolicyList.url, (_, res, ctx) =>
        res(ctx.json(policyListResponse))
      ),
      rest.get(AccessControlUrls.getDevicePolicyList.url, (_, res, ctx) =>
        res(ctx.json(policyListResponse))
      ),
      rest.get(AccessControlUrls.getAppPolicyList.url, (_, res, ctx) =>
        res(ctx.json(policyListResponse))
      ),
      rest.post(CommonUrlsInfo.venueNetworkApGroup.url, (req, res, ctx) =>
        res(ctx.json(apGroupsResponse))
      ),
      rest.get(CommonUrlsInfo.getWifiCallingProfileList.url, (_, res, ctx) =>
        res(ctx.json(policyListResponse))
      ),
      rest.get(CommonUrlsInfo.getVlanPoolList.url, (_, res, ctx) =>
        res(ctx.json(vlanList))
      ),
      rest.get(AccessControlUrls.getAccessControlProfileList.url, (_, res, ctx) =>
        res(ctx.json([]))
      ),
      rest.get(CommonUrlsInfo.getExternalProviders.url,
        (_, res, ctx) => res(ctx.json(externalProviders))),
      rest.get('https://maps.googleapis.com/maps/api/timezone/json',
        (_, res, ctx) => res(ctx.json({})))

    )
  })

  // TODO: remove skip when ACX-13452 is fixed by moving to StepsForm
  it.skip('should edit open network successfully', async () => {
    const params = {
      networkId: '5d45082c812c45fbb9aab24420f39bf0',
      tenantId: 'tenant-id',
      action: 'edit'
    }

    const { asFragment } = render(
      <Provider>
        <NetworkForm />
      </Provider>,
      {
        route: { params }
      }
    )

    expect(asFragment()).toMatchSnapshot()

    await fillInBeforeSettings('open network edit test')

    screen.getByText('Settings')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    const button = screen.getByRole('button', { name: /venues/i })
    await userEvent.click(button)
    await userEvent.click(screen.getByText('Finish'))
  })

  it.skip('should set different ssid successfully', async () => {
    const params = {
      networkId: '5d45082c812c45fbb9aab24420f39bf0',
      tenantId: 'tenant-id',
      action: 'edit'
    }

    render(
      <Provider>
        <NetworkForm />
      </Provider>,
      {
        route: { params }
      }
    )

    await fillInBeforeSettings('open network edit test')

    screen.getByText('Settings')
    // fireEvent.click(await screen.findByText(/set different ssid/i))
    const ssidInput = await screen.findByRole('textbox', { name: /ssid/i })
    fireEvent.change(ssidInput, { target: { value: 'testSsid' } })
    fireEvent.blur(ssidInput)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(
      await screen.findByRole('heading', { name: /settings/i })
    ).toBeVisible()
  })

  it('should try ssid validation successfully', async () => {
    const params = {
      networkId: '5d45082c812c45fbb9aab24420f39bf0',
      tenantId: 'tenant-id',
      action: 'edit'
    }

    render(
      <Provider>
        <NetworkForm />
      </Provider>,
      {
        route: { params }
      }
    )

    await fillInBeforeSettings('open network edit test')

    screen.getByText('Settings')
    const ssidInput = await screen.findByRole('textbox', { name: /ssid/i })
    fireEvent.change(ssidInput, { target: { value: 'testSsid222' } })
    fireEvent.blur(ssidInput)
    fireEvent.change(ssidInput, {
      target: { value: '11111111111111111111111111111111111111' }
    })
    fireEvent.blur(ssidInput)
    fireEvent.change(ssidInput, { target: { value: '1' } })
    fireEvent.blur(ssidInput)
  })
  it.skip('should configure aps and scheduling successfully', async () => {
    const params = {
      networkId: '5d45082c812c45fbb9aab24420f39bf0',
      tenantId: 'tenant-id',
      action: 'edit'
    }

    render(
      <Provider>
        <NetworkForm />
      </Provider>,
      {
        route: { params }
      }
    )

    await fillInBeforeSettings('open network edit test')

    await screen.findByText('Settings')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    const button = await screen.findByRole('button', { name: /venues/i })
    await userEvent.click(button)

    const apsButton = await screen.findByRole('button', { name: /all aps/i })
    await userEvent.click(apsButton)

    const dialog = await waitFor(async () => screen.findByRole('dialog'))
    const apsApplyButton = await within(dialog).findByRole('button', { name: 'Apply' })
    await userEvent.click(apsApplyButton)

    const schedulingButton = await screen.findByRole('button', { name: /on now/i })
    await userEvent.click(schedulingButton)

    const schedulingDialog = await waitFor(async () => screen.findByRole('dialog'))
    const schedulingApplyButton = await within(schedulingDialog)
      .findByRole('button', { name: 'Apply' })
    await userEvent.click(schedulingApplyButton)

    await userEvent.click(await screen.findByText('Finish'))
  })
})
