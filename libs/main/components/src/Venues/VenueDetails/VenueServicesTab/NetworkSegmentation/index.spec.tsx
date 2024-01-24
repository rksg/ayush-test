import { rest } from 'msw'

import { NetworkSegmentationUrls }    from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockedNsgStatsList } from './__tests__/fixtures'

import { NetworkSegmentation } from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  NetworkSegmentationServiceInfo: () => <div data-testid='NetworkSegmentationServiceInfo' />,
  NetworkSegmentationDetailTableGroup: () =>
    <div data-testid='NetworkSegmentationDetailTableGroup' />
}))

describe('VenueServicesTab - NetworkSegmentation(has data)', () =>{
  let params: { tenantId: string, venueId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      venueId: 'testVenue'
    }

    mockServer.use(
      rest.post(
        NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
        (req, res, ctx) => res(ctx.json(mockedNsgStatsList))
      )
    )
  })

  it('Should render VenueServicesTab - NetworkSegmentation successfully', async () => {
    render(
      <Provider>
        <NetworkSegmentation />
      </Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/services' }
      })
    expect(await screen.findByTestId('NetworkSegmentationServiceInfo')).toBeVisible()
    expect(await screen.findByTestId('NetworkSegmentationDetailTableGroup')).toBeVisible()
  })
})
