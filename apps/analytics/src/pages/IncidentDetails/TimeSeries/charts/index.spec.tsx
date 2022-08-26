import { Incident }                      from '@acx-ui/analytics/utils'
import { store }                         from '@acx-ui/store'
import { mockAutoSizer, render, screen } from '@acx-ui/test-utils'

import { ChartsData } from '../services'
import { Api }        from '../services'

import { AttemptAndFailureChart } from './AttemptAndFailureChart'
import { ClientCountChart }       from './ClientCountChart'
import { IncidentChart }          from './IncidentChart'

const expectedResult = {
  incidentChart: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-08T09:30:00.000Z'
    ],
    radius: [1, 1]
  },
  relatedIncidents: {
    id: '07965e24-84ba-48a5-8200-f310f8197f40',
    severity: 0.5,
    code: 'radius',
    startTime: '2022-04-07T12:15:00.000Z',
    endTime: '2022-04-07T13:15:00.000Z'
  },
  clientCountCharts: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z',
      '2022-04-07T09:45:00.000Z',
      '2022-04-07T10:00:00.000Z',
      '2022-04-07T10:15:00.000Z'
    ],
    newClientCount: [1, 2, 3, 4, 5],
    impactedClientCount: [6, 7, 8, 9, 10],
    connectedClientCount: [11, 12, 13, 14, 15]
  },
  attemptAndFailureCharts: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z'
    ],
    failureCount: [1, 2],
    totalFailureCount: [1, 2],
    attemptCount: [1, 2]
  }
} as unknown as ChartsData

const sampleIncident = {
  apCount: -1,
  isMuted: false,
  mutedBy: null,
  slaThreshold: null,
  clientCount: 27,
  path: [
    {
      type: 'system',
      name: 'Edu2-vSZ-52'
    },
    {
      type: 'zone',
      name: 'Edu2-611-Mesh'
    },
    {
      type: 'apGroup',
      name: '255_Edu2-611-group'
    },
    {
      type: 'ap',
      name: '70:CA:97:01:A0:C0'
    }
  ],
  endTime: '2022-07-20T02:42:00.000Z',
  vlanCount: -1,
  sliceType: 'ap',
  code: 'eap-failure',
  startTime: '2022-07-19T05:15:00.000Z',
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
  id: 'df5339ba-da3b-4110-a291-7f8993a274f3',
  impactedApCount: -1,
  switchCount: -1,
  currentSlaThreshold: null,
  severity: 0.674055825227442,
  connectedPowerDeviceCount: -1,
  mutedAt: null,
  impactedClientCount: 5,
  sliceValue: 'RuckusAP'
} as Incident

beforeEach(() => store.dispatch(Api.util.resetApiState()))

describe('IncidentChart',()=>{
  mockAutoSizer()
  it('should match snapshot', () => {
    const { asFragment } = render(
      <IncidentChart incident={sampleIncident} data={expectedResult}/>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
describe('AttemptAndFailureChart',()=>{
  mockAutoSizer()
  it('should match snapshot', () => {
    const { asFragment } = render(
      <AttemptAndFailureChart incident={sampleIncident} data={expectedResult}/>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
describe('ClientCountChart',()=>{
  mockAutoSizer()
  it('should match snapshot', () => {
    const { asFragment } = render(
      <ClientCountChart incident={sampleIncident} data={expectedResult}/>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
