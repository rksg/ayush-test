import { WifiNetwork } from '../../../../types/network'

export const mockedRbacWifiNetworkList = [
  {
    name: 'dsaeNetwork',
    id: '942f4ae83e824a3c8fc3adea2b3adb5b',
    vlan: 1,
    nwSubType: 'dpsk',
    ssid: 'dsaeNetwork',
    dsaeOnboardNetwork: {
      id: 'e35ae8230a354fa1bbdd5e867e365a8f',
      name: 'dsaeNetwork-dpsk3-wpa2',
      // eslint-disable-next-line max-len
      description: 'It is a DPSK3 onboard network and not configurable, you can edit DPSK3 config through service network',
      nwSubType: 'dpsk',
      vlan: 1,
      vlanPool: null,
      securityProtocol: 'WPA2Personal'
    },
    venueApGroups: [
      {
        venueId: '4b5cf1db21104944981948e503746676',
        apGroupIds: [
          'f3a8adf5e8be46758e43d7b505e27580',
          '43840d236f05419d87598cc3e016f3c4'
        ],
        isAllApGroups: false
      },
      {
        venueId: '5d9ebebe34324b9fa5954d7b31cde5e3',
        apGroupIds: [
          'd03b3f17c1ac48cfb4e8c69f5e5e1eeb',
          '5345c661f250469e8897558401b52f00',
          '5345c661f250469e8897558401b52f00'
        ],
        isAllApGroups: true
      },
      {
        venueId: 'b398c681738d439ba7d795b04b5600b6',
        apGroupIds: [
          '7d810416a78049dbb03f322dce62e9bf',
          'b5fdc19863fa499d837a87ba4e9e85da'
        ],
        isAllApGroups: true
      }
    ],
    apSerialNumbers: [
      '999222888882',
      '888822221111',
      '220033335555',
      '231231231112'
    ]
  },
  {
    name: 'openNetwork',
    id: '4699c3895fb54aadba3f85d1fac61513',
    vlan: 1,
    nwSubType: 'open',
    ssid: 'openNetwork',
    isOweMaster: true,
    owePairNetworkId: '22783306a02d41e2ba481e9c496e1500',
    venueApGroups: [
      {
        venueId: '4b5cf1db21104944981948e503746676',
        apGroupIds: [
          'f3a8adf5e8be46758e43d7b505e27580',
          '339d44c3cb6a45cba912a63f01ae73b7',
          '339d44c3cb6a45cba912a63f01ae73b7',
          '339d44c3cb6a45cba912a63f01ae73b7',
          '43840d236f05419d87598cc3e016f3c4',
          '0118133c4727456ea10e05cd0217c110'
        ],
        isAllApGroups: true
      },
      {
        venueId: 'b398c681738d439ba7d795b04b5600b6',
        apGroupIds: [
          'b5fdc19863fa499d837a87ba4e9e85da',
          '7d810416a78049dbb03f322dce62e9bf'
        ],
        isAllApGroups: true
      }
    ],
    apSerialNumbers: [
      '111122233333',
      '777771111222',
      '999222666666',
      '999222888882',
      '111115555222',
      '231231231112'
    ]
  },
  {
    name: 'openNetwork-owe-tr',
    id: '22783306a02d41e2ba481e9c496e1500',
    vlan: 1,
    nwSubType: 'open',
    ssid: 'openNetwork-owe-tr',
    // eslint-disable-next-line max-len
    description: 'It is an OWE Transition hidden network and not configurable, you can edit OWE Transition visible network config through service network with name: openNetwork',
    isOweMaster: false,
    owePairNetworkId: '4699c3895fb54aadba3f85d1fac61513',
    venueApGroups: [
      {
        venueId: '4b5cf1db21104944981948e503746676',
        apGroupIds: [
          'f3a8adf5e8be46758e43d7b505e27580',
          '339d44c3cb6a45cba912a63f01ae73b7',
          '339d44c3cb6a45cba912a63f01ae73b7',
          '339d44c3cb6a45cba912a63f01ae73b7',
          '43840d236f05419d87598cc3e016f3c4',
          '0118133c4727456ea10e05cd0217c110'
        ],
        isAllApGroups: true
      },
      {
        venueId: 'b398c681738d439ba7d795b04b5600b6',
        apGroupIds: [
          'b5fdc19863fa499d837a87ba4e9e85da',
          '7d810416a78049dbb03f322dce62e9bf'
        ],
        isAllApGroups: true
      }
    ],
    apSerialNumbers: [
      '111122233333',
      '777771111222',
      '999222666666',
      '999222888882',
      '111115555222',
      '231231231112'
    ]
  },
  {
    name: 'test_psk',
    id: 'e3d1588049774c79ac13b87afd9b4b24',
    vlan: 1,
    nwSubType: 'psk',
    ssid: 'test_psk',
    venueApGroups: [
      {
        venueId: '4b5cf1db21104944981948e503746676',
        apGroupIds: [
          '0118133c4727456ea10e05cd0217c110',
          '43840d236f05419d87598cc3e016f3c4',
          'f3a8adf5e8be46758e43d7b505e27580'
        ],
        isAllApGroups: false
      },
      {
        venueId: '5d9ebebe34324b9fa5954d7b31cde5e3',
        apGroupIds: [
          '5345c661f250469e8897558401b52f00',
          'd03b3f17c1ac48cfb4e8c69f5e5e1eeb',
          '5345c661f250469e8897558401b52f00'
        ],
        isAllApGroups: true
      },
      {
        venueId: 'b398c681738d439ba7d795b04b5600b6',
        apGroupIds: [
          '7d810416a78049dbb03f322dce62e9bf',
          'b5fdc19863fa499d837a87ba4e9e85da'
        ],
        isAllApGroups: true
      }
    ],
    apSerialNumbers: [
      '111115555222',
      '999222888882',
      '888822221111',
      '220033335555',
      '231231231112'
    ]
  },
  {
    name: 'testing - copy',
    id: 'e0953a7d8610455295cce846079bb25e',
    vlan: 1,
    nwSubType: 'dpsk',
    ssid: 'testing - copy',
    venueApGroups: [
      {
        venueId: '4b5cf1db21104944981948e503746676',
        apGroupIds: [
          '339d44c3cb6a45cba912a63f01ae73b7',
          '339d44c3cb6a45cba912a63f01ae73b7',
          '339d44c3cb6a45cba912a63f01ae73b7'
        ],
        isAllApGroups: false
      },
      {
        venueId: 'b398c681738d439ba7d795b04b5600b6',
        apGroupIds: [
          '7d810416a78049dbb03f322dce62e9bf',
          'b5fdc19863fa499d837a87ba4e9e85da'
        ],
        isAllApGroups: true
      }
    ],
    apSerialNumbers: [
      '111122233333',
      '777771111222',
      '999222666666',
      '231231231112'
    ]
  }
] as WifiNetwork[]