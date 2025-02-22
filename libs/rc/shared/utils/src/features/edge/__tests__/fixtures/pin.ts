import { PassphraseFormatEnum }                           from '../../../../constants'
import { AccessSwitch, DistributionSwitch, PersonaGroup } from '../../../../types'

export const mockPinListForMutullyExclusive = {
  fields: [
    'venueId',
    'venueName',
    'edgeClusterInfo',
    'tunneledWlans',
    'name',
    'id',
    'tags',
    'edgeAlarmSummary'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '1',
      name: 'nsg1',
      vxlanTunnelProfileId: 'test123',
      tunneledWlans: [
        { networkId: 'wlan-1' }
      ],
      venueId: 'mock_venue_5',
      venueName: 'MockVenue5',
      personaGroupId: 'per-444',
      edgeClusterInfo: {
        id: '5e5a85d5-1540-4aab-86c4-a8d8b9f3e28b',
        edgeClusterId: '0000000001',
        edgeClusterName: 'Edge1',
        segments: 1,
        dhcpInfoId: 'ee61bd6e-c637-4177-b070-0ded060af3bd',
        dhcpPoolId: '6a408e31-30a0-4ac1-a672-76b666f57d6e',
        vniRange: ''
      },
      edgeAlarmSummary: [
        {
          edgeId: '0000000001',
          severitySummary: {
            critical: 1
          },
          totalCount: 1
        }
      ]
    }
  ]
}

export const mockPinStatsList = {
  fields: [
    'venueId',
    'venueName',
    'edgeClusterInfo',
    'tunneledWlans',
    'name',
    'id',
    'tags',
    'edgeAlarmSummary'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '1',
      name: 'nsg1',
      vxlanTunnelProfileId: 'test123',
      tunneledWlans: [
        { networkId: 'wlan-1' }
      ],
      venueId: 'mock_venue_1',
      venueName: 'MockVenue1',
      personaGroupId: 'per-444',
      edgeClusterInfo: {
        id: '5e5a85d5-1540-4aab-86c4-a8d8b9f3e28b',
        edgeClusterId: '0000000001',
        edgeClusterName: 'Edge1',
        segments: 1,
        dhcpInfoId: 'ee61bd6e-c637-4177-b070-0ded060af3bd',
        dhcpPoolId: '6a408e31-30a0-4ac1-a672-76b666f57d6e',
        vniRange: ''
      },
      edgeAlarmSummary: [
        {
          edgeId: '0000000001',
          severitySummary: {
            critical: 1
          },
          totalCount: 1
        }
      ]
    },
    {
      id: '2',
      name: 'nsg2',
      vxlanTunnelProfileId: 'test123',
      tunneledWlans: [
        { networkId: 'wlan2' }
      ],
      venueId: 'mock_venue_2',
      venueName: 'MockVenue2',
      personaGroupId: 'per-444',
      edgeClusterInfo: {
        id: '5e5a85d5-1540-4aab-86c4-a8d8b9f3e28b',
        edgeClusterId: '0000000002',
        edgeClusterName: 'Edge2',
        segments: 10,
        dhcpInfoId: 'ee61bd6e-c637-4177-b070-0ded060af3bd',
        dhcpPoolId: '6a408e31-30a0-4ac1-a672-76b666f57d6e',
        vniRange: ''
      }
    }
  ]
}

export const mockPinData = {
  id: '2599f95d-86a2-470c-9679-e739de054ba1',
  name: 'RLTestNsg-1',
  vxlanTunnelProfileId: 'test123',
  venueId: 'mock_venue_1',
  personaGroupId: '',
  edgeClusterInfo: {
    edgeClusterId: '0000000001',
    segments: 10,
    dhcpInfoId: '1',
    dhcpPoolId: '1'
  },
  tunneledWlans: [
    { networkId: '1' },
    { networkId: '2' }
  ],
  distributionSwitchInfos: [
    {
      id: 'c8:03:f5:3a:95:c6',
      loopbackInterfaceId: '12',
      loopbackInterfaceIp: '1.2.3.4',
      loopbackInterfaceSubnetMask: '255.255.255.0',
      vlans: '23',
      siteKeepAlive: '5',
      siteRetry: '3'
    }
  ],
  accessSwitchInfos: [
    {
      id: 'c0:c5:20:aa:35:fd',
      templateId: '723250a97f3a4c3780e70c83c5b095ba',
      webAuthPageType: 'TEMPLATE',
      vlanId: '111',
      webAuthPasswordLabel: 'password-Ken-0209',
      webAuthCustomTitle: 'title-Ken-0209',
      webAuthCustomTop: 'top-Ken-0209',
      webAuthCustomLoginButton: 'login-Ken-0209',
      webAuthCustomBottom: 'bottom-Ken-0209'
    }
  ]
}

export const mockWebAuthList = [{
  id: '723250a97f3a4c3780e70c83c5b095ba',
  name: 'Template-Ken-0209',
  webAuthPasswordLabel: 'password-Ken-0209',
  webAuthCustomTitle: 'title-Ken-0209',
  webAuthCustomTop: 'top-Ken-0209',
  webAuthCustomLoginButton: 'login-Ken-0209',
  webAuthCustomBottom: 'bottom-Ken-0209'
}]

export const mockPropertyConfigs = {
  personaGroupId: 'testPersonaId'
}

export const mockPersonaGroup: PersonaGroup = {
  id: 'testPersonaId',
  name: 'TestPersona',
  identityCount: 2,
  dpskPoolId: 'testDpskId',
  identities: [
    {
      id: 'c677cbb0-8520-421c-99b6-59b3cef5ebc1',
      groupId: 'e5247c1c-630a-46f1-a715-1974e49ec867',
      name: 'mock-persona1',
      revoked: false
    },
    {
      id: '1e7f81ab-9bb7-4db7-ae20-315743f83183',
      groupId: 'e5247c1c-630a-46f1-a715-1974e49ec867',
      name: 'mock-persona2',
      revoked: false
    }
  ]
}

export const mockDpsk = {
  id: 'testDpskId',
  name: 'TestDpsk',
  networkIds: ['1', '2'],
  passphraseLength: 0,
  passphraseFormat: PassphraseFormatEnum.NUMBERS_ONLY,
  expirationType: null
}

export const mockDpskForPinMutullyExclusive = {
  id: 'testDpskId',
  name: 'TestDpsk',
  networkIds: ['network1', 'network2', 'network3', 'network4', 'network5', 'network6'],
  passphraseLength: 0,
  passphraseFormat: PassphraseFormatEnum.NUMBERS_ONLY,
  expirationType: null
}

export const mockPinSwitchInfoData: {
  distributionSwitches: DistributionSwitch[],
  accessSwitches: AccessSwitch[]
} = {
  distributionSwitches: [{
    id: 'c8:03:f5:3a:95:c6',
    siteIp: '10.206.78.150',
    vlans: '23',
    siteKeepAlive: '5',
    siteRetry: '3',
    loopbackInterfaceId: '12',
    loopbackInterfaceIp: '1.2.3.4',
    loopbackInterfaceSubnetMask: '255.255.255.0',
    forwardingProfile: '2',
    siteConnection: 'Disconnected',
    siteActive: '10.206.78.150',
    dispatchMessage: '[SUCCESS]',
    model: 'ICX7550-48P',
    name: 'FMN4221R00H---DS---3',
    familyId: 'ICX7550',
    firmwareVersion: 'GZR09010f_b40.bin'
  }],
  accessSwitches: [{
    id: 'c0:c5:20:aa:35:fd',
    vlanId: 111,
    webAuthPageType: 'TEMPLATE',
    templateId: '723250a97f3a4c3780e70c83c5b095ba',
    webAuthPasswordLabel: 'password-Ken-0209',
    webAuthCustomTitle: 'title-Ken-0209',
    webAuthCustomTop: 'top-Ken-0209',
    webAuthCustomLoginButton: 'login-Ken-0209',
    webAuthCustomBottom: 'bottom-Ken-0209',
    uplinkInfo: {
      uplinkType: 'PORT',
      uplinkId: '1/1/1'
    },
    distributionSwitchId: 'c8:03:f5:3a:95:c6',
    dispatchMessage: '[SUCCESS]',
    model: 'ICX7150-C12P',
    name: 'FEK3224R09N---AS---3',
    familyId: 'ICX7150',
    firmwareVersion: 'SPR09010f_b32.bin'
  }]
}

export const mockNetworkSaveData = {
  fields: ['venueId', 'networkId'],
  totalCount: 1,
  page: 1,
  data: [
    { networkId: '1', venueId: 'testVenueId1' }
  ]
}

export const mockDeepNetworkList = {
  requestId: '639283c7-7a5e-4ab3-8fdb-6289fe0ed255',
  response: [
    // { name: 'Network 1', id: '1', type: 'dpsk', dpskServiceProfileId: 'testDpskId' }
    { name: 'Network 1', id: '1', nwSubType: 'dpsk' }
  ]
}

export const mockDPSKNetworkList = {
  requestId: '639283c7-7a5e-4ab3-8fdb-6289fe0ed255',
  response: [
    { name: 'Network 1', id: 'network1', nwSubType: 'dpsk' },
    { name: 'Network 2', id: 'network2', nwSubType: 'dpsk' },
    { name: 'Network 3', id: 'network3', nwSubType: 'dpsk' },
    { name: 'Network 4', id: 'network4', nwSubType: 'dpsk' },
    { name: 'Network 5', id: 'network5', nwSubType: 'dpsk' },
    { name: 'Network 6', id: 'network6', nwSubType: 'dpsk' }
  ]
}

export const mockNetworkGroup = {
  requestId: '1234',
  response: [
    { networkId: '1' },
    { networkId: '2' },
    { networkId: '3' }
  ]
}
