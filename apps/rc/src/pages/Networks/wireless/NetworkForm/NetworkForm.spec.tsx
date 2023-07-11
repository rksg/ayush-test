import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn, useIsTierAllowed }                        from '@acx-ui/feature-toggle'
import { AaaUrls, CommonUrlsInfo, PortalUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
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
  venueListResponse,
  networksResponse,
  successResponse,
  cloudpathResponse,
  networkDeepResponse,
  portalList
} from './__tests__/fixtures'
import NetworkForm from './NetworkForm'

export const dhcpResponse = {
  name: 'DHCP-Guest',
  vlanId: 3000,
  subnetAddress: '172.21.232.0',
  subnetMask: '255.255.252.0',
  startIpAddress: '172.21.232.2',
  endIpAddress: '172.21.235.233',
  leaseTimeHours: 12,
  leaseTimeMinutes: 1,
  id: 'UNPERSISTED-DEFAULT-PROFILE-ID'
}
describe('NetworkForm', () => {

  beforeEach(() => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    networkDeepResponse.name = 'open network test'
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.post(WifiUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json(cloudpathResponse))),
      rest.get(WifiUrlsInfo.GetDefaultDhcpServiceProfileForGuestNetwork.url,
        (_, res, ctx) => res(ctx.json(dhcpResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [networkDeepResponse] }))),
      rest.get(PortalUrlsInfo.getPortalProfileList.url
        .replace('?pageSize=:pageSize&page=:page&sort=:sort', ''),
      (_, res, ctx) => res(ctx.json({ content: portalList }))),
      rest.post(PortalUrlsInfo.savePortal.url,
        (_, res, ctx) => res(ctx.json({ response: {
          requestId: 'request-id', id: 'test', serviceName: 'test' } }))),
      rest.get(AaaUrls.getAAAPolicyList.url,
        (_, res, ctx) => res(ctx.json([{ id: '1', name: 'test1' }]))),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the' }))
        })
    )
  })

  it('should create open network successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<Provider><NetworkForm /></Provider>, {
      route: { params }
    })

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

    await userEvent.click(screen.getByText('Finish'))
  })

  it('should render breadcrumb correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<Provider><NetworkForm /></Provider>, {
      route: { params }
    })
    expect(screen.getByRole('link', {
      name: /networks/i
    })).toBeTruthy()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
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

    await userEvent.click(screen.getByText('Finish'))
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
    await userEvent.click(await screen.findByText('Finish'))
    await userEvent.click(await screen.findByTitle('create Portal test'))
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Summary' })
    await userEvent.click(screen.getByText('Finish'))
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
    await userEvent.click(await screen.findByText('Finish'))
    await userEvent.click(await screen.findByTitle('create Portal test2'))
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Summary' })
    await userEvent.click(screen.getByText('Finish'))
  }, 20000)
})
