import { defineMessage } from 'react-intl'

import { getRootCauseAndRecommendations, codeToFailureTypeMap, rootCauseRecommendationMap } from './rootCauseRecommendation'
import { IncidentDetailsMetadata }                                                          from './types'

interface InsightComponentProps {
  code: keyof typeof codeToFailureTypeMap
  metadata: IncidentDetailsMetadata
}

describe('getRootCauseAndRecommendations', () => {
  it('should return correct data', () => {
    const incident = {
      code: 'auth-failure',
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
    } as InsightComponentProps
    const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(
      incident.code, incident.metadata.rootCauseChecks)
    const failureType = codeToFailureTypeMap[incident.code]
    expect(rootCauses).toEqual(
      rootCauseRecommendationMap[failureType]['CCD_REASON_AUTH_FT_ROAM_FAILURE'].rootCauses)
    expect(recommendations).toEqual(
      rootCauseRecommendationMap[failureType]['CCD_REASON_AUTH_FT_ROAM_FAILURE'].recommendations)
  })

  it('should return correct data if no rootCauseChecks', () => {
    const incident = {
      code: 'dhcp-failure',
      metadata: {
        dominant: {}
      }
    } as InsightComponentProps
    const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(
      incident.code, incident.metadata.rootCauseChecks)
    expect(rootCauses).toEqual(defineMessage({ defaultMessage: '<p>Calculating...</p>' }))
    expect(recommendations).toEqual(defineMessage({ defaultMessage: '<p>Calculating...</p>' }))
  })

  it('should return DEFAULT result if rootCauseChecks length is 0', () => {
    const incident = {
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
    } as InsightComponentProps
    const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(
      incident.code, incident.metadata.rootCauseChecks)
    const failureType = codeToFailureTypeMap[incident.code]
    expect(rootCauses).toEqual(
      rootCauseRecommendationMap[failureType]['DEFAULT'].rootCauses)
    expect(recommendations).toEqual(
      rootCauseRecommendationMap[failureType]['DEFAULT'].recommendations)
  })

  it('should return VARIOUS_REASONS results if rootCauseChecks length is more than 1', () => {
    const incident = {
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
    } as InsightComponentProps
    const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(
      incident.code, incident.metadata.rootCauseChecks)
    const failureType = codeToFailureTypeMap[incident.code]
    expect(rootCauses).toEqual(
      rootCauseRecommendationMap[failureType]['VARIOUS_REASONS'].rootCauses)
    expect(recommendations).toEqual(
      rootCauseRecommendationMap[failureType]['VARIOUS_REASONS'].recommendations)
  })

  it('should return TBD if key is undefined', () => {
    const incident = {
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
    } as InsightComponentProps
    const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(
      incident.code, incident.metadata.rootCauseChecks)
    expect(rootCauses).toEqual(defineMessage({ defaultMessage: '<p>TBD</p>' }))
    expect(recommendations).toEqual(defineMessage({ defaultMessage: '<p>TBD</p>' }))
  })

  it('should return TBD if failureType is not in list', () => {
    const incident = {
      code: 'new-failure',
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
    } as unknown as InsightComponentProps
    const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(
      incident.code, incident.metadata.rootCauseChecks)
    expect(rootCauses).toEqual(defineMessage({ defaultMessage: '<p>TBD</p>' }))
    expect(recommendations).toEqual(defineMessage({ defaultMessage: '<p>TBD</p>' }))
  })
})
