export const profilesExistResponse = {
  fields: ['name', 'id'],
  totalCount: 0,
  page: 1,
  data: []
}

export const venues = {
  fields: [
    'country',
    'switchProfileId',
    'city',
    'name',
    'switches',
    'id',
    'check-all',
    'switchProfileName',
    'activated',
    'status'
  ],
  totalCount: 13,
  page: 1,
  data: [
    {
      id: 'a98653366d2240b9ae370e48fab3a9a1',
      name: 'My-Venue',
      city: 'New York',
      country: 'United States',
      switches: 5,
      status: '1_InSetupPhase'
    },
    {
      id: 'f8da55210928402fa5a470642d80de53',
      name: 'test',
      city: 'Sunnyvale, California',
      country: 'United States',
      switches: 1,
      status: '1_InSetupPhase'
    },
    {
      id: '40e822f837244de7b477968751126adb',
      name: 'test 2',
      city: 'Sunnyvale, California',
      country: 'United States',
      status: '1_InSetupPhase'
    },
    {
      id: 'ca211ea6e80b456d891556690ae9db1c',
      name: 'test-cli',
      city: 'Sunnyvale, California',
      country: 'United States',
      status: '1_InSetupPhase'
    },
    {
      id: '9f8392862b794b78b9a060d7bcfa87fc',
      name: 'test11',
      city: 'Sunnyvale, California',
      country: 'United States',
      status: '1_InSetupPhase'
    },
    {
      id: '1cecae1a7fcb4e6384a64e04da856b67',
      name: 'test2',
      city: 'Sunnyvale, California',
      country: 'United States',
      status: '1_InSetupPhase'
    },
    {
      id: 'dbbf5c79734e46ceae7774edda115a69',
      name: 'test3',
      city: 'Sunnyvale, California',
      country: 'United States',
      status: '1_InSetupPhase'
    },
    {
      id: '31627147b1314b9c9ceb82428fdfaba2',
      name: 'test4',
      city: 'Sunnyvale, California',
      country: 'United States',
      status: '1_InSetupPhase'
    },
    {
      id: '3c65d1a312fd48ebad91ee3225883bda',
      name: 'test5',
      city: 'Sunnyvale, California',
      country: 'United States',
      status: '1_InSetupPhase'
    },
    {
      id: '9aab74689c444bbfa2585d2d13be30f7',
      name: 'test6',
      city: 'Sunnyvale, California',
      country: 'United States',
      status: '1_InSetupPhase'
    }
  ]
}

export const familyModels = []

export const profile = {
  id: 'b27ddd7be108495fb9175cec5930ce63',
  name: 'testprofile',
  acls: [
    {
      id: '9e062359d5644facae4bc0d9e9fb87e9',
      name: '1',
      aclType: 'standard',
      aclRules: [
        {
          id: '990453de8cbe4922bb9778fe158de039',
          sequence: 65000,
          action: 'permit',
          protocol: 'ip',
          source: 'any'
        }
      ]
    }
  ],
  vlans: [
    {
      id: '73e46643d9ed408fa20a901ccffa358f',
      vlanId: 1,
      ipv4DhcpSnooping: false,
      arpInspection: false,
      igmpSnooping: 'none',
      spanningTreeProtocol: 'none',
      spanningTreePriority: 32768,
      switchFamilyModels: [
        {
          id: 'ed79373de6a949c6bf05220fb64b1743',
          model: 'ICX7150-24',
          taggedPorts: '1/1/2',
          untaggedPorts: '1/1/1',
          slots: [
            { slotNumber: 3, enable: true, option: '4X1/10G' },
            { slotNumber: 1, enable: true },
            { slotNumber: 2, enable: true, option: '2X1G' }
          ]
        }
      ]
    }
  ],
  profileType: 'Regular',
  venues: ['f8da55210928402fa5a470642d80de53']
}

export const profilewithtp = {
  id: '0c90ce8d0d104a46a182ef4bcfa653ce',
  name: 'test',
  vlans: [
    {
      id: '4109a93dee844ed7a0c237b92f7d6824',
      vlanId: 1,
      ipv4DhcpSnooping: true,
      arpInspection: true,
      igmpSnooping: 'none',
      spanningTreeProtocol: 'none',
      spanningTreePriority: 32768,
      switchFamilyModels: [
        {
          id: '51354bd168e24924a92cc9a217f7d79a',
          model: 'ICX7150-24',
          untaggedPorts: '1/1/1',
          slots: [
            {
              slotNumber: 2,
              enable: true,
              option: '2X1G'
            },
            {
              slotNumber: 3,
              enable: true,
              option: '4X1/10G'
            },
            {
              slotNumber: 1,
              enable: true
            }
          ]
        }
      ]
    }
  ],
  trustedPorts: [
    {
      id: 'a5640fa830b24be4a16ad7a7ef319d4c',
      trustedPortType: 'all',
      model: 'ICX7150-24',
      vlanDemand: true,
      trustPorts: [
        '1/1/1'
      ],
      slots: [
        {
          slotNumber: 1,
          enable: true
        },
        {
          slotNumber: 3,
          enable: true
        },
        {
          slotNumber: 2,
          enable: true
        }
      ]
    }
  ],
  profileType: 'Regular',
  venueCount: 0
}
