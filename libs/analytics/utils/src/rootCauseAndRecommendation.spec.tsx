import { defineMessage } from 'react-intl'

import { IncidentCode }        from './constants'
import { fakeIncident }        from './fakeIncident'
import {
  getRootCauseAndRecommendations,
  codeToFailureTypeMap,
  rootCauseRecommendationMap
} from './rootCauseRecommendation'


const baseIncident = fakeIncident({
  id: '1',
  startTime: '2022-08-19T00:00:00.000Z',
  endTime: '2022-08-19T00:01:00.000Z',
  code: 'auth-failure',
  path: [{ type: 'zone', name: 'Venue 1' }]
})

describe('getRootCauseAndRecommendations', () => {
  it('should return correct data', () => {
    const incident = fakeIncident({
      ...baseIncident,
      metadata: {
        dominant: {},
        rootCauseChecks: {
          checks: [
            {
              AP_MODEL: false,
              FW_VERSION: true,
              CLIENT_OS_MFG: false,
              CCD_REASON_AUTH_FT_ROAM_FAILURE: true
            }
          ],
          params: {
            FW_VERSION: '6.1.1.0.917'
          }
        }
      }
    })
    const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(incident)
    const failureType = codeToFailureTypeMap[incident.code]
    expect(rootCauses).toEqual(
      rootCauseRecommendationMap[failureType]['CCD_REASON_AUTH_FT_ROAM_FAILURE'].rootCauses)
    expect(recommendations).toEqual(
      rootCauseRecommendationMap[failureType]['CCD_REASON_AUTH_FT_ROAM_FAILURE'].recommendations)
  })

  it('should return correct data if no rootCauseChecks', () => {
    const incident = fakeIncident({
      ...baseIncident,
      code: 'dhcp-failure',
      metadata: {
        dominant: {}
      }
    })
    const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(incident)
    expect(rootCauses).toEqual(defineMessage({ defaultMessage: '<p>Calculating...</p>' }))
    expect(recommendations).toEqual(defineMessage({ defaultMessage: '<p>Calculating...</p>' }))
  })

  it('should return DEFAULT result if rootCauseChecks length is 0', () => {
    const incident = fakeIncident({
      ...baseIncident,
      code: 'eap-failure',
      metadata: {
        dominant: {},
        rootCauseChecks: {
          checks: [],
          params: {
            FW_VERSION: '6.1.1.0.917'
          }
        }
      }
    })
    const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(incident)
    const failureType = codeToFailureTypeMap[incident.code]
    expect(rootCauses).toEqual(
      rootCauseRecommendationMap[failureType]['DEFAULT'].rootCauses)
    expect(recommendations).toEqual(
      rootCauseRecommendationMap[failureType]['DEFAULT'].recommendations)
  })

  it('should return VARIOUS_REASONS results if rootCauseChecks length is more than 1', () => {
    const incident = fakeIncident({
      ...baseIncident,
      code: 'radius-failure',
      metadata: {
        dominant: {},
        rootCauseChecks: {
          checks: [
            {
              AP_MODEL: false,
              FW_VERSION: true,
              CLIENT_OS_MFG: false,
              CCD_REASON_AUTH_FT_ROAM_FAILURE: true
            },
            {
              AP_MODEL: false,
              FW_VERSION: true,
              CLIENT_OS_MFG: false,
              CCD_REASON_AUTH_FT_ROAM_FAILURE: true
            }
          ],
          params: {
            FW_VERSION: '6.1.1.0.917'
          }
        }
      }
    })
    const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(incident)
    const failureType = codeToFailureTypeMap[incident.code]
    expect(rootCauses).toEqual(
      rootCauseRecommendationMap[failureType]['VARIOUS_REASONS'].rootCauses)
    expect(recommendations).toEqual(
      rootCauseRecommendationMap[failureType]['VARIOUS_REASONS'].recommendations)
  })

  it('should return TBD if key is undefined', () => {
    const incident = fakeIncident({
      ...baseIncident,
      code: 'auth-failure',
      metadata: {
        dominant: {},
        rootCauseChecks: {
          checks: [
            {
              AP_MODEL: false,
              FW_VERSION: true,
              CLIENT_OS_MFG: false,
              CCD_REASON_PREV_AUTH_NOT_VALID_NEW: true
            }
          ],
          params: {
            FW_VERSION: '6.1.1.0.917'
          }
        }
      }
    })
    const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(incident)
    expect(rootCauses).toEqual(defineMessage({ defaultMessage: '<p>TBD</p>' }))
    expect(recommendations).toEqual(defineMessage({ defaultMessage: '<p>TBD</p>' }))
  })

  it('should return TBD if failureType is not in list', () => {
    const incident = fakeIncident({
      ...baseIncident,
      code: 'new-failure' as unknown as IncidentCode,
      metadata: {
        dominant: {},
        rootCauseChecks: {
          checks: [
            {
              AP_MODEL: false,
              FW_VERSION: true,
              CLIENT_OS_MFG: false,
              CCD_REASON_PREV_AUTH_NOT_VALID_NEW: true
            }
          ],
          params: {
            FW_VERSION: '6.1.1.0.917'
          }
        }
      }
    })
    const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(incident)
    expect(rootCauses).toEqual(defineMessage({ defaultMessage: '<p>TBD</p>' }))
    expect(recommendations).toEqual(defineMessage({ defaultMessage: '<p>TBD</p>' }))
  })
})
