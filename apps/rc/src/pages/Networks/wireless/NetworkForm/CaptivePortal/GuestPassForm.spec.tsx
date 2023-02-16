import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  CommonUrlsInfo,
  GuestNetworkTypeEnum,
  PortalUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                                                                  from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  networkDeepResponse,
  dhcpResponse,
  cloudpathResponse,
  externalProviders,
  portalList
} from '../__tests__/fixtures'
import NetworkForm from '../NetworkForm'

async function fillInBeforeSettings (networkName: string) {
  const insertInput = await screen.findByLabelText(/Network Name/)
  fireEvent.change(insertInput, { target: { value: networkName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating, { timeout: 7000 })

  //await userEvent.click(await screen.findByRole('radio', { name: /through a captive portal/ }))
  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

  await waitFor(async () => {
    expect(await screen.findByRole('heading', { level: 3, name: 'Portal Type' })).toBeVisible()
  })
  //await userEvent.click(await screen.findByRole('radio', { name: /with personal password/ }))
  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
}

describe('CaptiveNetworkForm-GuestPass', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'Guest Pass network test'
    const guestPassData = { ...networkDeepResponse, enableDhcp: true, type: 'guest', guestPortal: {
      redirectUrl: 'dbaidu.com', guestNetworkType: GuestNetworkTypeEnum.GuestPass
    } }
    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.post(WifiUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(WifiUrlsInfo.GetDefaultDhcpServiceProfileForGuestNetwork.url,
        (_, res, ctx) => res(ctx.json(dhcpResponse))),
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(guestPassData))),
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json(cloudpathResponse))),
      rest.get(CommonUrlsInfo.getExternalProviders.url,
        (_, res, ctx) => res(ctx.json( externalProviders ))),
      rest.get(PortalUrlsInfo.getPortalProfileList.url,
        (_, res, ctx) => res(ctx.json({ content: portalList }))
      ),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [guestPassData] })))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', action: 'edit' }

  it('should test Guest pass network successfully', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })
    await fillInBeforeSettings('Guest Pass network test')

    await userEvent.click(await screen.findByRole('checkbox', { name: /Redirect users to/ }))
    const redirectUrlInput = await screen.findByPlaceholderText('e.g. http://www.example.com')
    fireEvent.change(redirectUrlInput, { target: { value: 'https://www.commscope.com/ruckus/' } })
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Enable Ruckus DHCP service/ }))
    // await userEvent.click(await screen.findByText('More details'))
    await userEvent.click(await screen.findByText('Next'))
  })

})
