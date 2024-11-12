import { AFCPowerMode, AFCStatus } from '@acx-ui/rc/utils'

export const apList = {
  totalCount: 5,
  page: 1,
  data: [
    {
      serialNumber: '000000000001',
      name: 'mock-ap-1',
      model: 'R510',
      fwVersion: '6.2.0.103.486', // valid Ap Fw version for reset
      venueId: '01d74a2c947346a1a963a310ee8c9f6f',
      venueName: 'Mock-Venue',
      deviceStatus: '2_00_Operational',
      IP: '10.00.000.101',
      apMac: '00:00:00:00:00:01',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 10,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 120,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ],
        APSystem: {
          managementVlan: 1
        },
        lanPortStatus: [
          {
            phyLink: 'Down ',
            port: '0'
          },
          {
            phyLink: 'Up 1000Mbps full',
            port: '1'
          }
        ],
        afcInfo: {
          powerMode: AFCPowerMode.LOW_POWER,
          afcStatus: AFCStatus.WAIT_FOR_LOCATION
        }
      },
      meshRole: 'DISABLED',
      deviceGroupId: '4fe4e02d7ef440c4affd28c620f93073',
      tags: '',
      deviceGroupName: '',
      poePort: '1'
    }, {
      serialNumber: '000000000002',
      name: 'mock-ap-2',
      model: 'R510',
      fwVersion: '6.2.0.103.261',
      venueId: '01d74a2c947346a1a963a310ee8c9f6f',
      venueName: 'Mock-Venue',
      deviceStatus: '3_04_DisconnectedFromCloud',
      IP: '10.00.000.102',
      apMac: '00:00:00:00:00:02',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 10,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 120,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ],
        APSystem: {
          managementVlan: 1
        }
      },
      meshRole: '',
      deviceGroupId: '4fe4e02d7ef440c4affd28c620f93073',
      tags: '',
      deviceGroupName: ''
    }, {
      serialNumber: '000000000003',
      name: 'mock-ap-3',
      model: 'R510',
      fwVersion: '6.2.0.103.261',
      venueId: '01d74a2c947346a1a963a310ee8c9f6f',
      venueName: 'Mock-Venue',
      deviceStatus: '4_01_Rebooting',
      IP: '10.00.000.103',
      apMac: '00:00:00:00:00:03',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 10,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 120,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ],
        APSystem: {
          managementVlan: 1
        }
      },
      meshRole: 'DISABLED',
      deviceGroupId: '4fe4e02d7ef440c4affd28c620f93073',
      tags: '',
      deviceGroupName: ''
    }, {
      serialNumber: '000000000004',
      name: 'mock-ap-4',
      model: 'R510',
      fwVersion: '6.2.0.103.261',
      venueId: '01d74a2c947346a1a963a310ee8c9f6f',
      venueName: 'Mock-Venue',
      deviceStatus: '1_07_Initializing',
      IP: '10.00.000.104',
      apMac: '00:00:00:00:00:04',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 10,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 120,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ],
        APSystem: {
          managementVlan: 1
        }
      },
      meshRole: 'DISABLED',
      deviceGroupId: '4fe4e02d7ef440c4affd28c620f93073',
      tags: '',
      deviceGroupName: ''
    }, {
      serialNumber: '000000000005',
      name: 'mock-ap-5',
      model: 'R510',
      fwVersion: '6.2.0.103.261',
      venueId: '01d74a2c947346a1a963a310ee8c9f6f',
      venueName: 'Mock-Venue',
      IP: '10.00.000.105',
      deviceStatus: '',
      apMac: '00:00:00:00:00:05',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 10,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 120,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ],
        APSystem: {
          managementVlan: 1
        }
      },
      meshRole: 'EMAP',
      deviceGroupId: '4fe4e02d7ef440c4affd28c620f93073',
      tags: '',
      deviceGroupName: ''
    }
  ]
}

export const apCompatibilities = { apCompatibilities: [
  {
    id: '302002030366',
    incompatibleFeatures: [ {
      featureName: 'EXAMPLE-FEATURE-1',
      requiredFw: '7.0.0.0.123',
      supportedModelFamilies: ['Wi-Fi 6'],
      incompatibleDevices: [{
        firmware: '6.2.3.103.233',
        model: 'R550',
        count: 1
      }
      ]
    }
    ],
    total: 1,
    incompatible: 1
  },{
    id: '000000000002',
    incompatibleFeatures: [ {
      name: 'EXAMPLE-FEATURE-3',
      requiredFw: '6.2.3.103.250',
      incompatibleDevices: [{
        firmware: '6.2.3.103.233',
        model: 'R550',
        count: 1
      }
      ]
    }
    ],
    total: 1,
    incompatible: 1
  },{
    id: '922102004888',
    incompatibleFeatures: [],
    total: 0,
    incompatible: 1
  },{
    id: '000000000004',
    incompatibleFeatures: [],
    total: 0,
    incompatible: 1
  },{
    id: '000000000005',
    incompatibleFeatures: [],
    total: 0,
    incompatible: 1
  }
] }

export const getApGroupsList = {
  data: [{
    clients: 0,
    deviceGroupId: '',
    deviceGroupName: '',
    incidents: 0,
    members: 0
  }]
}

export const networkList = {
  fields: [
    'id',
    'venueApGroups',
    'apCount'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'fd5d6b3a003c4cd0b6b5ab80159b1187',
      apSerialNumbers: [
        '123456789005',
        '302002030366'
      ],
      apCount: 2,
      venueApGroups: [{
        apGroupIds: [
          '_apGroupId_1_',
          '_apGroupId_2_'
        ]
      }]
    }
  ]
}

export const mockVenueOptions = {
  fields: ['name', 'country', 'latitude', 'longitude', 'id'],
  totalCount: 3,
  page: 1,
  data: [
    {
      id: 'mock_venue_1',
      name: 'Mock Venue 1',
      country: 'United States',
      latitude: '37.4112751',
      longitude: '-122.0191908'
    },
    {
      id: 'mock_venue_2',
      name: 'Mock Venue 2',
      country: 'United States',
      latitude: '38.4112751',
      longitude: '-123.0191908'
    },
    {
      id: 'mock_venue_3',
      name: 'Mock Venue 3',
      country: 'United States',
      latitude: '39.4112751',
      longitude: '-124.0191908'
    }
  ]
}
