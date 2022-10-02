import '@testing-library/jest-dom'
import { rest } from 'msw'


import { venueApi }           from '@acx-ui/rc/services'
import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider, store }    from '@acx-ui/store'
import { mockServer, render } from '@acx-ui/test-utils'


import {
  venueData,
  venueSetting
} from '../../../__tests__/fixtures'

import { NetworkingTab } from './'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

describe('MeshNetwork', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getDashboardOverview.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json(venueSetting)))
    )
  })
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><NetworkingTab /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })
})
