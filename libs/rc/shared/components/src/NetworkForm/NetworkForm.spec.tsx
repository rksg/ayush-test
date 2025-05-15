import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed }                          from '@acx-ui/feature-toggle'
import { networkApi, policyApi, serviceApi, softGreApi, venueApi, ipSecApi } from '@acx-ui/rc/services'
import {
  AccessControlUrls,
  AdministrationUrlsInfo,
  CommonUrlsInfo,
  IdentityProviderUrls,
  MacRegListUrlsInfo,
  PortalUrlsInfo,
  SoftGreUrls,
  WifiCallingUrls,
  WifiOperatorUrls,
  WifiRbacUrlsInfo,
  WifiUrlsInfo,
  NetworkTypeEnum,
  NewDpskBaseUrl,
  AaaUrls,
  IpsecUrls,
  FirmwareUrlsInfo,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved,
  waitFor
} from '@acx-ui/test-utils'
import { UserUrlsInfo } from '@acx-ui/user'

import {
  venuesResponse,
  networksResponse,
  successResponse,
  networkDeepResponse,
  portalList,
  mockHotpost20IdentityProviderList,
  mockHotspot20OperatorList,
  macRegistrationList,
  mockWifiCallingTableResult,
  devicePolicyListResponse,
  applicationPolicyListResponse,
  accessControlListResponse,
  layer2PolicyListResponse,
  layer3PolicyListResponse,
  mockSoftGreTable,
  mockIpSecTable,
  mockAAAPolicyListResponse
} from './__tests__/fixtures'
import { NetworkForm, getFieldsToRemoveFromWlan } from './NetworkForm'

jest.mock('../EdgeSdLan/useEdgeSdLanActions', () => ({
  ...jest.requireActual('../EdgeSdLan/useEdgeSdLanActions'),
  useSdLanScopedNetworkVenues: jest.fn().mockReturnValue({})
}))
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  useNetworkVxLanTunnelProfileInfo: jest.fn().mockReturnValue({ enableVxLan: false })
}))
jest.mock('./Venues/TunnelColumn/useTunnelColumn', () => ({
  ...jest.requireActual('./Venues/TunnelColumn/useTunnelColumn'),
  useTunnelColumn: jest.fn().mockReturnValue([])
}))

jest.mock('./NetworkSettings/SharedComponent/IdentityGroup/IdentityGroup', () => ({
  IdentityGroup: () => <div data-testid={'rc-IdentityGroupSelector'} />
}))
describe('NetworkForm', () => {

  beforeEach(() => {
    store.dispatch(networkApi.util.resetApiState())
    store.dispatch(policyApi.util.resetApiState())
    store.dispatch(serviceApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(softGreApi.util.resetApiState())
    store.dispatch(ipSecApi.util.resetApiState())

    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockImplementation((ff) => (
      ff !== Features.RBAC_SERVICE_POLICY_TOGGLE
       && ff !== Features.WIFI_RBAC_API
       && ff !== Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE
    ))

    networkDeepResponse.name = 'open network test'
    mockServer.use(
      rest.post(WifiCallingUrls.getEnhancedWifiCallingList.url,
        (_, res, ctx) => res(ctx.json(mockWifiCallingTableResult))),
      rest.get(UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.post(WifiUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
      rest.post(PortalUrlsInfo.getEnhancedPortalProfileList.url,
        (_, res, ctx) => res(ctx.json({ content: portalList }))),
      rest.post(PortalUrlsInfo.createPortal.url,
        (_, res, ctx) => res(ctx.json({ response: {
          requestId: 'request-id', id: 'test', serviceName: 'test' } }))),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        // eslint-disable-next-line max-len
        (_, res, ctx) => res(ctx.json({ acceptTermsLink: 'terms & conditions', acceptTermsMsg: 'I accept the' }))),
      rest.get(MacRegListUrlsInfo.getMacRegistrationPools.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(macRegistrationList))),
      rest.post(WifiOperatorUrls.getWifiOperatorList.url,
        (_, res, ctx) => res(ctx.json(mockHotspot20OperatorList))),
      rest.post(IdentityProviderUrls.getIdentityProviderList.url,
        (_, res, ctx) => res(ctx.json(mockHotpost20IdentityProviderList))),
      rest.post(WifiUrlsInfo.getVlanPoolViewModelList.url,
        (_, res, ctx) => res(ctx.json({ totalCount: 0, page: 1, data: [] }))),
      rest.put(WifiRbacUrlsInfo.updateRadiusServerSettings.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(AccessControlUrls.getAccessControlProfileList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.post(AccessControlUrls.getEnhancedDevicePolicies.url,
        (req, res, ctx) => res(ctx.json(devicePolicyListResponse))),
      rest.post(AccessControlUrls.getEnhancedApplicationPolicies.url,
        (_, res, ctx) => res(ctx.json(applicationPolicyListResponse))),
      rest.post(AccessControlUrls.getEnhancedAccessControlProfiles.url,
        (_, res, ctx) => res(ctx.json(accessControlListResponse))),
      rest.post(AccessControlUrls.getEnhancedL2AclPolicies.url,
        (_, res, ctx) => res(ctx.json(layer2PolicyListResponse))),
      rest.post(AccessControlUrls.getEnhancedL3AclPolicies.url,
        (_, res, ctx) => res(ctx.json(layer3PolicyListResponse))),
      // RBAC API
      rest.get(WifiRbacUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
      rest.post(SoftGreUrls.getSoftGreViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockSoftGreTable))),
      rest.post(IpsecUrls.getIpsecViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockIpSecTable))),
      rest.post(AaaUrls.queryAAAPolicyList.url,
        (req, res, ctx) => res(ctx.json(mockAAAPolicyListResponse))),
      rest.post(WifiUrlsInfo.getVlanPoolViewModelList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))),
      rest.post(FirmwareUrlsInfo.getApModelFamilies.url,
        (req, res, ctx) => res(ctx.json([]))),
      rest.post(IpsecUrls.getIpsecViewDataList.url,
        (req, res, ctx) => res(ctx.json([]))),
      rest.get(AdministrationUrlsInfo.getPrivacySettings.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it('should create open network successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<Provider><NetworkForm /></Provider>, {
      route: { params }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const insertInput = screen.getByLabelText(/Network Name/)
    fireEvent.change(insertInput, { target: { value: 'open network test' } })
    fireEvent.blur(insertInput)

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating, { timeout: 7000 })

    userEvent.click(screen.getByRole('radio', { name: /Open Network/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'Open Settings' })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'Summary' })

    await userEvent.click(screen.getByText('Add'))
  })

  it('should create hotspot20 network successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<Provider><NetworkForm /></Provider>, {
      route: { params }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const insertInput = screen.getByLabelText(/Network Name/)
    fireEvent.change(insertInput, { target: { value: 'hotspot20 network test' } })
    fireEvent.blur(insertInput)

    let validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating, { timeout: 7000 })

    userEvent.click(screen.getByRole('radio', { name: /Hotspot 2.0 Access/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'Hotspot 2.0 Settings' })

    const operatorSelect = await screen.findByRole('combobox', { name: /Wi-Fi Operator/i })
    await userEvent.click(operatorSelect)

    await userEvent.click((await screen.findByRole('option', { name: 'operator1' })))

    const providerSelect = await screen.findByRole('combobox', { name: /Identity Provider/i })
    await userEvent.click(providerSelect)

    await userEvent.click((await screen.findByRole('option', { name: 'provider_1' })))

    const showMoreButton = await screen.findByRole('button', { name: 'Show more settings' })
    await userEvent.click(showMoreButton)

    await userEvent.click(screen.getByRole('tab', { name: 'Hotspot 2.0' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
  })

  it('should render breadcrumb correctly', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<Provider><NetworkForm /></Provider>, {
      route: { params }
    })
    expect(await screen.findByText('Wi-Fi')).toBeVisible()
    expect(await screen.findByText('Wi-Fi Networks')).toBeVisible()
    expect(screen.getByRole('link', {
      name: /network list/i
    })).toBeTruthy()
  })

  it('should create different SSID successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<Provider><NetworkForm /></Provider>, {
      route: { params }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const insertInput = screen.getByLabelText(/Network Name/)
    fireEvent.change(insertInput, { target: { value: 'open network test' } })
    fireEvent.blur(insertInput)
    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating, { timeout: 7000 })

    fireEvent.click(await screen.findByText(/set different ssid/i))
    fireEvent.click(await screen.findByText(/same as network name/i))
    fireEvent.click(await screen.findByText(/set different ssid/i))
    const ssidInput = await screen.findByRole('textbox', { name: /ssid/i })
    fireEvent.change(ssidInput, { target: { value: 'testSsid' } })
    fireEvent.blur(ssidInput)

    userEvent.click(screen.getByRole('radio', { name: /Open Network/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('heading', { name: /settings/i })).toBeVisible()
  })

  it('should default select specific DPSK server', async () => {
    mockServer.use(
      rest.get(
        NewDpskBaseUrl,
        (_req, res, ctx) => res(ctx.json({ content: [] }))
      ))

    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const defaultValues = { dpskServiceProfileId: 'mocked-dpsk-seviceId' }
    render(<Provider><NetworkForm
      createType={NetworkTypeEnum.DPSK}
      defaultValues={defaultValues}
      modalMode
    /></Provider>, {
      route: { params }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const insertInput = screen.getByRole('textbox', { name: /Network Name/ })
    fireEvent.change(insertInput, { target: { value: 'testing DPSK with default' } })
    fireEvent.blur(insertInput)
    screen.getByRole('heading', { level: 4, name: 'Dynamic Pre-Shared Key (DPSK)' })

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating, { timeout: 7000 })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'DPSK Settings' })

    await screen.findByRole('combobox', { name: /DPSK Service/i })
    await screen.findByText(defaultValues.dpskServiceProfileId)
  })

  it.skip('should create open network with cloud path option successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    const insertInput = screen.getByLabelText(/Network Name/)
    fireEvent.change(insertInput, { target: { value: 'open network test' } })
    fireEvent.blur(insertInput)
    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)

    await userEvent.click(screen.getByRole('radio', { name: /Open Network/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'Open Settings' })

    const useCloudpathOption = screen.getByRole('switch')
    await userEvent.click(useCloudpathOption)

    const cloudpathServer = screen.getByRole('combobox')
    userEvent.click(cloudpathServer)
    await waitFor(() => screen.findByText('test1'))
    const option = screen.getByText('test1')
    await userEvent.click(option)

    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Summary' })

    await userEvent.click(screen.getByText('Add'))
  })
  it.skip('should create captive portal successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<Provider><NetworkForm /></Provider>, {
      route: { params }
    })

    const insertInput = screen.getByLabelText(/Network Name/)
    fireEvent.change(insertInput, { target: { value: 'open network test' } })
    fireEvent.blur(insertInput)
    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)

    await userEvent.click(screen.getByRole('radio', { name: /Captive Portal/ }))
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Portal Type' })
    await userEvent.click(screen.getByRole('radio', { name: /Click-Through/ }))
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Onboarding' })
    await userEvent.click(screen.getByRole('checkbox', { name: /Redirect users to/ }))
    const redirectUrlInput = screen.getByPlaceholderText('e.g. http://www.example.com')
    fireEvent.change(redirectUrlInput, { target: { value: 'https://www.commscope.com/ruckus/' } })
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Portal Web Page' })
    await userEvent.click(await screen.findByText('Add Guest Portal Service'))
    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Service Name' }),'create Portal test')
    await userEvent.click(await screen.findByText('Reset'))
    await userEvent.click(await screen.findByText('Add'))
    await userEvent.click(await screen.findByTitle('create Portal test'))
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Summary' })
    await userEvent.click(screen.getByText('Add'))
  }, 20000)

  it.skip('should create captive portal without redirect url successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<Provider><NetworkForm /></Provider>, {
      route: { params }
    })

    const insertInput = screen.getByLabelText(/Network Name/)
    fireEvent.change(insertInput, { target: { value: 'open network test' } })
    fireEvent.blur(insertInput)
    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)

    await userEvent.click(await screen.findByRole('radio', { name: /Captive Portal/ }))
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Portal Type' })
    await userEvent.click(await screen.findByRole('radio', { name: /Click-Through/ }))
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Onboarding' })
    await userEvent.click(await screen.findByRole('checkbox', { name: /Redirect users to/ }))
    await userEvent.click(await screen.findByRole('checkbox', { name: /Redirect users to/ }))
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Portal Web Page' })
    await userEvent.click(await screen.findByText('Add Guest Portal Service'))
    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Service Name' }),'create Portal test2')
    await userEvent.click(await screen.findByText('Reset'))
    await userEvent.click(await screen.findByText('Add'))
    await userEvent.click(await screen.findByTitle('create Portal test2'))
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Summary' })
    await userEvent.click(screen.getByText('Add'))
  }, 20000)
})

describe('getFieldsToRemoveFromWlan', () => {
  it('should remove passphrase and saePassphrase for OWE security', () => {
    const result = getFieldsToRemoveFromWlan(WlanSecurityEnum.OWE)
    expect(result).toEqual(['passphrase', 'saePassphrase'])
  })

  it('should remove all security fields for None security', () => {
    const result = getFieldsToRemoveFromWlan(WlanSecurityEnum.None)
    expect(result).toEqual(['managementFrameProtection', 'passphrase', 'saePassphrase'])
  })

  it('should remove managementFrameProtection and passphrase for WPA3 security', () => {
    const result = getFieldsToRemoveFromWlan(WlanSecurityEnum.WPA3)
    expect(result).toEqual(['managementFrameProtection', 'passphrase'])
  })

  it('should only remove managementFrameProtection for WPA23Mixed security', () => {
    const result = getFieldsToRemoveFromWlan(WlanSecurityEnum.WPA23Mixed)
    expect(result).toEqual(['managementFrameProtection'])
  })

  // WPA2Personal should has managementFrameProtection
  it('should remove managementFrameProtection and saePassphrase for WPA2Personal security', () => {
    const result = getFieldsToRemoveFromWlan(WlanSecurityEnum.WPA2Personal)
    expect(result).toEqual(['saePassphrase'])
  })
  // WPA2Enterprise should has managementFrameProtection
  // eslint-disable-next-line max-len
  it('should remove managementFrameProtection and saePassphrase for WPA2Enterprise security', () => {
    const result = getFieldsToRemoveFromWlan(WlanSecurityEnum.WPA2Enterprise)
    expect(result).toEqual(['saePassphrase'])
  })

  it('should remove managementFrameProtection and saePassphrase for WPAEnterprise security', () => {
    const result = getFieldsToRemoveFromWlan(WlanSecurityEnum.WPAEnterprise)
    expect(result).toEqual(['saePassphrase'])
  })

  it('should remove managementFrameProtection and saePassphrase for WPAPersonal security', () => {
    const result = getFieldsToRemoveFromWlan(WlanSecurityEnum.WPAPersonal)
    expect(result).toEqual(['saePassphrase'])
  })
})
