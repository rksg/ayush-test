import { Alarm, ApVenueStatusEnum, EdgeDnsServers, EdgePasswordDetail, EdgePortStatus, EdgePortTypeEnum, EdgeStatus, EdgeStatusEnum } from '@acx-ui/rc/utils'

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
  cpuCores: 2,
  cpuUsedPercentage: 92,
  memoryUsedKb: 120 * Math.pow(1024, 1),
  memoryTotalKb: 50 * Math.pow(1024, 1),
  diskUsedKb: 250 * Math.pow(1024, 2),
  diskTotalKb: 162 * Math.pow(1024, 2),
  memoryUsed: 120 * Math.pow(1024, 2),
  memoryTotal: 50 * Math.pow(1024, 2),
  diskUsed: 250 * Math.pow(1024, 3),
  diskTotal: 162 * Math.pow(1024, 3)
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

export const overviewData = {
  summary: {
    alarms: {
      summary: {
        critical: 1,
        major: 1
      },
      totalCount: 2
    }
  }
}

export const alarmList = {
  data: [
    {
      severity: 'Critical',
      serialNumber: '968187CFD8005011EE95B1000C290112B0',
      entityType: 'EDGE',
      startTime: 1685606265000,
      entityId: '968187CFD8005011EE95B1000C290112B0',
      id: '968187CFD8005011EE95B1000C290112B0_edge_status',
      message:
      '{"message_template": "SmartEdge @@serialNumber: CPU usage has reached 90.00% of the total."}'
    },
    {
      severity: 'Major',
      serialNumber: '968187CFD8005011EE95B1000C290112B0',
      entityType: 'EDGE',
      startTime: 1685606266000,
      entityId: '968187CFD8005011EE95B1000C290112B0',
      id: '968187CFD8005011EE95B1000C290112B0_edge_status',
      message:
      '{"message_template": "SmartEdge @@serialNumber firmware update failed."}'
    }
  ] as Alarm[]
}

export const alarmListMeta = {
  data: [
    {
      switchName: 'Some_Switch',
      id: 'FEK3230S0A2_switch_status',
      isSwitchExists: true
    },
    {
      apName: 'Some_AP',
      id: 'FEK3224R08J_ap_status'
    }
  ],
  fields: [
    'venueName',
    'apName',
    'switchName'
  ]
}
export const passwordDetail:EdgePasswordDetail = {
  loginPassword: 'admin!234',
  enablePassword: 'admin!234'
}