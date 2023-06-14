import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { AaaUrls, CommonUrlsInfo, PortalUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen }                            from '@acx-ui/test-utils'
import { UserUrlsInfo }                                          from '@acx-ui/user'

import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  cloudpathResponse,
  networkDeepResponse,
  dhcpResponse,
  portalList
} from '../__tests__/fixtures'

import { AaaSettingsForm } from './AaaSettingsForm'

jest.mock('react-intl', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })

  return {
    ...reactIntl,
    useIntl: () => intl
  }
})
jest.mocked(useIsSplitOn).mockReturnValue(true) // mock AAA policy

describe('AAASettingForm', () => {
  beforeEach(() => {
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
      rest.get(
        AaaUrls.getAAAPolicyList.url,
        (req, res, ctx) => res(ctx.json([
          { id: '1', name: 'test1', type: 'AUTHENTICATION' },
          { id: '2', name: 'test2', type: 'ACCOUNTING' }
        ]))
      ),
      rest.post(CommonUrlsInfo.validateRadius.url, (_, res, ctx) =>
        res(ctx.json({}))
      ),
      rest.get(
        AaaUrls.getAAAPolicy.url,
        (_, res, ctx) => {return res(ctx.json({ requestId: 'request-id', id: '2', name: 'test2' }))}
      ),
      rest.put(
        AaaUrls.updateAAAPolicy.url,
        (_, res, ctx) => {return res(ctx.json({ requestId: 'request-id', id: '2', name: 'test2' }))}
      ),
      rest.post(
        AaaUrls.addAAAPolicy.url,
        (req, res, ctx) => res(ctx.json({ requestId: 'request-id',
          response: { id: '2', name: 'test2' } }))
      )
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  it('should render AAASettingForm correctly', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(404), ctx.json({}))
        })
    )
    render(<Provider><Form><AaaSettingsForm /></Form></Provider>, { route: { params } })

    await screen.findByRole('heading', { level: 3, name: 'AAA Settings' })
    // await screen.findByRole('heading', { level: 3, name: 'Select RADIUS' })
    await userEvent.click((await screen.findAllByRole('combobox'))[1])
    await userEvent.click((await screen.findByText('test1')))
    await userEvent.click((await screen.findAllByRole('switch'))[0])
    await userEvent.click((await screen.findAllByRole('switch'))[1])
    await userEvent.click((await screen.findAllByRole('combobox'))[2])
    await userEvent.click((await screen.findByText('test2')))
    await userEvent.click((await screen.findAllByRole('switch'))[2])
  })
})
