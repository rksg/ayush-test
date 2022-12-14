import '@testing-library/jest-dom'

import { rest } from 'msw'

import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import { mockServer, render } from '@acx-ui/test-utils'

import {
  venueData,
  venueSetting,
  venueNetworkApGroup
} from '../../__tests__/fixtures'

import { VenueDetailsTab } from './index'

const params = {
  tenantId: '15a04f095a8f4a96acaf17e921e8a6df',
  venueId: 'f892848466d047798430de7ac234e940'
}

describe('VenueDetailsTab', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getDashboardOverview.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json(venueSetting))),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(venueNetworkApGroup))
      )
    )
  })
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><VenueDetailsTab /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })
})
