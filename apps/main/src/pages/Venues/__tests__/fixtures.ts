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

export const configProfiles = [{
  id: '771f6e6b21af43fa8879e10170114fc4',
  name: 'profile-cli01',
  profileType: 'CLI',
  venueCliTemplate: {
    cli: 'manager registrar\n bbb',
    id: '361a51cd00804f498b28eab9f7114227',
    name: 'profile-cli01',
    overwrite: false,
    switchModels: 'ICX7150-24'
  }
}, {
  id: '6a757409dc1f47c2ad48689db4a0846a',
  name: 'profile01',
  profileType: 'Regular',
  venues: ['My-Venue', 'My-Venue2']
}, {
  id: '69248dfe1d5b400199304447b45a1700',
  name: 'profile-cli03',
  profileType: 'CLI',
  venueCliTemplate: {
    cli: 'manager registrar\n profile-cli03 cli test',
    id: '3ace41aef9be4f4087baf0af96bbed67',
    name: 'profile-cli03',
    overwrite: false,
    switchModels: 'ICX7150-24F,ICX7850-48F,ICX7850-48FS'
  }
}, {
  id: '7d6efb0dec2d4a58a08056045982ef6a',
  name: 'profile-cli02',
  profileType: 'CLI',
  venueCliTemplate: {
    cli: 'manager registrar\n qqq',
    id: '1c5dca60d0b8464a9163436405ece945',
    name: 'profile-cli02',
    overwrite: false,
    switchModels: 'ICX7150-24,ICX7550-24P'
  },
  venues: ['Venue01']
}, {
  acls: [{
    aclType: 'standard',
    id: 'ae7ea5418aee4048b8122e2ae20a243b',
    name: 'aaa'
  }],
  id: '74ee9d8bb08b47218926d9bc33f6167f',
  name: 'profile02',
  profileType: 'Regular',
  trustedPorts: [{
    id: '89892eff25b64ac0ada800f0e5cd736c',
    model: 'ICX7150-48',
    slots: [
      { slotNumber: 3, enable: true, option: '4X1/10G' },
      { slotNumber: 2, enable: true, option: '2X1G' },
      { slotNumber: 1, enable: true }
    ],
    trustPorts: ['1/1/1', '1/1/4'],
    trustedPortType: 'all',
    vlanDemand: false
  }, {
    id: '2cdada96178343be93c6b8a998115259',
    model: 'ICX7850-48FS',
    slots: [{ slotNumber: 2, enable: true, option: '8X40/100G' }, { slotNumber: 1, enable: true }],
    trustPorts: ['1/1/3'],
    trustedPortType: 'all',
    vlanDemand: false
  }],
  vlans: [{
    arpInspection: false,
    id: '0abd832af3e542f58341c85cf180ab2b',
    igmpSnooping: 'passive',
    ipv4DhcpSnooping: true,
    multicastVersion: 3,
    spanningTreeProtocol: 'stp',
    vlanId: 2
  }]
}]

export const venueSwitchSetting = [{
  cliApplied: false,
  id: '45aa5ab71bd040be8c445be8523e0b6c',
  name: 'My-Venue',
  profileId: ['6a757409dc1f47c2ad48689db4a0846a'],
  switchLoginPassword: 'xxxxxxxxx',
  switchLoginUsername: 'admin',
  syslogEnabled: false
}, {
  cliApplied: true,
  dns: ['1.1.1.10'],
  id: '45aa5ab71bd040be8c445be8523e0b6c',
  name: 'My-Venue',
  profileId: ['771f6e6b21af43fa8879e10170114fc4', '69248dfe1d5b400199304447b45a1700'],
  switchLoginPassword: 'xxxxxxxxx',
  switchLoginUsername: 'admin',
  syslogEnabled: false
}, {
  cliApplied: false,
  id: '45aa5ab71bd040be8c445be8523e0b6c',
  name: 'My-Venue',
  profileId: ['74ee9d8bb08b47218926d9bc33f6167f'],
  switchLoginPassword: 'xxxxxxxxx',
  switchLoginUsername: 'admin',
  syslogEnabled: false
}]

export const switchConfigProfile = [{
  id: '6a757409dc1f47c2ad48689db4a0846a',
  name: 'profile01',
  profileType: 'Regular',
  venues: ['45aa5ab71bd040be8c445be8523e0b6c']
}, {
  id: '74ee9d8bb08b47218926d9bc33f6167f',
  name: 'profile02',
  profileType: 'Regular',
  acls: [{
    aclRules: [{
      sequence: 65000,
      action: 'permit',
      source: 'any',
      id: 'c2a17d8e5ea048baa220a6ca1a68ad54'
    }],
    name: 'test-acl',
    aclType: 'standard',
    id: 'ae7ea5418aee4048b8122e2ae20a243b'
  }],
  trustedPorts: [{
    id: '89892eff25b64ac0ada800f0e5cd736c',
    model: 'ICX7150-48',
    slots: [
      { slotNumber: 3, enable: true, option: '4X1/10G' },
      { slotNumber: 2, enable: true, option: '2X1G' },
      { slotNumber: 1, enable: true }
    ],
    trustPorts: ['1/1/1', '1/1/4'],
    trustedPortType: 'all',
    vlanDemand: false
  }, {
    id: '2cdada96178343be93c6b8a998115259',
    model: 'ICX7850-48FS',
    slots: [
      { slotNumber: 2, enable: true, option: '8X40/100G' },
      { slotNumber: 1, enable: true }
    ],
    trustPorts: ['1/1/3'],
    trustedPortType: 'all',
    vlanDemand: false
  }],
  vlans: [{
    vlanId: 2,
    vlanName: 'test-vlan',
    ipv4DhcpSnooping: true,
    arpInspection: false,
    igmpSnooping: 'passive',
    multicastVersion: 3,
    spanningTreeProtocol: 'stp',
    switchFamilyModels: [{
      id: '5b902550c38343198059598a074c0e01',
      model: 'ICX7550-24P',
      slots: [{ slotNumber: 2, enable: true, option: '2X40G' },
        { slotNumber: 1, enable: true },
        { slotNumber: 3, enable: true, option: '2X40G' }
      ],
      taggedPorts: '1/1/2',
      untaggedPorts: '1/1/22,1/1/24'
    }],
    id: '0abd832af3e542f58341c85cf180ab2b'
  }]
}]
