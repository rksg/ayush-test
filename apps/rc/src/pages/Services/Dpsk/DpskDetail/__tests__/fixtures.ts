export const mockedDpsk = {
  id: '123456789',
  name: 'Fake DPSK',
  passphraseLength: 16,
  passphraseFormat: 'NUMBERS_ONLY',
  expirationType: 'HOURS_AFTER_TIME',
  expirationOffset: 1
}

export const mockedNetworks = {
  fields: [
    'clients',
    'aps',
    'description',
    'check-all',
    'ssid',
    'captiveType',
    'vlan',
    'tunnelWlanEnable',
    'name',
    'venues',
    'cog',
    'vlanPool',
    'id',
    'nwSubType'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      name: 'JJac',
      id: '140ed0674f8f407da16848cc6d2bf21f',
      vlan: 1,
      nwSubType: 'dpsk',
      ssid: 'JJac',
      venues: {
        count: 0,
        names: []
      },
      aps: 0,
      clients: 0,
      tunnelWlanEnable: false
    },
    {
      name: 'leonard-dpsk',
      id: 'fac9ede6157b48bf8838a16133c15d25',
      vlan: 1,
      nwSubType: 'dpsk',
      ssid: 'leonard-dpsk',
      venues: {
        count: 1,
        names: [
          'leonard-venue'
        ]
      },
      aps: 491,
      clients: 0,
      tunnelWlanEnable: false
    },
    {
      name: 'Ray-ACX-DPSK',
      id: 'fbc382c719844c0d9e3e753e6831b00d',
      vlan: 1,
      nwSubType: 'dpsk',
      ssid: 'Ray-ACX-DPSK',
      venues: {
        count: 2,
        names: [
          'v1',
          'Raymond-Venue'
        ]
      },
      aps: 1,
      clients: 0,
      tunnelWlanEnable: false
    }
  ]
}
