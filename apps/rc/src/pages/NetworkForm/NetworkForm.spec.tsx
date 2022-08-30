import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  venuesResponse,
  networksResponse,
  successResponse,
  cloudpathResponse
} from './__tests__/fixtures'
import { NetworkForm } from './NetworkForm'

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
    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.post(CommonUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json(cloudpathResponse)))
    )
  })

  it('should create open network successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(<Provider><NetworkForm /></Provider>, {
      route: { params }
    })

    expect(asFragment()).toMatchSnapshot()

    const insertInput = screen.getByLabelText('Network Name')
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

  it('should create open network with cloud path option successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    const insertInput = screen.getByLabelText('Network Name')
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
    fireEvent.mouseDown(cloudpathServer)
    const option = screen.getByText('cloud_01')
    await userEvent.click(option)

    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Summary' })

    await userEvent.click(screen.getByText('Finish'))
  })
  it('should create captive portal successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(<Provider><NetworkForm /></Provider>, {
      route: { params }
    })

    expect(asFragment()).toMatchSnapshot()

    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.post(CommonUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json(cloudpathResponse))),
      rest.get(WifiUrlsInfo.GetDefaultDhcpServiceProfileForGuestNetwork.url,
        (_, res, ctx) => res(ctx.json(dhcpResponse)))
    )

    const insertInput = screen.getByLabelText('Network Name')
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
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Summary' })
    await userEvent.click(screen.getByText('Finish'))
  })
})
