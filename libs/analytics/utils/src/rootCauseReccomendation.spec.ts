import { 
  commonRecommendations,
  getRootCauseAndRecommendations,
  RootCauseRecommendation,
  extractFailureCode
} from './rootCauseReccomendationMap'
import { Incident } from './types/incidents'


const testIncident: Incident = {
  severity: 0.3813119146230035,
  startTime: '2022-07-21T01:15:00.000Z',
  endTime: '2022-07-21T01:18:00.000Z',
  code: 'auth-failure',
  sliceType: 'zone',
  sliceValue: 'Venue-3-US',
  id: '268a443a-e079-4633-9491-536543066e7d',
  path: [
    {
      type: 'zone',
      name: 'Venue-3-US'
    }
  ],
  metadata: {
    dominant: {
      ssid: 'qa-eric-acx-R760-psk'
    },
    rootCauseChecks: {
      checks: [
        {
          CCD_REASON_NOT_AUTHED: true
        }
      ],
      params: {}
    }
  },
  clientCount: 2,
  impactedClientCount: 2,
  isMuted: false,
  mutedBy: null,
  mutedAt: null,
  apCount: 0,
  impactedApCount: 0,
  switchCount: 0,
  vlanCount: 0,
  connectedPowerDeviceCount: 0,
  slaThreshold: null,
  currentSlaThreshold: null
}

describe('rootCauseReccomendation', () => {
  it('getrootCauseReccomendation should return RootCauseReccomendation', () => {
    const firstReccommendation = getRootCauseAndRecommendations(
      testIncident.code,
      testIncident.metadata
    )
  
    expect(firstReccommendation).toBeTruthy()
    expect(firstReccommendation).toMatchObject<RootCauseRecommendation[]>([{
      rootCauses: [
        // eslint-disable-next-line max-len
        'Clients are failing to connect during the 802.11 open authentication, but the exact reason for the failures is unclear.'
      ],
      recommendations: commonRecommendations
    }])
  })

  it('rootCauseReccomendation should return empty reccomendation', () => {
    const emptyReccomendation = getRootCauseAndRecommendations(
      testIncident.code,
      {
        dominant: {
          ssid: 'qa-eric-acx-R760-psk'
        },
        rootCauseChecks: {
          checks: [] as Record<string, boolean>[],
          params: { test: 'test' } as Record<string, string>
        }
      }
    )
    
    expect(emptyReccomendation).toBeTruthy()
    expect(emptyReccomendation).toMatchObject<RootCauseRecommendation[]>([{ 
      rootCauses: ['No specific root cause.'],
      recommendations: ['No recommendation.']
    }])
  })

  it('extractFailureCode should return string', () => {
    const validError = extractFailureCode(testIncident.metadata.rootCauseChecks.checks)

    expect(validError).toBe('CCD_REASON_NOT_AUTHED')

    const emptyError = extractFailureCode([])
    expect(emptyError).toBe('DEFAULT')
  })

})