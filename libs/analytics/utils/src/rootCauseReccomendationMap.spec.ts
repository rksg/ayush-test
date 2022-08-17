import { 
  commonRecommendations,
  getRootCauseAndRecommendations,
  RootCauseRecommendation,
  extractFailureCode
} from './rootCauseReccomendationMap'
import { Incident, IncidentMetadata } from './types/incidents'


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

    const undefinedRootCause = getRootCauseAndRecommendations(
      testIncident.code,
      undefined as unknown as IncidentMetadata
    )
    expect(undefinedRootCause).toBeTruthy()
    expect(undefinedRootCause).toMatchObject([{
      rootCauses: ['Calculating...'],
      recommendations: []
    }])

    const ccd80211RootCause = getRootCauseAndRecommendations('p-load-sz-cpu-load', 
    {
      rootCauseChecks: {
        checks: [{ CCD_REASON_PREV_AUTH_NOT_VALID: true }]
      }
    } as unknown as IncidentMetadata)
    expect(ccd80211RootCause).toMatchObject([{
      
      // eslint-disable-next-line max-len
      rootCauses: ['Client connection attempts are failing because the device is attempting to use a previously expired authentication key management (AKM) credential. This issue should be a transient problem in the network and should self-correct.'],
      recommendations: [
        // eslint-disable-next-line max-len
        'This problem should resolve on its own, but if it persists, check the infrastructure and client population for recent changes likely to produce this failure:',
        'Were new clients or APs introduced in the environment?',
        'Were the impacted client OS types recently upgraded?',
        'Was the AP firmware recently upgraded?',
        'Were the AP radio or WLAN settings recently modified?'
      ]
    }])


    const invalidCode = getRootCauseAndRecommendations('test', 
    {
      rootCauseChecks: {
        checks: [{ CCD_REASON_PREV_AUTH_NOT_VALID: true }]
      }
    } as unknown as IncidentMetadata)
    expect(invalidCode).toMatchObject([{
      rootCauses: ['TBD'],
      recommendations: ['TBD']
    }])
  })

  it('extractFailureCode should return string', () => {
    const validError = extractFailureCode(testIncident.metadata.rootCauseChecks.checks)

    expect(validError).toBe('CCD_REASON_NOT_AUTHED')

    const emptyError = extractFailureCode([])
    expect(emptyError).toBe('DEFAULT')

    const variousError = extractFailureCode([
      {
        CCD_REASON_NOT_AUTHED: true
      },
      {
        ttc: true
      }
    ])
    expect(variousError).toBe('VARIOUS_REASONS')
  })

})