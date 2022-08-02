import { initialize }      from '@googlemaps/jest-mocks'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import { rest }            from 'msw'

import * as config            from '@acx-ui/config'
import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { VenuesForm } from '.'

export const successResponse = { requestId: 'request-id' }

describe('Venues Form', () => {
  beforeAll(async () => {
    const env = {
      GOOGLE_MAPS_KEY: 'GOOGLE_MAPS_KEY'
    }
    mockServer.use(rest.get('/env.json', (_, r, c) => r(c.json(env))))
    await config.initialize()
  })
  let params: { tenantId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    mockServer.use(
      rest.post(
        CommonUrlsInfo.addVenue.url,
        (req, res, ctx) => res(ctx.json(successResponse))
      )
    )
    initialize()
    const map = new google.maps.Map(document.createElement('div'))
    google.maps.Marker = jest.fn() as never
    google.maps.Marker.prototype.getVisible = jest.fn().mockReturnValue(true)
    google.maps.Marker.prototype.getPosition = jest.fn()
    google.maps.Marker.prototype.addListener = jest.fn()
    google.maps.Marker.prototype.setMap = jest.fn().mockImplementation(() => map)
    google.maps.Marker.prototype.getMap = jest.fn().mockImplementation(() => map)
    MarkerClusterer.prototype.getMap = jest.fn().mockImplementation(() => map)
    MarkerClusterer.prototype.setMap = jest.fn().mockImplementation(() => map)
    MarkerClusterer.prototype.getProjection = jest.fn()
  })

  it('should render venues form', async () => {
    const { asFragment } = render(
      <Provider>
        <VenuesForm />
      </Provider>, {
        route: { params, path: '/:tenantId/venues/create' }
      })

    expect(asFragment()).toMatchSnapshot()

    const venueInput = screen.getByLabelText('Venue Name')
    fireEvent.change(venueInput, { target: { value: 'Ruckus Network' } })
    fireEvent.blur(venueInput)
    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)

    const descriptionInput = screen.getByLabelText('Description')
    fireEvent.change(descriptionInput, { target: { value: 'Ruckus Network Info' } })

    const addressInput = screen.getByRole('address')
    fireEvent.change(addressInput, { target: 
      { value: '350 W Java Dr, Sunnyvale, CA 94089, USA' }
    })

    fireEvent.click(screen.getByText('Add'))
  })
})