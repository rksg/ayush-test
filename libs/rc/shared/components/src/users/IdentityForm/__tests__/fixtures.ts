

export const mockPersonaGroupList = {
  totalPages: 1,
  totalElements: 82,
  size: 2000,
  content: [
    {
      id: '0bc7a408-c4b8-416b-a798-522a5f4ec274',
      name: '000_FullAssociationGroup',
      description: 'This IG has multiple association from other resources.',
      dpskPoolId: '462ec643ea314979a7f26701f4f6e265',
      macRegistrationPoolId: 'e58b8d92-6161-4419-8028-3c1de0da97a7',
      propertyId: '1592eadff6b249efaf9a0ff71ecc0a5d',
      createdAt: '2025-02-13T10:45:02.964757Z',
      updatedAt: '2025-03-04T06:23:22.112955Z',
      certificateTemplateId: '2c85ff0fc9d84b0899c061ef88468270',
      policySetId: 'd8372603-f74a-4865-99cb-a14e14056208',
      networkCount: 0,
      links: [
        {
          rel: 'self',
          href: 'https://api.dev.ruckus.cloud/identityGroups/0bc7a408-c4b8-416b-a798-522a5f4ec274'
        }
      ],
      personalIdentityNetworkId: null,
      identities: null,
      identityCount: 6
    }
  ],
  number: 0,
  sort: {
    empty: false,
    unsorted: false,
    sorted: true
  },
  first: true,
  last: true,
  numberOfElements: 82,
  pageable: {
    pageNumber: 0,
    pageSize: 2000,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true
    },
    offset: 0,
    unpaged: false,
    paged: true
  },
  empty: false
}

export const mockPersonaList = {
  totalPages: 0,
  totalElements: 0,
  size: 2000,
  content: [
    {
      id: 'ffabe8f0-4a0f-4207-b39d-1ff78cc13b35',
      groupId: '0bc7a408-c4b8-416b-a798-522a5f4ec274',
      parentId: '65084816-db1f-43ee-8ab5-4fbbd5100302',
      description: null,
      name: 'Identity Fake Name',
      email: null,
      dpskGuid: '2267e4fb554a4ea88ff94129636408da',
      dpskPassphrase: "eGjB'7YRn,o[*_@'W4",
      identityId: '7b0f056f-2563-4343-9553-aec74c2a50f1',
      revoked: false,
      vlan: 10,
      vni: null,
      createdAt: '2025-02-13T11:33:07.484958Z',
      updatedAt: '2025-03-05T07:10:51.857151Z',
      deviceCount: 1,
      ethernetPorts: [],
      switches: [],
      meteringProfileId: 'afd0f1f9-7fd4-4312-b0ff-cdd8b6ea3469',
      expirationDate: '2025-05-14T16:00:00Z',
      phoneNumber: null,
      primary: false
    }
  ],
  number: 0,
  sort: {
    empty: false,
    unsorted: false,
    sorted: true
  },
  first: true,
  pageable: {
    pageNumber: 0,
    pageSize: 2000,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true
    },
    offset: 0,
    unpaged: false,
    paged: true
  },
  last: true,
  numberOfElements: 0,
  empty: true
}
