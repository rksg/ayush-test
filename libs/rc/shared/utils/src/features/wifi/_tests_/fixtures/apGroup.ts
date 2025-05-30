export const mockAPGroupList = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'f2863482681e489ab8566e2f229572aa',
      name: 'joe-apg-02'
    },
    {
      id: '58195e050b8a4770acc320f6233ad8d9',
      name: 'joe-apg-01'
    }
  ]
}

export const mockRbacAPGroupList = {
  fields: [
    'name',
    'id',
    'isDefault',
    'venueId',
    'wifiNetworkIds',
    'apSerialNumbers'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'f2863482681e489ab8566e2f229572aa',
      name: 'joe-apg-02',
      venueId: '2c16284692364ab6a01f4c60f5941836',
      isDefault: false,
      wifiNetworkIds: ['mock_network_1', 'mock_network_2'],
      apSerialNumbers: ['mock_ap_1']
    },
    {
      id: '58195e050b8a4770acc320f6233ad8d9',
      name: 'joe-apg-01',
      venueId: 'a919812d11124e6c91b56b9d71eacc31',
      isDefault: false,
      wifiNetworkIds: [],
      apSerialNumbers: ['mock_ap_2', 'mock_ap_3']
    }
  ]
}
