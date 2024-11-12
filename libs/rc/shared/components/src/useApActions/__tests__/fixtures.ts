import { DHCPConfigTypeEnum, DHCPOption, DHCPPool, DHCPSaveData, DHCPUsage } from '@acx-ui/rc/utils'

export const apList = {
  totalCount: 1,
  page: 1,
  data: [
    {
      serialNumber: '000000000001',
      name: 'mock-ap-1',
      model: 'R510',
      fwVersion: '6.2.0.103.261', // invalid Ap Fw version for reset
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
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: '4fe4e02d7ef440c4affd28c620f93073',
      tags: '',
      deviceGroupName: ''
    }
  ]
}

export const dhcpList = {
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'dhcp-1',
      venueIds: ['01d74a2c947346a1a963a310ee8c9f6f']
    }
  ]
}

export const dhcpApSetting = {
  dhcpApRole: 'PrimaryServer',
  serialNumber: '000000000001'
}

export const dhcpResponse: DHCPSaveData = {
  venueIds: [] as string[],
  usage: [] as DHCPUsage[],
  id: 'dhcp-1',
  serviceName: 'DhcpConfigServiceProfile1',
  dhcpMode: DHCPConfigTypeEnum.MULTIPLE as DHCPConfigTypeEnum,
  dhcpPools: [{
    name: 'DhcpServiceProfile#1',
    vlanId: 1001,
    subnetAddress: '192.168.1.0',
    subnetMask: '255.255.255.0',
    startIpAddress: '192.168.1.1',
    endIpAddress: '192.168.1.254',
    leaseTimeHours: 0,
    leaseTimeMinutes: 30,
    id: '14eb1818309c434da928410fa2298ea5',
    description: 'description1',
    primaryDnsIp: '',
    secondaryDnsIp: '',
    dhcpOptions: [] as DHCPOption[]
  }, {
    name: 'DhcpServiceProfile#2',
    vlanId: 1002,
    subnetAddress: '192.168.1.0',
    subnetMask: '255.255.255.0',
    startIpAddress: '192.168.1.1',
    endIpAddress: '192.168.1.254',
    leaseTimeHours: 0,
    leaseTimeMinutes: 60,
    leaseTime: 85,
    id: '_NEW_14eb1818309c434da928410fa2298ea5',
    description: 'description1',
    primaryDnsIp: '',
    secondaryDnsIp: '',
    dhcpOptions: [] as DHCPOption[]
  }] as DHCPPool[]
}

export const dummySwitchClientList = {
  fields: [
    'clientMac',
    'switchId',
    'switchName',
    'switchSerialNumber',
    'switchPort'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      clientMac: '34:20:E3:1C:EA:C0',
      switchId: 'c0:c5:20:b2:10:d5',
      switchName: 'L2-R',
      switchPort: '1/1/4',
      switchSerialNumber: 'FMF3250Q06J'
    }
  ]
}