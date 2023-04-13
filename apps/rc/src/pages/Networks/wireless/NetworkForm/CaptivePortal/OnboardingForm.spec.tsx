import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, GuestNetworkTypeEnum, PortalUrlsInfo, WifiUrlsInfo }        from '@acx-ui/rc/utils'
import { Provider }                                                                  from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                              from '@acx-ui/user'

import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  networkDeepResponse,
  dhcpResponse,
  portalList,
  externalProviders
} from '../__tests__/fixtures'
import NetworkForm from '../NetworkForm'

async function fillInBeforeSettings (networkName: string) {
  const insertInput = await screen.findByLabelText(/Network Name/)
  fireEvent.change(insertInput, { target: { value: networkName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating, { timeout: 7000 })
  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
  await waitFor(async () => {
    expect(await screen.findByRole('heading', { level: 3, name: 'Portal Type' })).toBeVisible()
  })
  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
}
describe('CaptiveNetworkForm-ClickThrough', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'Click through network test'
    const clickThroughData = { ...networkDeepResponse, enableDhcp: true, type: 'guest',
      guestPortal: { redirectUrl: 'dbaidu.com', guestNetworkType: GuestNetworkTypeEnum.ClickThrough
      } }
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
      rest.get(WifiUrlsInfo.GetDefaultDhcpServiceProfileForGuestNetwork.url,
        (_, res, ctx) => res(ctx.json(dhcpResponse))),
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(clickThroughData))),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [clickThroughData] }))),
      rest.get(CommonUrlsInfo.getExternalProviders.url,
        (_, res, ctx) => res(ctx.json(externalProviders))),
      rest.get(PortalUrlsInfo.getPortalProfileList.url
        .replace('?pageSize=:pageSize&page=:page&sort=:sort', ''),
      (_, res, ctx) => res(ctx.json({ content: portalList }))
      ),
      rest.get(CommonUrlsInfo.getCloudpathList.url, (_, res, ctx) =>
        res(ctx.json([]))
      ),
      rest.post(PortalUrlsInfo.savePortal.url,
        (_, res, ctx) => res(ctx.json({
          requestId: 'request-id', id: 'test', serviceName: 'test' }))
      ),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the' }))
        })
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', action: 'edit' }

  it.skip('should test Click through network successfully', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })
    await fillInBeforeSettings('Click through network test')

    await userEvent.click(await screen.findByRole('checkbox', { name: /Redirect users to/ }))
    const redirectUrlInput = await screen.findByPlaceholderText('e.g. http://www.example.com')
    fireEvent.change(redirectUrlInput, { target: { value: 'https://www.commscope.com/ruckus/' } })
    await userEvent.click(await screen.findByRole('checkbox', { name: /Redirect users to/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Enable RUCKUS DHCP service/ }))
  })
})
