import { initialize } from '@googlemaps/jest-mocks'
import { rest }       from 'msw'

import { useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { apApi, venueApi }              from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }              from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  venuelist,
  venueCaps,
  aplist,
  apGrouplist,
  apDetailsList,
  successResponse
} from '../../../__tests__/fixtures'

import { ApDetailsTab } from './'

const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', action: 'edit' }

describe('ApDetailsTab', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    initialize()
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuelist))),
      rest.get(WifiUrlsInfo.getWifiCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueCaps))),
      rest.post(CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(aplist))),
      rest.get(CommonUrlsInfo.getApGroupList.url,
        (_, res, ctx) => res(ctx.json(apGrouplist))),
      rest.post(WifiUrlsInfo.addAp.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(WifiUrlsInfo.getAp.url,
        (_, res, ctx) => res(ctx.json(apDetailsList[0])))
    )
  })
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><ApDetailsTab /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
})