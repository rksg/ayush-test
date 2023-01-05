
import { rest,RestHandler } from 'msw'

import { CommonUrlsInfo, DHCPUrls } from '@acx-ui/rc/utils'

const aps ={
  fields: [
    'clients',
    'serialNumber',
    'IP',
    'apMac',
    'check-all',
    'apStatusData.APRadio.channel',
    'deviceStatus',
    'tags',
    'meshRole',
    'venueName',
    'apStatusData.APRadio.band',
    'apStatusData.APRadio.radioId',
    'switchName',
    'deviceGroupId',
    'venueId',
    'name',
    'deviceGroupName',
    'model',
    'fwVersion',
    'cog'
  ],
  totalCount: 516,
  page: 1,
  data: [
    {
      serialNumber: '200002007012',
      name: '200002007012_ap',
      model: 'R710',
      fwVersion: '6.2.0.103.416',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      venueName: 'Sonali',
      deviceStatus: '3_04_DisconnectedFromCloud',
      IP: '10.174.78.105',
      apMac: '00:0C:29:1E:9F:E4',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 12,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 124,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: 'f5bed05a9c744a5fbbf419ab83ed80fa',
      tags: '',
      deviceGroupName: ''
    },
    {
      serialNumber: '200005986474',
      name: '200005986474',
      model: 'R710',
      fwVersion: '6.2.0.103.367',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      venueName: 'Sonali',
      deviceStatus: '3_04_DisconnectedFromCloud',
      IP: '10.174.78.75',
      apMac: '00:0C:29:5B:58:AA',
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
            channel: 124,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: 'f5bed05a9c744a5fbbf419ab83ed80fa',
      tags: '',
      deviceGroupName: ''
    },
    {
      serialNumber: '200012192288',
      name: '200012192288',
      venueId: '3c2f0b7d57cc4f0581eebd7352680f11',
      venueName: 'My-Venue',
      deviceStatus: '1_01_NeverContactedCloud',
      deviceGroupId: 'd72777c891cf4837aae587bae296c542',
      tags: '',
      deviceGroupName: ''
    },
    {
      serialNumber: '150000000400',
      name: 'Keda-00001',
      model: 'R710',
      fwVersion: '6.2.0.103.496',
      venueId: '3b11bcaffd6f4f4f9b2805b6fe24bf8b',
      venueName: 'bdcPerformanceVenue',
      deviceStatus: '2_00_Operational',
      IP: '11.11.11.111',
      apMac: '00:01:88:01:34:58',
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
            channel: 64,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: '200448ab2cfc428aa96e7367f9893d6c',
      clients: 5,
      tags: ''
    },
    {
      serialNumber: '150000000401',
      name: 'Keda-00002',
      model: 'R710',
      fwVersion: '6.2.0.103.496',
      venueId: '3b11bcaffd6f4f4f9b2805b6fe24bf8b',
      venueName: 'bdcPerformanceVenue',
      deviceStatus: '2_00_Operational',
      IP: '11.11.11.112',
      apMac: '00:01:88:01:34:DE',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 11,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 48,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: '200448ab2cfc428aa96e7367f9893d6c',
      tags: ''
    },
    {
      serialNumber: '150000000402',
      name: 'Keda-00003',
      model: 'R710',
      fwVersion: '6.2.0.103.496',
      venueId: '3b11bcaffd6f4f4f9b2805b6fe24bf8b',
      venueName: 'bdcPerformanceVenue',
      deviceStatus: '2_00_Operational',
      IP: '11.11.11.113',
      apMac: '00:01:88:01:35:64',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 11,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 124,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: '200448ab2cfc428aa96e7367f9893d6c',
      tags: ''
    },
    {
      serialNumber: '150000000403',
      name: 'Keda-00004',
      model: 'R710',
      fwVersion: '6.2.0.103.496',
      venueId: '3b11bcaffd6f4f4f9b2805b6fe24bf8b',
      venueName: 'bdcPerformanceVenue',
      deviceStatus: '2_00_Operational',
      IP: '11.11.11.114',
      apMac: '00:01:88:01:35:EA',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 11,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 48,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: '200448ab2cfc428aa96e7367f9893d6c',
      clients: 6,
      tags: ''
    },
    {
      serialNumber: '150000000404',
      name: 'Keda-00005',
      model: 'R710',
      fwVersion: '6.2.0.103.496',
      venueId: '3b11bcaffd6f4f4f9b2805b6fe24bf8b',
      venueName: 'bdcPerformanceVenue',
      deviceStatus: '2_00_Operational',
      IP: '11.11.11.114',
      apMac: '00:01:88:01:35:EA',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 11,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 48,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: '200448ab2cfc428aa96e7367f9893d6c',
      clients: 6,
      tags: ''
    }
  ]
}
const serviceProfile = {
  serviceProfileId: 'serviceProfileId1',
  enabled: true,
  wanPortSelectionMode: 'Dynamic',
  dhcpServiceAps: [
    { serialNumber: '150000000400', role: 'PrimaryServer' },
    { serialNumber: '150000000401', role: 'BackupServer' },
    { serialNumber: '150000000402', role: 'NatGateway' },
    { serialNumber: '150000000403', role: 'NatGateway' },
    { serialNumber: '150000000404', role: 'NatGateway' },
    { serialNumber: '150000000406', role: 'NatGateway' }
  ]
}


const serviceById = {
  venueIds: [
    'e16f5cb9aded49f6acd5891eb8897890',
    '57db532207814948aa61b156e1cf2b9e',
    '2725fdb455ec4785b1a633039b70b1aa'
  ],
  dhcpMode: 'EnableOnMultipleAPs',
  dhcpPools: [
    {
      name: 'DhcpServiceProfile#1',
      vlanId: 1001,
      subnetAddress: '192.168.1.0',
      subnetMask: '255.255.255.0',
      startIpAddress: '192.168.1.1',
      endIpAddress: '192.168.1.254',
      leaseTimeHours: 0,
      leaseTimeMinutes: 30,
      id: '14eb1818309c434da928410fa2298ea5',
      description: 'description1'
    }
  ],
  serviceName: 'DhcpConfigServiceProfile1',
  id: '78f92fbf80334e8b83cddd3210db4920'
}

const dhcpProfileList = [{
  id: '78f92fbf80334e8b83cddd3210db4920',
  serviceName: 'DhcpConfigServiceProfile1',
  dhcpMode: 'EnableOnEachAPs',
  dhcpPoolIds: ['poolId1', 'poolId2'],
  venueIds: ['venueId1', 'venueId2']
},
{
  id: '78f92fbf80334e8b83cddd3210db4921',
  serviceName: 'service 2',
  dhcpMode: 'EnableOnEachAPs',
  dhcpPoolIds: ['poolId', 'poolId2'],
  venueIds: ['venueId1', 'venueId2']
}]
const leaseList = [{
  hostName: 'alamb1',
  ipAddress: '66.80.84.216',
  dhcpPoolId: 'poolId1',
  dhcpPoolName: 'DHCP-3',
  macAddress: '90:83:93:a1:78:48',
  status: 'Online',
  leaseExpiration: '10:23:00'
},{
  hostName: 'alamb2',
  ipAddress: '66.80.84.216',
  dhcpPoolId: 'poolId1',
  dhcpPoolName: 'DHCP-4',
  macAddress: '90:83:93:a1:78:50',
  status: 'Offline',
  leaseExpiration: '10:23:00'
}]

const pools = [
  {
    name: 'DhcpPool#1',
    vlanId: 1001,
    subnetAddress: '192.168.1.0',
    subnetMask: '255.255.255.0',
    startIpAddress: '192.168.1.1',
    endIpAddress: '192.168.1.254',
    primaryDnsIp: '168.195.1.1',
    secondaryDnsIp: '8.8.8.8',
    leaseTimeHours: 0,
    leaseTimeMinutes: 30,
    totalIpCount: 10,
    usedIpCount: 3,
    active: true,
    id: '407f330356924da2a4255212c1f6d54a'
  },
  {
    name: 'DhcpPool#2',
    vlanId: 1002,
    subnetAddress: '192.168.2.0',
    subnetMask: '255.255.255.0',
    startIpAddress: '192.168.2.1',
    endIpAddress: '192.168.2.254',
    leaseTimeHours: 0,
    leaseTimeMinutes: 30,
    active: true,
    id: '214864919d2c492c8ef745754daf45b8'
  },
  {
    name: 'DhcpPool#3',
    vlanId: 1003,
    subnetAddress: '192.168.3.0',
    subnetMask: '255.255.255.0',
    startIpAddress: '192.168.3.1',
    endIpAddress: '192.168.3.254',
    leaseTimeHours: 0,
    leaseTimeMinutes: 30,
    active: true,
    id: 'bdd840d08fcc426dba174e2224d1eaad'
  }
]


export const successResponse = { requestId: 'request-id' }

const handlers:Array<RestHandler> = [
  rest.post(CommonUrlsInfo.getApsList.url,(_,res,ctx) =>
    res(ctx.json(aps))
  ),
  rest.get(DHCPUrls.getVenueDHCPServiceProfile.url,(_,res,ctx) =>
    res(ctx.json(serviceProfile))
  ),
  rest.get(DHCPUrls.getDHCProfileDetail.url,(_,res,ctx) =>
    res(ctx.json(serviceById))
  ),
  rest.get(DHCPUrls.getDHCPProfiles.url,(_,res,ctx) =>
    res(ctx.json(dhcpProfileList))
  ),
  rest.get(DHCPUrls.getVenueLeases.url,(_,res,ctx) =>
    res(ctx.json(leaseList))
  ),
  rest.get(DHCPUrls.getVenueActivePools.url,(_,res,ctx) =>
    res(ctx.json(pools))
  ),
  rest.post(DHCPUrls.activeVenueDHCPPool.url,(_,res,ctx) =>
    res(ctx.json(successResponse))
  ),
  rest.delete(DHCPUrls.deactivateVenueDHCPPool.url,(_,res,ctx) =>
    res(ctx.json(successResponse))
  ),
  rest.post(DHCPUrls.updateVenueDHCPProfile.url,(_,res,ctx) =>
    res(ctx.json(successResponse))
  )]

export default handlers
