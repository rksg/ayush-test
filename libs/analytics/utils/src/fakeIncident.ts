import { incidentInformation, IncidentInformation } from './incidentInformation'
import { Incident }                                 from './types/incidents'

type RequiredFields = 'id'
  | 'code'
  | 'path'
  | 'startTime'
  | 'endTime'

type FakeIncidentProps = Partial<Omit<Incident, keyof IncidentInformation>>
  & Pick<Incident, RequiredFields>

const defaultValue = {
  isMuted: false,
  metadata: { dominant: {}, rootCauseChecks: { checks: [], params: {} } },
  mutedAt: null,
  mutedBy: null,
  slaThreshold: null
}

export function fakeIncident (props: FakeIncidentProps): Incident {
  const info = incidentInformation[props.code]
  let sliceType = props.sliceType
  let sliceValue = props.sliceValue
  const lastNode = props.path[props.path.length - 1]
  if (!sliceType && lastNode) { sliceType = lastNode.type }
  if (!sliceValue && lastNode) { sliceValue = lastNode.name }

  return {
    ...defaultValue,
    ...props,
    ...info,
    sliceType,
    sliceValue
  } as Incident
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
  impactedApCount: -1,
  switchCount: -1,
  currentSlaThreshold: null,
  severity: 0.674055825227442,
  connectedPowerDeviceCount: -1,
  mutedAt: null,
  impactedClientCount: 5
})
