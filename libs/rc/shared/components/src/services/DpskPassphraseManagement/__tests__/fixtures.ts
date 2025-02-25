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
      devices: [
        {
          mac: 'AA:BB:CC:11:22:44',
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
      ],
      numberOfDevices: 1,
      createdDate: '2022-12-08T09:00:00',
      identityId: '123456789'
    }
  ],
  page: 1,
  totalCount: 4,
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

export const clientMeta = {
  data: [
    {
      venueName: 'My-Venue',
      clientMac: '3c:22:fb:97:c7:ef',
      apName: 'UI team AP'
    },
    {
      venueName: 'My-Venue',
      clientMac: '3c:22:fb:c9:ab:2d',
      apName: 'UI team AP'
    },
    {
      venueName: 'My-Venue',
      clientMac: 'aa:5c:7a:99:38:a2',
      apName: 'UI team AP'
    }
  ]
}

export const mockedIdentityList = {
  content: [
    {
      id: '3fc815a5-4a1b-4c49-bfdc-0e7a6ddc562f',
      groupId: '765862a3-8e11-488b-85ae-d40a2a0ed7fd',
      parentId: '766fc3ff-5e6f-4409-8882-903a561092ef',
      description: null,
      name: 'GUEST_Empty Unit-1692957703236',
      email: null,
      dpskGuid: '931b1404a82a4bf29232b164a13d4558',
      dpskPassphrase: '\\|=G+iby2f:dyrFA[n',
      identityId: '71bbe21d-2164-4085-9787-5bee4e44468a',
      revoked: false,
      vlan: 777,
      vni: null,
      createdAt: '2023-08-25T10:01:43.260322Z',
      updatedAt: '2023-08-25T10:01:58.523098Z',
      devices: [],
      deviceCount: 0,
      ethernetPorts: [],
      switches: [],
      meteringProfileId: null,
      expirationDate: null,
      primary: false,
      links: [
        {
          rel: 'self',
          href: ''
        }
      ]
    },
    {
      id: 'd4566263-6333-442e-a18e-64948b1c5da5',
      groupId: '765862a3-8e11-488b-85ae-d40a2a0ed7fd',
      parentId: '0cb9628c-5e81-4b71-b954-de68290800b5',
      description: null,
      name: 'GUEST_Jerry Unit-1692267669147',
      email: null,
      dpskGuid: '9a2a1f03a7aa4a3fac299838eac08c66',
      dpskPassphrase: 'mqHOy;a&8rL<lN[0\\Q',
      identityId: 'd4a835da-f9f1-475b-a915-328d45a2d490',
      revoked: false,
      vlan: 2,
      vni: 8194,
      createdAt: '2023-08-17T10:21:09.207047Z',
      updatedAt: '2023-10-19T09:12:41.821112Z',
      devices: [],
      deviceCount: 0,
      ethernetPorts: [],
      switches: [],
      meteringProfileId: null,
      expirationDate: null,
      primary: false,
      links: [
        {
          rel: 'self',
          href: ''
        }
      ]
    },
    {
      id: '7fea6239-8bb8-44d3-b869-b5bce0a23b8a',
      groupId: '765862a3-8e11-488b-85ae-d40a2a0ed7fd',
      parentId: null,
      description: null,
      name: 'JerryTest',
      email: null,
      dpskGuid: 'd0e285980faa4a62a9bfa13358ebcaee',
      dpskPassphrase: '^pg_)9dnl2{(Xm:<o3',
      identityId: null,
      revoked: false,
      vlan: null,
      vni: 8193,
      createdAt: '2024-01-18T07:30:26.293634Z',
      updatedAt: '2024-01-18T07:31:02.27604Z',
      devices: [],
      deviceCount: 0,
      ethernetPorts: [],
      switches: [],
      meteringProfileId: null,
      expirationDate: null,
      primary: true,
      links: [
        {
          rel: 'self',
          href: ''
        }
      ]
    },
    {
      id: '766fc3ff-5e6f-4409-8882-903a561092ef',
      groupId: '765862a3-8e11-488b-85ae-d40a2a0ed7fd',
      parentId: null,
      description: null,
      name: 'UNIT_Empty Unit-1692957703236',
      email: null,
      dpskGuid: '3688fe0fc9cb4e64ad20ebb5b078297d',
      dpskPassphrase: 'DGPs.(L6;2fH[W6zPH',
      identityId: '71bbe21d-2164-4085-9787-5bee4e44468a',
      revoked: false,
      vlan: 666,
      vni: null,
      createdAt: '2023-08-25T10:01:43.260322Z',
      updatedAt: '2023-08-25T10:01:58.459307Z',
      devices: [],
      deviceCount: 0,
      ethernetPorts: [
        {
          macAddress: '58-FB-96-1E-29-70',
          portIndex: 1,
          identityId: '766fc3ff-5e6f-4409-8882-903a561092ef',
          personaId: '766fc3ff-5e6f-4409-8882-903a561092ef',
          name: 'cecil-r550',
          createdAt: '2023-11-29T08:04:26.222325Z',
          updatedAt: '2023-11-29T08:04:26.420555Z'
        }
      ],
      switches: [],
      meteringProfileId: null,
      expirationDate: null,
      primary: true,
      links: [
        {
          rel: 'self',
          href: 'https://'
        }
      ]
    },
    {
      id: '0cb9628c-5e81-4b71-b954-de68290800b5',
      groupId: '765862a3-8e11-488b-85ae-d40a2a0ed7fd',
      parentId: null,
      description: null,
      name: 'UNIT_Jerry Unit-1692267669146',
      email: null,
      dpskGuid: 'f3ff539030b44b3e86751f541f581e72',
      dpskPassphrase: '2-VL%?;^,<o>)Y.}Bs',
      identityId: 'd4a835da-f9f1-475b-a915-328d45a2d490',
      revoked: false,
      vlan: 1,
      vni: 8194,
      createdAt: '2023-08-17T10:21:09.207047Z',
      updatedAt: '2023-10-19T09:12:41.821112Z',
      devices: [],
      deviceCount: 0,
      ethernetPorts: [],
      switches: [],
      meteringProfileId: null,
      expirationDate: null,
      primary: true,
      links: [
        {
          rel: 'self',
          href: 'https://'
        }
      ]
    }
  ],
  pageable: {
    sort: {
      unsorted: false,
      sorted: true,
      empty: false
    },
    pageNumber: 0,
    pageSize: 10,
    offset: 0,
    paged: true,
    unpaged: false
  },
  totalElements: 5,
  totalPages: 1,
  last: true,
  numberOfElements: 5,
  first: true,
  size: 10,
  number: 0,
  sort: {
    unsorted: false,
    sorted: true,
    empty: false
  },
  empty: false
}
