import { CreateDpskPassphrasesFormFields, NewDpskPassphrase } from '@acx-ui/rc/utils'

export const mockedTenantId = '15320bc221d94d2cb537fa0189fee742'

export const mockedServiceId = '4b76b1952c80401b8500b00d68106576'

export const mockedDpsk = {
  id: '123456789',
  name: 'Fake DPSK',
  passphraseLength: 16,
  passphraseFormat: 'NUMBERS_ONLY',
  expirationType: 'HOURS_AFTER_TIME',
  expirationOffset: 1
}

export const mockedCloudpathDpsk = {
  ...mockedDpsk,
  deviceCountLimit: 1,
  policyDefaultAccess: true
}

export const mockedDpskPassphraseFormFields: Partial<CreateDpskPassphrasesFormFields> = {
  numberOfPassphrases: 5,
  numberOfDevices: 1,
  username: 'User 1',
  vlanId: '123'
}

export const mockedSingleDpskPassphrase: Partial<CreateDpskPassphrasesFormFields> = {
  numberOfPassphrases: 1,
  numberOfDevices: 1,
  passphrase: '12345678',
  username: 'User 1',
  vlanId: '123',
  mac: 'aa:bb:cc:dd:ee:ff'
}

export const mockedDpskPassphraseList = {
  data: [
    {
      id: '__PASSPHRASE_ID_1__',
      passphrase: 'abced12345',
      username: 'DPSK_USER_1',
      vlanId: 1,
      mac: undefined,
      numberOfDevices: 3,
      createdDate: '2022-12-07T21:39:00',
      expirationDate: '2022-12-08T08:39:00'
    },
    {
      id: '__PASSPHRASE_ID_2__',
      passphrase: 'zxcvb!@#$%',
      username: 'DPSK_USER_2',
      vlanId: 2,
      mac: 'AA:BB:CC:11:22:33',
      numberOfDevices: 1,
      createdDate: '2022-12-08T09:00:00',
      expirationDate: '2022-12-09T12:00:00'
    },
    {
      id: '__PASSPHRASE_ID_3__',
      passphrase: 'JjCc87!!!!!',
      username: 'DPSK_USER_3',
      vlanId: 3,
      mac: undefined,
      numberOfDevices: 2,
      expirationDate: '2022-12-25T08:39:00',
      createdDate: '2022-12-22T14:20:00',
      revocationDate: '2022-12-24T08:00:00.000+0000',
      revocationReason: 'Revoked by Jacky'
    },
    {
      id: '__PASSPHRASE_ID_4__',
      passphrase: 'zxcvb123!@#$%',
      username: 'DPSK_USER_4',
      vlanId: 4,
      mac: 'AA:BB:CC:11:22:44',
      numberOfDevices: 1,
      createdDate: '2022-12-08T09:00:00'
    }
  ],
  page: 1,
  totalCount: 4,
  totalPages: 1
}

export const mockedDpskPassphraseListWithPersona = {
  data: [
    {
      id: '__PASSPHRASE_ID_99__',
      passphrase: 'abced12345',
      username: 'DPSK_USER_1_With_Persona',
      vlanId: 1,
      mac: null,
      numberOfDevices: 3,
      createdDate: '2022-12-07T21:39:00',
      expirationDate: '2022-12-08T08:39:00',
      identityId: '123456789'
    }
  ],
  page: 1,
  totalCount: 1,
  totalPages: 1
}

export const mockedDpskPassphrase: NewDpskPassphrase = {
  id: '__PASSPHRASE_ID_1__',
  passphrase: 'abced12345',
  username: 'DPSK_USER_1',
  vlanId: 1,
  createdDate: '2022-12-07T21:39:00',
  expirationDate: '2022-12-08T08:39:00'
}

export const mockedDpskPassphraseDevices = [
  {
    mac: 'AD:2C:3B:1D:4D:4E',
    isOnline: null,
    lastConnected: null,
    lastConnectedNetwork: null,
    devicePassphrase: 'a%sdfa@gw342r3f'
  },
  {
    mac: 'AD:2C:3B:1D:4D:5E',
    isOnline: null,
    lastConnected: null,
    lastConnectedNetwork: null,
    devicePassphrase: 'a%sdfa@gw332r3f'
  }
]

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

export const mockedDpskPassphraseMultipleDevices = {
  id: '9e7a4796ff0c47b580644f1442e254c0',
  passphrase: 'pvH`/k3k1iv2=xjoHR',
  username: 'DPSK_User_347',
  numberOfDevices: 5,
  createdDate: '2023-09-01T02:55:36.357257'
}

export const mockedDevices = [
  {
    mac: '11:22:33:44:55:66',
    lastConnectedNetwork: null,
    lastConnectedNetworkId: null,
    lastConnectedTime: null,
    deviceConnectivity: 'CONFIGURED'
  },
  {
    mac: '36:29:3f:06:15:15',
    lastConnectedNetwork: '0905dsae',
    lastConnectedNetworkId: 'cc304058648342c18be8adc65169ca97',
    lastConnectedTime: '2023-09-05T07:09:08.695762',
    deviceConnectivity: 'CONNECTED'
  },
  {
    mac: 'b6:d8:e3:ad:e0:37',
    lastConnectedNetwork: '0905dsae',
    lastConnectedNetworkId: 'cc304058648342c18be8adc65169ca97',
    lastConnectedTime: '2023-09-05T07:27:54.475295',
    deviceConnectivity: 'CONNECTED'
  },
  {
    mac: 'e6:f9:c7:0a:5a:20',
    lastConnectedNetwork: '0905dsae',
    lastConnectedNetworkId: 'cc304058648342c18be8adc65169ca97',
    lastConnectedTime: '2023-09-05T07:50:00.169552',
    deviceConnectivity: 'CONNECTED'
  },
  {
    mac: 'c2:05:ec:c1:dc:a1',
    lastConnectedNetwork: '0905dsae',
    lastConnectedNetworkId: 'cc304058648342c18be8adc65169ca97',
    lastConnectedTime: '2023-09-05T08:39:42.73776',
    deviceConnectivity: 'CONNECTED'
  },
  {
    mac: 'c8:89:f3:de:99:f2',
    lastConnectedNetwork: '0905dsae',
    lastConnectedNetworkId: 'cc304058648342c18be8adc65169ca97',
    lastConnectedTime: '2023-09-07T02:09:39.672192',
    deviceConnectivity: 'CONNECTED'
  }
]
