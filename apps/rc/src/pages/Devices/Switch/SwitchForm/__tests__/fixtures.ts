export const venueListResponse = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 5,
  page: 1,
  data: [
    {
      id: '4c778ed630394b76b17bce7fe230cf9f',
      name: 'My-Venue'
    },
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
      id: 'a678f2e5767746a394a7b10c45235119',
      name: 'sadas'
    }
  ]
}


export const swtichListResponse = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'FEK0000S0A0',
      serialNumber: 'FEK0000S0A0',
      name: '7150stack',
      configReady: true,
      syncDataEndTime: ''
    },
    {
      serialNumber: 'FEK0010S0A0',
      name: '7150stack',
      configReady: true,
      syncDataEndTime: ''
    },
    {
      serialNumber: 'FEK0040S0A0',
      configReady: true,
      syncDataEndTime: ''
    },
    {
      id: 'FEK0030S0A0',
      configReady: true,
      syncDataEndTime: ''
    }]
}

export const switchListEmptyResponse = {
  data: [
  ],
  fields: [
    'serialNumber',
    'name',
    'syncDataStartTime'
  ],
  page: 1,
  totalCount: 0
}

export const vlansByVenueListResponse = [
  {
    id: 'd445b8332be940a6881886a8d9a91306',
    vlanId: 2,
    vlanName: 'vvv',
    ipv4DhcpSnooping: true,
    arpInspection: false,
    igmpSnooping: 'passive',
    multicastVersion: 2,
    spanningTreeProtocol: 'rstp',
    spanningTreePriority: 32768,
    switchFamilyModels: [
      {
        id: 'b6e7fbdfaaa04194b335e95de74d2398',
        model: 'ICX7550-48',
        taggedPorts: '1/1/39,1/3/1',
        slots: [
          {
            slotNumber: 2,
            enable: true,
            option: '2X40G'
          },
          {
            slotNumber: 3,
            enable: true,
            option: '2X40G'
          },
          {
            slotNumber: 1,
            enable: true
          }]
      }]
  }]

export const vlansByVenueListEmptyResponse = []
