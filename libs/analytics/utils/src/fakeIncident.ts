import { IncidentInformation }          from './incidentInformation'
import { transformIncidentQueryResult } from './incidents'
import { Incident }                     from './types/incidents'

type RequiredFields = 'id'
  | 'code'
  | 'path'
  | 'startTime'
  | 'endTime'

type FakeIncidentProps = Partial<Omit<Incident, keyof IncidentInformation>>
  & Pick<Incident, RequiredFields>

const defaultValue = {
  apCount: null,
  impactedApCount: null,
  clientCount: null,
  impactedClientCount: null,
  isMuted: false,
  metadata: { dominant: {}, rootCauseChecks: { checks: [], params: {} } },
  mutedAt: null,
  mutedBy: null,
  slaThreshold: null
}

export function fakeIncident (props: FakeIncidentProps): Incident {
  let sliceType = props.sliceType
  let sliceValue = props.sliceValue
  const lastNode = props.path[props.path.length - 1]
  if (!sliceType) { sliceType = lastNode.type }
  if (!sliceValue) { sliceValue = lastNode.name }

  return transformIncidentQueryResult({
    ...defaultValue,
    ...props,
    sliceType,
    sliceValue
  } as Incident)
}

export const fakeIncident1 = fakeIncident({
  id: 'df5339ba-da3b-4110-a291-7f8993a274f3',
  code: 'eap-failure',
  path: [
    { type: 'network', name: 'Network' },
    { type: 'zone', name: 'Edu2-611-Mesh' },
    { type: 'apGroup', name: '255_Edu2-611-group' },
    { type: 'ap', name: '70:CA:97:01:A0:C0' }
  ],
  sliceValue: 'RuckusAP',
  startTime: '2022-07-19T05:15:00.000Z',
  endTime: '2022-07-20T02:42:00.000Z',
  metadata: {
    dominant: {},
    rootCauseChecks: {
      checks: [
        {
          AP_MODEL: false,
          FW_VERSION: true,
          CLIENT_OS_MFG: false,
          CCD_REASON_DISASSOC_STA_HAS_LEFT: true
        }
      ],
      params: {
        FW_VERSION: '6.1.1.0.917'
      }
    }
  },
  apCount: -1,
  vlanCount: -1,
  clientCount: 27,
  impactedClientCount: 5,
  impactedApCount: -1,
  switchCount: -1,
  currentSlaThreshold: null,
  severity: 0.674055825227442,
  connectedPowerDeviceCount: -1,
  mutedAt: null
})

export const fakeIncidentTtc = fakeIncident({
  severity: 0.16109353101861,
  startTime: '2022-08-25T19:48:00.000Z',
  endTime: '2022-08-25T20:03:00.000Z',
  code: 'ttc',
  sliceType: 'zone',
  sliceValue: 'EDU-MeshZone_orig',
  id: 'cf471ed5-c0da-4803-b92b-27ecfb86d3e5',
  path: [
    {
      type: 'zone',
      name: 'EDU-MeshZone_orig'
    }
  ],
  metadata: {
    dominant: {
      ssid: 'EDU-1x'
    },
    rootCauseChecks: {
      checks: [],
      params: {}
    }
  },
  clientCount: 1,
  impactedClientCount: 15,
  isMuted: false,
  mutedBy: null,
  mutedAt: null,
  slaThreshold: 2000,
  currentSlaThreshold: null,
  apCount: -1,
  impactedApCount: -1,
  switchCount: -1,
  vlanCount: -1,
  connectedPowerDeviceCount: -1
})

export const fakeIncidentRss = fakeIncident({
  severity: 0.207855569904612,
  startTime: '2022-09-28T22:30:00.000Z',
  endTime: '2022-09-29T00:00:00.000Z',
  code: 'p-cov-clientrssi-low',
  sliceType: 'apGroup',
  sliceValue: 'Outdoor',
  id: 'af787b68-c677-4601-91a6-5a61af32501f',
  path: [
    {
      type: 'zone',
      name: 'Default Zone'
    },
    {
      type: 'apGroup',
      name: 'Outdoor'
    }
  ],
  metadata: {
    dominant: {
      ssid: 'DENSITY-COMMSCOPE'
    },
    rootCauseChecks: {
      checks: [],
      params: {}
    }
  },
  clientCount: 30,
  impactedClientCount: 20,
  isMuted: false,
  mutedBy: null,
  mutedAt: null,
  slaThreshold: -75,
  currentSlaThreshold: null,
  apCount: -1,
  impactedApCount: -1,
  switchCount: -1,
  vlanCount: -1,
  connectedPowerDeviceCount: -1
})

export const fakeIncidentSwitchMemory = fakeIncident({
  severity: 0.9,
  startTime: '2022-09-28T04:00:00.000Z',
  endTime: '2022-09-28T05:00:10.000Z',
  code: 'p-switch-memory-high',
  sliceType: 'switch',
  sliceValue: 'ICX8200-24 Router',
  id: '7a58f892-880d-42fe-a97c-7455a2ec51f9',
  path: [
    {
      type: 'switchGroup',
      name: 'BDC_ICX'
    },
    {
      type: 'switch',
      name: '38:45:3B:3C:EC:70'
    }
  ],
  metadata: {
    dominant: {},
    rootCauseChecks: {
      checks: [],
      params: {}
    }
  },
  clientCount: -1,
  impactedClientCount: -1,
  isMuted: false,
  mutedBy: null,
  mutedAt: null,
  slaThreshold: null,
  currentSlaThreshold: null,
  apCount: 0,
  impactedApCount: -1,
  switchCount: 0,
  vlanCount: 0,
  connectedPowerDeviceCount: 0
})

export const fakeIncidentContReboot = fakeIncident({
  severity: 0.9,
  startTime: '2022-10-04T09:30:00.000Z',
  endTime: '2022-10-04T10:30:00.000Z',
  code: 'i-apserv-continuous-reboots',
  sliceType: 'zone',
  sliceValue: 'vishnu_11ac',
  id: '6980c155-0a75-4caa-b164-5cbbb11f272f',
  path: [
    {
      type: 'zone',
      name: 'vishnu_11ac'
    }
  ],
  metadata: {
    dominant: {},
    rootCauseChecks: {
      checks: [],
      params: {}
    }
  },
  clientCount: 1,
  impactedClientCount: 1,
  isMuted: false,
  mutedBy: null,
  mutedAt: null,
  slaThreshold: null,
  currentSlaThreshold: null,
  apCount: 1,
  impactedApCount: 1,
  switchCount: -1,
  vlanCount: -1,
  connectedPowerDeviceCount: -1
})

export const fakeIncidentHighReboot = fakeIncident({
  severity: 0.9,
  startTime: '2022-10-04T09:30:00.000Z',
  endTime: '2022-10-04T10:30:00.000Z',
  code: 'i-apserv-high-num-reboots',
  sliceType: 'zone',
  sliceValue: 'vishnu_11ac',
  id: '6980c155-0a75-4caa-b164-5cbbb11f272f',
  path: [
    {
      type: 'zone',
      name: 'vishnu_11ac'
    }
  ],
  metadata: {
    dominant: {},
    rootCauseChecks: {
      checks: [],
      params: {}
    }
  },
  clientCount: 1,
  impactedClientCount: 1,
  isMuted: false,
  mutedBy: null,
  mutedAt: null,
  slaThreshold: null,
  currentSlaThreshold: null,
  apCount: 1,
  impactedApCount: 1,
  switchCount: -1,
  vlanCount: -1,
  connectedPowerDeviceCount: -1
})

export const fakeIncidentDowntimeHigh = fakeIncident({
  severity: 0.990161149526738,
  startTime: '2022-10-04T00:42:00.000Z',
  endTime: '2022-10-05T02:57:00.000Z',
  code: 'i-apserv-downtime-high',
  sliceType: 'zone',
  sliceValue: 'Default Zone',
  id: '0020f1d3-a722-4a21-aac4-ba8a5b5449c5',
  path: [
    {
      type: 'zone',
      name: 'Default Zone'
    }
  ],
  metadata: {
    dominant: {},
    rootCauseChecks: {
      checks: [],
      params: {}
    }
  },
  clientCount: -1,
  impactedClientCount: -1,
  isMuted: false,
  mutedBy: null,
  mutedAt: null,
  slaThreshold: null,
  currentSlaThreshold: null,
  apCount: 7,
  impactedApCount: 6,
  switchCount: -1,
  vlanCount: -1,
  connectedPowerDeviceCount: -1
})

export const fakeIncidentVlan = fakeIncident({
  severity: 0.75,
  startTime: '2022-08-30T07:00:00.000Z',
  endTime: '2022-10-05T01:00:00.000Z',
  code: 'i-switch-vlan-mismatch',
  sliceType: 'switchGroup',
  sliceValue: 'GRP2',
  id: '9bce5e7b-7959-44da-8dc6-b176456a2bfd',
  path: [
    {
      type: 'switchGroup',
      name: 'GRP2'
    }
  ],
  metadata: {
    dominant: {},
    rootCauseChecks: {
      checks: [],
      params: {}
    }
  },
  clientCount: -1,
  impactedClientCount: -1,
  isMuted: false,
  mutedBy: null,
  mutedAt: null,
  slaThreshold: null,
  currentSlaThreshold: null,
  apCount: -1,
  impactedApCount: -1,
  switchCount: 1,
  vlanCount: 6,
  connectedPowerDeviceCount: 11
})

export const fakeIncidentPoePd = fakeIncident({
  severity: 1,
  startTime: '2022-09-27T09:08:00.639Z',
  endTime: '2022-09-27T09:08:10.639Z',
  code: 'i-switch-poe-pd',
  sliceType: 'switchGroup',
  sliceValue: 'Unknown',
  id: '38023e6a-fa01-4510-be64-0cf8c7f03fb7',
  path: [
    {
      type: 'switchGroup',
      name: 'Unknown'
    }
  ],
  metadata: {
    dominant: {},
    rootCauseChecks: {
      checks: [],
      params: {}
    }
  },
  clientCount: -1,
  impactedClientCount: -1,
  isMuted: false,
  mutedBy: null,
  mutedAt: null,
  slaThreshold: null,
  currentSlaThreshold: null,
  apCount: -1,
  impactedApCount: -1,
  switchCount: 2,
  vlanCount: 0,
  connectedPowerDeviceCount: 0
})

export const fakeIncidentPoeLow = fakeIncident({
  severity: 0.75,
  startTime: '2022-03-25T00:00:00.000Z',
  endTime: '2022-08-08T00:00:00.000Z',
  code: 'i-apinfra-poe-low',
  sliceType: 'ap',
  sliceValue: 'Phong_Vegas1',
  id: '2114e956-e003-4489-8cfd-5bdc075505b5',
  path: [
    {
      type: 'zone',
      name: 'Fong@Home'
    },
    {
      type: 'apGroup',
      name: 'default'
    },
    {
      type: 'ap',
      name: '20:58:69:08:37:10'
    }
  ],
  metadata: {
    dominant: {},
    rootCauseChecks: {
      checks: [],
      params: {}
    }
  },
  clientCount: -1,
  impactedClientCount: -1,
  isMuted: false,
  mutedBy: null,
  mutedAt: null,
  slaThreshold: null,
  currentSlaThreshold: null,
  apCount: 1,
  impactedApCount: 1,
  switchCount: -1,
  vlanCount: -1,
  connectedPowerDeviceCount: -1
})

export const fakeIncidentApInfraWanthroughput = fakeIncident({
  severity: 0.75,
  startTime: '2022-08-02T00:00:00.000Z',
  endTime: '2022-08-03T00:00:00.000Z',
  code: 'i-apinfra-wanthroughput-low',
  sliceType: 'zone',
  sliceValue: 'AlphaNet_5_1',
  id: '191fef00-b9ae-4040-9908-407ccec18fc7',
  path: [
    {
      type: 'zone',
      name: 'AlphaNet_5_1'
    }
  ],
  metadata: {
    dominant: {},
    rootCauseChecks: {
      checks: [],
      params: {}
    }
  },
  clientCount: -1,
  impactedClientCount: -1,
  isMuted: false,
  mutedBy: null,
  mutedAt: null,
  slaThreshold: null,
  currentSlaThreshold: null,
  apCount: 21,
  impactedApCount: 7,
  switchCount: -1,
  vlanCount: -1,
  connectedPowerDeviceCount: -1
})
