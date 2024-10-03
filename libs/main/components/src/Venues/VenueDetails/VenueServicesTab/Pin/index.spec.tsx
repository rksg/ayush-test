import { rest } from 'msw'

import { EdgePinFixtures, EdgePinUrls } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import { mockServer, render, screen }   from '@acx-ui/test-utils'

import { EdgePin } from '.'
const { mockPinStatsList } = EdgePinFixtures

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  PersonalIdentityNetworkServiceInfo: () =>
    <div data-testid='PersonalIdentityNetworkServiceInfo' />,
  PersonalIdentityNetworkDetailTableGroup: () =>
    <div data-testid='PersonalIdentityNetworkDetailTableGroup' />
}))

describe('VenueServicesTab - EdgePin(has data)', () =>{
  let params: { tenantId: string, venueId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      venueId: 'testVenue'
    }

    mockServer.use(
      rest.post(
        EdgePinUrls.getEdgePinStatsList.url,
        (req, res, ctx) => res(ctx.json(mockPinStatsList))
      )
    )
  })

  it('Should render VenueServicesTab - PersonalIdentityNetwork successfully', async () => {
    render(
      <Provider>
        <EdgePin />
      </Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/services' }
      })
    expect(await screen.findByTestId('PersonalIdentityNetworkServiceInfo')).toBeVisible()
    expect(await screen.findByTestId('PersonalIdentityNetworkDetailTableGroup')).toBeVisible()
  })
})
