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
  waitForElementToBeRemoved,
  waitFor
} from '@acx-ui/test-utils'

import {
  venuesResponse,
  networksResponse,
  successResponse,
  cloudpathResponse,
  networkDeepResponse,
  venueListResponse
} from './__tests__/fixtures'
import { NetworkForm } from './NetworkForm'

describe('NetworkForm', () => {

  beforeEach(() => {
    networkDeepResponse.name = 'open network test'
    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.post(WifiUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json(cloudpathResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse)))
    )
  })

  it('should create open network successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(<Provider><NetworkForm /></Provider>, {
      route: { params }
    })

    expect(asFragment()).toMatchSnapshot()

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

  it('should create open network with cloud path option successfully', async () => {
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
    await waitFor(() => screen.findByText('cloud_01'))
    const option = screen.getByText('cloud_01')
    await userEvent.click(option)

    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await userEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Summary' })

    await userEvent.click(screen.getByText('Finish'))
  })
})
