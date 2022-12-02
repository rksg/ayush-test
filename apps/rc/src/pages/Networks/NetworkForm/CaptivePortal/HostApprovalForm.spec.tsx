import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo }                                              from '@acx-ui/rc/utils'
import { Provider }                                                                  from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  networkDeepResponse,
  dhcpResponse
} from '../__tests__/fixtures'
import NetworkForm from '../NetworkForm'

async function fillInBeforeSettings (networkName: string) {
  const insertInput = await screen.findByLabelText(/Network Name/)
  fireEvent.change(insertInput, { target: { value: networkName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating)

  await userEvent.click(await screen.findByRole('radio', { name: /through a captive portal/ }))
  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

  await waitFor(async () => {
    expect(await screen.findByRole('heading', { level: 3, name: 'Portal Type' })).toBeVisible()
  })
  await userEvent.click(await screen.findByRole('radio', { name: /Users register their details/ }))
  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
}

async function fillInAfterSettings (checkSummary: Function, waitForIpValidation?: boolean) {
  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
  if (waitForIpValidation) {
    const validating = await screen.findAllByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
  }
  await screen.findByRole('heading', { level: 3, name: 'Venues' })

  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
  await screen.findByRole('heading', { level: 3, name: 'Summary' })

  checkSummary()
  const finish = await screen.findByText('Finish')
  await userEvent.click(finish)
  await waitForElementToBeRemoved(finish)
}

describe('CaptiveNetworkForm-HostApproval', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'Host approval network test'
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
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [networkDeepResponse] })))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  it('should create Host approval network successfully', async () => {
    const { asFragment } = render(<Provider><NetworkForm /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()

    await fillInBeforeSettings('Host approval network test')

    await userEvent.click(await screen.findByRole('checkbox', { name: /Redirect users to/ }))
    const redirectUrlInput = await screen.findByPlaceholderText('e.g. http://www.example.com')
    fireEvent.change(redirectUrlInput, { target: { value: 'https://www.commscope.com/ruckus/' } })
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Enable Ruckus DHCP service/ }))
    await userEvent.click(await screen.findByText('More details'))
    const insertInput = await screen.findByLabelText(/Host Domains/)
    fireEvent.change(insertInput, { target: { value: 'www.123.com,222.com' } })
    fireEvent.blur(insertInput)
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /1 Hour/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /4 Hours/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /1 Hour/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /1 Day/ }))
    await userEvent.click(await screen.findByText('Next'))
    await screen.findByRole('heading', { level: 3, name: 'Portal Web Page' })
    await userEvent.click(await screen.findByText('Add Guest Portal Service'))
    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Service Name' }),'create Portal test')
    await userEvent.click(await screen.findByText('Reset'))
    await userEvent.click(await screen.findByText('Finish'))
    await userEvent.click(await screen.findByText('Next'))

    await fillInAfterSettings(async () => {
      expect(await screen.findByText('Host approval network test')).toBeVisible()
    })
  })

})
