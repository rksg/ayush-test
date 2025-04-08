import { IdentityClient, NewTablePageable, NewTableResult } from '@acx-ui/rc/utils'

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

const defaultPageable: NewTablePageable = {
  offset: 0,
  pageNumber: 0,
  pageSize: 10,
  paged: true,
  sort: {
    unsorted: true,
    sorted: false,
    empty: false
  },
  unpaged: false
}

export const mockedIdentityClientList: NewTableResult<IdentityClient> = {
  totalElements: 10,
  totalPages: 0,
  sort: {
    unsorted: false,
    sorted: false,
    empty: false
  },
  content: [
    {
      id: '3fc815a5-4a1b-4c49-bfdc-0e7a6ddc562f',
      tenantId: '765862a3-8e11-488b-85ae-d40a2a0ed7fd',
      groupId: '765862a3-8e11-488b-85ae-d40a2a0ed7fd',
      identityId: '3fc815a5-4a1b-4c49-bfdc-0e7a6ddc562f',
      clientMac: '11:11:11:11:11:11'
    }
  ],
  pageable: defaultPageable
}

export const mockedIdentityGroupList = {
  id: '765862a3-8e11-488b-85ae-d40a2a0ed7fd',
  name: 'Jerry PG NSG',
  description: null,
  dpskPoolId: '96a673bc8149434d933d420df9c71ba5',
  certificateTemplateId: 'ddc7b2001a594a5484e56ffcae450601',
  macRegistrationPoolId: '367c2f65-7354-4add-9ba8-8f4cb24b6c29',
  propertyId: '272e58e245cd43a9b361a7e5b4c2ebc9',
  createdAt: '2023-08-17T10:17:39.259182Z',
  updatedAt: '2023-10-19T09:12:41.63074Z',
  _links: {
    self: {
      href: 'https://api.dev.ruckus.cloud/identityGroups/765862a3-8e11-488b-85ae-d40a2a0ed7fd'
    }
  },
  personalIdentityNetworkId: 'bfd65d83-b4d6-41bb-9799-decf5f78f1fa',
  identities: [
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
      primary: false
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
      primary: true
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
      primary: true
    },
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
      primary: false
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
      primary: true
    }
  ],
  identityCount: null
}

export const mockedDpskDeviceList = [
  {
    mac: '4a:a9:08:a0:4c:34',
    lastConnectedNetwork: 'JerryNewDSPKWLAN',
    lastConnectedNetworkId: 'e55f99979d9a4038a49bd294af16a584',
    lastConnectedTime: '2024-01-18T07:33:33Z',
    deviceConnectivity: 'CONNECTED',
    devicePassphrase: 'd0e285980faa4a62a9bfa13358ebcaee',
    lastConnected: '01/18/2024 07:33 AM',
    online: null
  }
]

export const mockedCertificateList = {
  fields: null,
  totalCount: 3,  // only need this field for testing the number of certificates
  totalPages: 1,
  page: 1,
  data: [
    {
      id: 'c8e7248e660941859c61fc3d936390ef',
      commonName: 'Test',
      createDate: '2024-11-17T15:21:06Z',
      notBeforeDate: '2024-10-17T15:21:06Z',
      notAfterDate: '2025-11-17T15:21:06Z',
      email: null,
      revocationDate: null,
      revocationReason: null,
      serialNumber: 'b7216676c26d8919efdcdcda8fba647b9685da0b',
      shaThumbprint: '900EE1845C7D2264D67AF6EFA3328B6E55705E1D',
      organization: '',
      keyLength: 4096,
      certificateTemplateId: 'ff2065617c8442f6bc47bba573a1867a',
      certificateTemplateName: 'CertTemplate_withoutDPSK',
      certificateAuthoritiesId: '415e8a2b39a74b6294d1f7b4cf728616',
      certificateAuthoritiesName: 'JerryDemoCA',
      locality: '',
      state: '',
      country: '',
      organizationUnit: '',
      keyUsages: [
        'DIGITAL_SIGNATURE',
        'KEY_ENCIPHERMENT'
      ],
      description: null,
      enrollmentType: 'NONE',
      identityId: '3fc815a5-4a1b-4c49-bfdc-0e7a6ddc562f'
    },
    {
      id: '6d8b4289ef06496a9dbf4e587ca5fb23',
      commonName: 'Cool',
      createDate: '2024-11-17T15:21:27Z',
      notBeforeDate: '2024-10-17T15:21:27Z',
      notAfterDate: '2025-11-17T15:21:27Z',
      email: null,
      revocationDate: null,
      revocationReason: null,
      serialNumber: '33c0e169473c1b9a79292d0a520556508797f1c0',
      shaThumbprint: 'AFF1387A8EAE4CA11ECA1E187FB25E0D0B6D2AB1',
      organization: '',
      keyLength: 4096,
      certificateTemplateId: 'ff2065617c8442f6bc47bba573a1867a',
      certificateTemplateName: 'CertTemplate_withoutDPSK',
      certificateAuthoritiesId: '415e8a2b39a74b6294d1f7b4cf728616',
      certificateAuthoritiesName: 'JerryDemoCA',
      locality: '',
      state: '',
      country: '',
      organizationUnit: '',
      keyUsages: [
        'DIGITAL_SIGNATURE',
        'KEY_ENCIPHERMENT'
      ],
      description: null,
      enrollmentType: 'NONE',
      identityId: '3fc815a5-4a1b-4c49-bfdc-0e7a6ddc562f'
    },
    {
      id: '22eb512653f04015bb3bb0a8f12ebd24',
      commonName: 'lll',
      createDate: '2024-11-17T15:22:49Z',
      notBeforeDate: '2024-10-17T15:22:49Z',
      notAfterDate: '2025-11-17T15:22:49Z',
      email: null,
      revocationDate: null,
      revocationReason: null,
      serialNumber: '51618ef94a9c3f88b870cf04f64c07965799be09',
      shaThumbprint: '2DC1C13F49D63BDA27541CA4F18AC92C1C3E0C8E',
      organization: '',
      keyLength: 4096,
      certificateTemplateId: 'ff2065617c8442f6bc47bba573a1867a',
      certificateTemplateName: 'CertTemplate_withoutDPSK',
      certificateAuthoritiesId: '415e8a2b39a74b6294d1f7b4cf728616',
      certificateAuthoritiesName: 'JerryDemoCA',
      locality: '',
      state: '',
      country: '',
      organizationUnit: '',
      keyUsages: [
        'DIGITAL_SIGNATURE',
        'KEY_ENCIPHERMENT'
      ],
      description: null,
      enrollmentType: 'NONE',
      identityId: '3fc815a5-4a1b-4c49-bfdc-0e7a6ddc562f'
    }
  ]
}