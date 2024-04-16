import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo,
  IdentityProviderUrls,
  WifiOperatorUrls,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import { UserUrlsInfo } from '@acx-ui/user'

import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  cloudpathResponse,
  networkDeepResponse,
  mockHotspot20OperatorList,
  mockHotpost20IdentityProviderList
} from '../__tests__/fixtures'
import { MLOContext, NetworkForm } from '../NetworkForm'

import { Hotspot20SettingsForm } from './Hotspot20SettingsForm'

jest.mocked(useIsSplitOn).mockReturnValue(true)

async function fillInBeforeSettings (networkName: string) {
  const insertInput = screen.getByLabelText(/Network Name/)
  fireEvent.change(insertInput, { target: { value: networkName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating, { timeout: 7000 })
  await userEvent.click(screen.getByRole('radio', { name: /Hotspot 2.0 Access/ }))
  await userEvent.click(screen.getByText('Next'))
  await screen.findByRole('heading', { level: 3, name: 'Hotspot 2.0 Settings' })
  await userEvent.click((await screen.findAllByRole('combobox'))[1])
  await userEvent.click((await screen.findAllByTitle('test1'))[0])
}

async function fillInAfterSettings (checkSummary: Function) {
  await userEvent.click(screen.getByText('Next'))
  await screen.findByRole('heading', { level: 3, name: 'Venues' })
  await userEvent.click(screen.getByText('Next'))
  await screen.findByRole('heading', { level: 3, name: 'Summary' })

  checkSummary()
  const finish = screen.getByText('Finish')
  await userEvent.click(finish)
  await waitForElementToBeRemoved(finish)
}

describe('NetworkForm', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'Hotspot 20 network test'
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.post(WifiUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json(cloudpathResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [networkDeepResponse] }))),
      rest.post(IdentityProviderUrls.getIdentityProviderList.url,
        (_, res, ctx) => res(ctx.json(mockHotpost20IdentityProviderList))),
      rest.post(WifiOperatorUrls.getWifiOperatorList.url,
        (_, res, ctx) => res(ctx.json(mockHotspot20OperatorList))
      )
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  it('should render Hotspot 20 Network correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider>
      <MLOContext.Provider value={{
        isDisableMLO: true,
        disableMLO: jest.fn
      }}>
        <Form>
          <Hotspot20SettingsForm />
        </Form>
      </MLOContext.Provider>
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Hotspot 2.0 Settings/i)).toBeInTheDocument()
    expect(await screen.findByText(/Wi-Fi Operator/i)).toBeInTheDocument()
    expect(await screen.findByText(/Identity Provider/i)).toBeInTheDocument()
  })
})

