import { ApVenueStatusEnum, EdgeDnsServers, EdgePortStatus, EdgePortTypeEnum, EdgeStatus, EdgeStatusEnum } from '@acx-ui/rc/utils'

export const tenantID = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
export const currentEdge:EdgeStatus = {
  name: 'edge-01',
  serialNumber: 'edge-111000001',
  venueId: '97b77f8a82324a1faa0f4cc3f56d1ef0',
  venueName: 'testVenue_Edge',
  model: 'test',
  type: 'test',
  deviceStatus: EdgeStatusEnum.OPERATIONAL,
  deviceStatusSeverity: ApVenueStatusEnum.OPERATIONAL,
  ip: '1.1.1.1',
  ports: '62,66',
  tags: [],
  firmwareVersion: '1.1.1.1',
  cpuTotal: 65 * Math.pow(1000, 2),
  cpuUsed: 5 * Math.pow(1000, 2),
  memTotal: 120 * Math.pow(1024, 2),
  memUsed: 50 * Math.pow(1024, 2),
  diskTotal: 250 * Math.pow(1024, 3),
  diskUsed: 162 * Math.pow(1024, 3)
}

export const edgePortsSetting:EdgePortStatus[] = [{
  portId: '1',
  name: 'Port 1',
  status: 'Up',
  adminStatus: 'Enabled',
  type: EdgePortTypeEnum.WAN,
  mac: 'AA:BB:CC:DD:EE:FF',
  speedKbps: 12* Math.pow(12, 6),
  duplex: 'Full',
  ip: '1.1.1.1',
  sortIdx: 1
},
{
  portId: '2',
  name: 'Port 2',
  status: 'Down',
  adminStatus: 'Disabled',
  type: EdgePortTypeEnum.LAN,
  mac: 'AA:BB:CC:DD:EE:FF',
  speedKbps: 10* Math.pow(12, 6),
  duplex: 'Half',
  ip: '1.1.1.2',
  sortIdx: 2
}]

export const edgeDnsServers: EdgeDnsServers = {
  primary: '1.1.1.1',
  secondary: '2.2.2.2'
}