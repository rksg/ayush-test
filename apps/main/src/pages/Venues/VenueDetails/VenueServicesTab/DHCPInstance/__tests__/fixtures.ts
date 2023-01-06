
import { rest,RestHandler } from 'msw'

import { CommonUrlsInfo, DHCPUrls } from '@acx-ui/rc/utils'

const aps ={
  fields: ['serialNumber', 'venueId', 'name'],
  totalCount: 1,
  page: 1,
  data: [
    { serialNumber: '922102020872',
      name: '922102020872',
      venueId: '07c99ef9e17a401d981043e0ea378c2a'
    }]
}

const serviceProfile = {
  serviceProfileId: 'c51d9d180de24d6cb3a75ace5ce63c2a',
  enabled: true,
  wanPortSelectionMode: 'Dynamic',
  dhcpServiceAps: [
    { serialNumber: '922102020872', role: 'PrimaryServer' },
    { serialNumber: '922102020872', role: 'BackupServer' }
  ]
}


const serviceById = {
  dhcpPools: [
    {
      startIpAddress: '192.168.3.1',
      endIpAddress: '192.168.3.14',
      name: 'fff2',
      vlanId: 301,
      subnetAddress: '192.168.3.0',
      subnetMask: '255.255.255.240',
      primaryDnsIp: '11.22.33.44',
      secondaryDnsIp: '55.66.77.88',
      leaseTimeHours: 0,
      leaseTimeMinutes: 12,
      id: 'a0c9b2f2470c40fcbc3a7265d4c2853c'
    },
    {
      startIpAddress: '192.168.2.1',
      endIpAddress: '192.168.2.30',
      name: 'fff',
      vlanId: 300,
      subnetAddress: '192.168.2.0',
      subnetMask: '255.255.255.224',
      leaseTimeHours: 24,
      leaseTimeMinutes: 0,
      id: '419d45be6bde40f5bf5067885405178f'
    }],
  dhcpMode: 'EnableOnMultipleAPs',
  usage: [{
    venueId: '07c99ef9e17a401d981043e0ea378c2a',
    totalIpCount: 24,
    usedIpCount: 0
  }],
  serviceName: 'abcd',
  id: 'c51d9d180de24d6cb3a75ace5ce63c2a'
}


const dhcpProfileList = [{
  dhcpMode: 'EnableOnMultipleAPs',
  serviceName: 'abcd',
  id: 'c51d9d180de24d6cb3a75ace5ce63c2a',
  venueIds: ['07c99ef9e17a401d981043e0ea378c2a'],
  dhcpPools: [
    {
      startIpAddress: '192.168.3.1',
      endIpAddress: '192.168.3.14',
      name: 'fff2',
      vlanId: 301,
      subnetAddress: '192.168.3.0',
      subnetMask: '255.255.255.240',
      primaryDnsIp: '11.22.33.44',
      secondaryDnsIp: '55.66.77.88',
      leaseTimeHours: 0,
      leaseTimeMinutes: 12,
      id: 'a0c9b2f2470c40fcbc3a7265d4c2853c'
    },
    {
      startIpAddress: '192.168.2.1',
      endIpAddress: '192.168.2.30',
      name: 'fff',
      vlanId: 300,
      subnetAddress: '192.168.2.0',
      subnetMask: '255.255.255.224',
      leaseTimeHours: 24,
      leaseTimeMinutes: 0,
      id: '419d45be6bde40f5bf5067885405178f'
    }]
},
{
  venueIds: ['7daee06492c44b7b8d256176e83a7457'],
  dhcpPools: [{
    startIpAddress: '10.20.30.1',
    endIpAddress: '10.20.30.10',
    name: 'test',
    vlanId: 300,
    subnetAddress: '10.20.30.0',
    subnetMask: '255.255.255.0',
    leaseTimeHours: 24,
    leaseTimeMinutes: 0,
    id: 'b06d033de446458b920cc096d6cf7e5b'
  }],
  dhcpMode: 'EnableOnEachAPs',
  serviceName: 'test12',
  id: '7b8a2a4061754a2a8a56040318180c52'
},
{
  dhcpPools: [{
    startIpAddress: '172.21.232.2',
    endIpAddress: '172.21.235.233',
    name: 'DHCP-Guest',
    vlanId: 3000,
    subnetAddress: '172.21.232.0',
    subnetMask: '255.255.252.0',
    leaseTimeHours: 12,
    leaseTimeMinutes: 0,
    id: '107c53251dca420782b1c2f561403da1' }],
  dhcpMode: 'EnableOnEachAPs',
  serviceName: 'DHCP-Guestfdfff',
  id: '4e9be35be88543b4aafc45e9403f79e5'
},
{
  dhcpPools: [{
    startIpAddress: '172.21.232.2',
    endIpAddress: '172.21.235.233',
    name: 'DHCP-Guest',
    vlanId: 3000,
    subnetAddress: '172.21.232.0',
    subnetMask: '255.255.252.0',
    leaseTimeHours: 12,
    leaseTimeMinutes: 0,
    id: '30d42f883c724abebc66df2527a65d94'
  }],
  dhcpMode: 'EnableOnEachAPs',
  serviceName: 'DHCP-Guest',
  id: '8e61ebeae97441c3911de3c381ae3551'
},
{
  dhcpPools: [{
    startIpAddress: '192.168.2.1',
    endIpAddress: '192.168.2.30',
    name: 'hier',
    vlanId: 1,
    subnetAddress: '192.168.2.0',
    subnetMask: '255.255.255.224',
    leaseTimeHours: 24,
    leaseTimeMinutes: 0,
    id: 'ccbe6cdc90b444088b6ef0d13495fca3'
  },
  {
    startIpAddress: '192.168.0.1',
    endIpAddress: '192.168.0.126',
    name: 'hier2',
    vlanId: 3,
    subnetAddress: '192.168.0.0',
    subnetMask: '255.255.255.128',
    leaseTimeHours: 24,
    leaseTimeMinutes: 0,
    id: '95843b9c67d4404786a32a06a15e7576' },
  {
    startIpAddress: '192.168.3.1',
    endIpAddress: '192.168.3.14',
    name: 'hier3',
    vlanId: 301,
    subnetAddress: '192.168.3.0',
    subnetMask: '255.255.255.240',
    primaryDnsIp: '11.22.33.4',
    secondaryDnsIp: '11.22.33.5',
    leaseTimeHours: 24,
    leaseTimeMinutes: 0,
    id: 'b50fcce633e241c1994efd34c56c1300'
  },
  {
    startIpAddress: '192.168.1.1',
    endIpAddress: '192.168.1.62',
    name: 'hier4',
    vlanId: 300,
    subnetAddress: '192.168.1.0',
    subnetMask: '255.255.255.192',
    leaseTimeHours: 24,
    leaseTimeMinutes: 0,
    id: '59b05d9e83c642cd89b79249101da967'
  }],
  dhcpMode: 'EnableOnHierarchicalAPs',
  serviceName: 'hierarchical',
  id: '8a064a8a7dfb49ffb7b51d1d4822dc6f'
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
