import { initialize } from '@googlemaps/jest-mocks'

import { addressParser, addressParserWithLatLng } from './addressParser'

const autocompleteResult: google.maps.places.PlaceResult = {
  address_components: [
    {
      long_name: '350',
      short_name: '350',
      types: ['street_number']
    },
    {
      long_name: 'West Java Drive',
      short_name: 'W Java Dr',
      types: ['route']
    },
    {
      long_name: 'United States',
      short_name: 'US',
      types: ['country', 'political']
    },
    {
      long_name: '94089',
      short_name: '94089',
      types: ['postal_code', 'neighborhood']
    },
    {
      long_name: '1026',
      short_name: '1026',
      types: ['postal_code_suffix', 'postal_town']
    }
  ],
  adr_address:
  // eslint-disable-next-line max-len
      "<span class='street-address'>350 W Java Dr</span>, <span class='locality'>Sunnyvale</span>, <span class='region'>CA</span> <span class='postal-code'>94089-1026</span>, <span class='country-name'>USA</span>",
  formatted_address: '350 W Java Dr, Sunnyvale, CA 94089, USA',
  geometry: {
    location: {
      lat: () => 37.4112751,
      lng: () => -122.0191908
    } as google.maps.LatLng
  },
  icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png',
  icon_background_color: '#7B9EB0',
  icon_mask_base_uri:
      'https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet',
  name: '350 W Java Dr',
  place_id: 'ChIJp5L7yL63j4ARCqQI-eAJu0A',
  types: ['premise'],
  // eslint-disable-next-line max-len
  url: 'https://maps.google.com/?q=350+W+Java+Dr,+Sunnyvale,+CA+94089,+USA&ftid=0x808fb7bec8fb92a7:0x40bb09e0f908a40a',
  utc_offset: -420,
  vicinity: 'Sunnyvale'
}

const timezoneResult = {
  dstOffset: 3600,
  rawOffset: -28800,
  timeZoneId: 'America/Los_Angeles',
  timeZoneName: 'Pacific Daylight Time'
}

describe('addressParser', () => {
  it('should call address parser', async () => {
    const { address: _address } = await addressParser(autocompleteResult)

    const addressResult = {
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      city: '1026',
      country: 'United States'
    }

    expect(_address).toEqual(addressResult)

    // with state
    const _autocompleteResult = { ...autocompleteResult }

    _autocompleteResult.address_components?.push({
      long_name: 'California',
      short_name: 'CA',
      types: ['administrative_area_level_1']
    })

    const addressResult1 = {
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      city: '1026, California',
      country: 'United States'
    }

    const { address: address1 } = await addressParser(_autocompleteResult)

    expect(address1).toEqual(addressResult1)
  })

  it('should call address parser with no city and state', async () => {
    const autocompleteResult1 = { ...autocompleteResult }

    autocompleteResult1.address_components=[{
      long_name: 'United States',
      short_name: 'US',
      types: ['country']
    },{
      long_name: 'California',
      short_name: 'CA',
      types: []
    }]

    const addressResult = {
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      city: 'United States',
      country: 'United States'
    }

    const { address } = await addressParser(autocompleteResult1)

    expect(address).toEqual(addressResult)

    // with no city only state
    const _autocompleteResult = { ...autocompleteResult }

    _autocompleteResult.address_components=[{
      long_name: 'California',
      short_name: 'CA',
      types: ['administrative_area_level_1']
    }]

    const _addressResult = {
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      city: ', California',
      country: ''
    }

    const { address: _address } = await addressParser(_autocompleteResult)

    expect(_address).toEqual(_addressResult)
  })

  it('should call address parser with lat lng', async () => {
    initialize()
    const mockedGetTimezone = jest.fn().mockResolvedValue({ data: timezoneResult })
    const { address } = await addressParserWithLatLng(autocompleteResult, mockedGetTimezone)

    const addressResult = {
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      city: '1026, California',
      country: 'United States',
      latitude: 37.4112751,
      longitude: -122.0191908,
      timezone: 'America/Los_Angeles'
    }

    expect(address).toEqual(addressResult)
  })
})
