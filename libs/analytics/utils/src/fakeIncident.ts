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

export const mockFakeIncident = (code: string = 'eap-failure') => fakeIncident({
  id: 'df5339ba-da3b-4110-a291-7f8993a274f3',
  code: code,
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

export const fakeIncident1 = mockFakeIncident()