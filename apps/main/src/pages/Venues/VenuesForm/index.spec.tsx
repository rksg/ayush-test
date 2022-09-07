import { initialize } from '@googlemaps/jest-mocks'
import { rest }       from 'msw'

import { useSplitTreatment }  from '@acx-ui/feature-toggle'
import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { VenuesForm, addressParser } from '.'

export const successResponse = { requestId: 'request-id' }

const list = {
  totalCount: 10,
  page: 1,
  data: [{
    city: 'New York',
    country: 'United States',
    description: 'My-Venue',
    id: '2c16284692364ab6a01f4c60f5941836',
    latitude: '40.769141',
    longitude: '-73.9429713',
    name: 'My-Venue',
    status: '1_InSetupPhase',
    aggregatedApStatus: { '1_01_NeverContactedCloud': 1 }
  }, {
    city: 'Sunnyvale, California',
    country: 'United States',
    description: '',
    id: 'a919812d11124e6c91b56b9d71eacc31',
    latitude: '37.4112751',
    longitude: '-122.0191908',
    name: 'test',
    status: '1_InSetupPhase',
    switchClients: 2,
    switches: 1,
    clients: 1
  }]
}

const autocompleteResult = {
  address_components: [
    {
      long_name: '350',
      short_name: '350',
      types: [
        'street_number'
      ]
    },
    {
      long_name: 'West Java Drive',
      short_name: 'W Java Dr',
      types: [
        'route'
      ]
    },
    {
      long_name: 'Sunnyvale',
      short_name: 'Sunnyvale',
      types: [
        'locality',
        'political'
      ]
    },
    {
      long_name: 'Santa Clara County',
      short_name: 'Santa Clara County',
      types: [
        'administrative_area_level_2',
        'political'
      ]
    },
    {
      long_name: 'California',
      short_name: 'CA',
      types: [
        'administrative_area_level_1',
        'political'
      ]
    },
    {
      long_name: 'United States',
      short_name: 'US',
      types: [
        'country',
        'political'
      ]
    },
    {
      long_name: '94089',
      short_name: '94089',
      types: [
        'postal_code'
      ]
    },
    {
      long_name: '1026',
      short_name: '1026',
      types: [
        'postal_code_suffix'
      ]
    }
  ],
  // eslint-disable-next-line max-len
  adr_address: '<span class=\'street-address\'>350 W Java Dr</span>, <span class=\'locality\'>Sunnyvale</span>, <span class=\'region\'>CA</span> <span class=\'postal-code\'>94089-1026</span>, <span class=\'country-name\'>USA</span>',
  formatted_address: '350 W Java Dr, Sunnyvale, CA 94089, USA',
  geometry: {
    location: {
      lat: () => 37.4112751,
      lng: () => -122.0191908
    },
    viewport: {
      northeast: {
        lat: 37.4128056302915,
        lng: -122.0180266697085
      },
      southwest: {
        lat: 37.4101076697085,
        lng: -122.0207246302915
      }
    }
  },
  icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png',
  icon_background_color: '#7B9EB0',
  icon_mask_base_uri: 'https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet',
  name: '350 W Java Dr',
  place_id: 'ChIJp5L7yL63j4ARCqQI-eAJu0A',
  reference: 'ChIJp5L7yL63j4ARCqQI-eAJu0A',
  types: [
    'premise'
  ],
  // eslint-disable-next-line max-len
  url: 'https://maps.google.com/?q=350+W+Java+Dr,+Sunnyvale,+CA+94089,+USA&ftid=0x808fb7bec8fb92a7:0x40bb09e0f908a40a',
  utc_offset: -420,
  vicinity: 'Sunnyvale'
}

const timezoneResult = {
  dstOffset: 3600,
  rawOffset: -28800,
  status: 'OK',
  timeZoneId: 'America/Los_Angeles',
  timeZoneName: 'Pacific Daylight Time'
}

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
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        'https://maps.googleapis.com/maps/api/timezone/*',
        (req, res, ctx) => res(ctx.json(timezoneResult))
      )
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

    fireEvent.click(screen.getByText('Next'))
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
    const { asFragment } = render(
      <Provider>
        <VenuesForm />
      </Provider>, {
        route: { params, path: '/:tenantId/venues/add' }
      })

    expect(asFragment()).toMatchSnapshot()

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

    fireEvent.click(screen.getByText('Cancel'))
  })
})
