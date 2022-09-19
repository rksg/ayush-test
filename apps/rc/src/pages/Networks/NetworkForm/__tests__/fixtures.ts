export const networksResponse = {
  fields: ['name', 'id'],
  totalCount: 0,
  page: 1,
  data: []
}

export const venuesResponse = {
  fields: [
    'country','city','aps','latitude','switches','description',
    'networks','switchClients','vlan','radios','name','scheduling',
    'id','aggregatedApStatus','mesh','activated','longitude','status'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '6cf550cdb67641d798d804793aaa82db',name: 'My-Venue',
      description: 'My-Venue',city: 'New York',country: 'United States',
      latitude: '40.7690084',longitude: '-73.9431541',switches: 2,
      status: '1_InSetupPhase',mesh: { enabled: false }
    },{
      id: 'c6ae1e4fb6144d27886eb7693ae895c8',name: 'TDC_Venue',
      description: 'Taipei',city: 'Zhongzheng District, Taipei City',
      country: 'Taiwan',latitude: '25.0346703',longitude: '121.5218293',
      networks: { count: 1,names: ['JK-Network'],vlans: [1] },
      aggregatedApStatus: { '2_00_Operational': 1 },
      switchClients: 1,switches: 1,status: '2_Operational',
      mesh: { enabled: false }
    }
  ]
}

export const venueListResponse = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 5,
  page: 1,
  data: [
    {
      id: '01b1fe5d153d4a2a90455795af6ad877',
      name: 'airport'
    },
    {
      id: 'b2efc20b6d2b426c836d76110f88941b',
      name: 'dsfds'
    },
    {
      id: 'f27f33e0475d4f49af57350fed788c7b',
      name: 'SG office'
    },
    {
      id: '4c778ed630394b76b17bce7fe230cf9f',
      name: 'My-Venue'
    },
    {
      id: 'a678f2e5767746a394a7b10c45235119',
      name: 'sadas'
    }
  ]
}

export const successResponse = { requestId: 'request-id' }

export const cloudpathResponse = [{
  authRadius: {
    primary: {
      ip: '5.54.58.5',
      port: 56,
      sharedSecret: '454545'
    },
    id: 'c615bf8c82dc404ebb98c7e89672ef29'
  },
  deploymentType: 'Cloud',
  id: '6edb22ef74b143f280f2eb3105053840',
  name: 'cloud_02'
}, {
  authRadius: {
    primary: {
      ip: '3.2.34.5',
      port: 56,
      sharedSecret: 'GFHFGH'
    },
    id: '296ee3f68c434aa4bc3b3ba1f7272806'
  },
  deploymentType: 'Cloud',
  id: '5cc1d4a21c4d41b8ab1a839a0e03cc8c',
  name: 'cloud_01'
}]
