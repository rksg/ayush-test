import { initialize } from '@googlemaps/jest-mocks'
import userEvent      from '@testing-library/user-event'
import { rest }       from 'msw'

import { useSplitTreatment }                   from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, websocketServerUrl  } from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  venuelist,
  autocompleteResult,
  timezoneResult,
  successResponse
} from '../__tests__/fixtures'

import { VenuesForm, addressParser } from '.'

const venueResponse = {
  id: '2c16284692364ab6a01f4c60f5941836',
  createdDate: '2022-09-06T09:41:27.550+00:00',
  updatedDate: '2022-09-22T10:36:28.113+00:00',
  name: 'My-Venue',
  description: 'My-Venue',
  address: {
    country: 'New York',
    city: 'United States',
    addressLine: 'New York, NY, USA',
    latitude: 40.7127753,
    longitude: -74.0059728,
    timezone: 'America/New_York'
  }
}

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Venues Form', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    mockServer.use(
      rest.post(
        CommonUrlsInfo.addVenue.url,
        (req, res, ctx) => res(ctx.json(successResponse))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(venuelist))
      ),
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (req, res, ctx) => res(ctx.json(venueResponse))
      ),
      rest.put(
        CommonUrlsInfo.updateVenue.url,
        (req, res, ctx) => res(ctx.json(successResponse))
      ),
      rest.get(
        'https://maps.googleapis.com/maps/api/timezone/*',
        (req, res, ctx) => res(ctx.json(timezoneResult))
      ),
      rest.get(`http://localhost${websocketServerUrl}/`,
        (_, res, ctx) => res(ctx.json({})))
    )

    initialize()
  })

  it('should render venues form', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(true)

    const { asFragment } = render(
      <Provider>
        <VenuesForm />
      </Provider>, {
        route: { params, path: '/:tenantId/venues/add' }
      })

    expect(asFragment()).toMatchSnapshot()

    const venueInput = screen.getByLabelText('Venue Name')
    fireEvent.change(venueInput, { target: { value: 'Ruckus Network' } })
    fireEvent.blur(venueInput)
    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)

    const descriptionInput = screen.getByLabelText('Description')
    fireEvent.change(descriptionInput, { target: { value: 'Ruckus Network Info' } })

    const addressInput = screen.getByTestId('address-input')
    fireEvent.change(addressInput, { target:
      { value: '350 W Java Dr, Sunnyvale, CA 94089, USA' }
    })

    fireEvent.click(screen.getByText('Add'))
  })
  it('should call address parser', async () => {
    const { address } = await addressParser(autocompleteResult)

    const addressResult = {
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      city: 'Sunnyvale, California',
      country: 'United States',
      latitude: 37.4112751,
      longitude: -122.0191908,
      timezone: 'America/Los_Angeles'
    }

    expect(address).toEqual(addressResult)
  })
  it('google map is enabled', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(true)
    render(
      <Provider>
        <VenuesForm />
      </Provider>, {
        route: { params, path: '/:tenantId/venues/add' }
      })

    const addressInput = screen.getByTestId('address-input')
    expect(addressInput).toBeEnabled()
  })
  it('google map is not enabled', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(false)
    render(
      <Provider>
        <VenuesForm />
      </Provider>, {
        route: { params, path: '/:tenantId/venues/add' }
      })

    await screen.findByText('Map is not enabled')
  })
  it('should back to venues list', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(true)
    render(
      <Provider>
        <VenuesForm />
      </Provider>, {
        route: { params, path: '/:tenantId/venues/add' }
      })

    await userEvent.click(screen.getByText('Cancel'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/venues`,
      hash: '',
      search: ''
    })
  })
  it('should edit venue successfully', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(true)

    const params = {
      venueId: '2c16284692364ab6a01f4c60f5941836',
      tenantId: 'tenant-id',
      action: 'edit'
    }

    render(
      <Provider>
        <VenuesForm />
      </Provider>, {
        route: { params }
      })
    
    const venueInput = screen.getByLabelText('Venue Name')
    fireEvent.change(venueInput, { target: { value: 'Ruckus Network' } })
    fireEvent.blur(venueInput)
    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)

    fireEvent.click(screen.getByText('Save'))
  })
})
