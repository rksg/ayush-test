export const successResponse = {
  requestId: 'request-id'
}

export const venuelist = {
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

export const venueDetailHeaderData = {
  activeNetworkCount: 1,
  aps: {
    totalApCount: 1
  },
  totalClientCount: 2,
  venue: {
    name: 'testVenue'
  }
}

export const venueData = {
  address: {
    addressLine: '1093 Main St, New York, NY, 10044, United States',
    city: 'New York',
    country: 'United States',
    latitude: 40.7690084,
    longitude: -73.9431541,
    timezone: 'America/New_York'
  },
  createdDate: '2022-07-08T04:59:22.351+00:00',
  description: 'My-Venue',
  floorPlans: [],
  id: '4c778ed630394b76b17bce7fe230cf9f',
  name: 'My-Venue',
  updatedDate: '2022-07-08T04:59:22.351+00:00'
}

export const venueCaps = {
  apModels: [{
    ledOn: true,
    model: 'E510'
  }, {
    ledOn: true,
    model: 'H320'
  }, {
    ledOn: true,
    model: 'H350'
  }],
  version: '6.0.0.x.xxx'
}

export const venueLed = [{
  ledEnabled: true,
  model: 'E510'
}]

export const venueApModels = [{
  models: []
}]

export const autocompleteResult = {
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

export const timezoneResult = {
  dstOffset: 3600,
  rawOffset: -28800,
  status: 'OK',
  timeZoneId: 'America/Los_Angeles',
  timeZoneName: 'Pacific Daylight Time'
}
