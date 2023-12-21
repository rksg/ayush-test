import { defineMessage } from 'react-intl'

import { IncidentCode } from './constants'
import { fakeIncident } from './fakeIncident'
import {
  getRootCauseAndRecommendations,
  codeToFailureTypeMap,
  rootCauseRecommendationMap,
  getBRootCauses,
  getBRecommendations,
  AirtimeBArray,
  getRxRootCauses,
  getRxRecommendations,
  AirtimeRxArray,
  AirtimeTxArray,
  getTxRootCauses,
  getTxRecommendations,
  ccd80211RootCauseRecommendations,
  htmlValues
} from './rootCauseRecommendation'

const baseIncident = fakeIncident({
  id: '1',
  startTime: '2022-08-19T00:00:00.000Z',
  endTime: '2022-08-19T00:01:00.000Z',
  code: 'auth-failure',
  path: [{ type: 'zone', name: 'Venue 1' }]
})

const airtimeBusyIncident = fakeIncident({
  id: '2',
  startTime: '2022-08-19T00:00:00.000Z',
  endTime: '2022-08-19T00:01:00.000Z',
  code: 'p-airtime-b-24g-high',
  path: [{ type: 'zone', name: 'Venue 2' }]
})

const airtimeRxIncident = fakeIncident({
  id: '3',
  startTime: '2022-08-19T00:01:00.000Z',
  endTime: '2022-08-19T00:02:00.000Z',
  code: 'p-airtime-rx-24g-high',
  path: [{ type: 'zone', name: 'Venue 3' }]
})

const airtimeTxIncident = fakeIncident({
  id: '4',
  startTime: '2022-08-19T00:02:00.000Z',
  endTime: '2022-08-19T00:03:00.000Z',
  code: 'p-airtime-tx-24g-high',
  path: [{ type: 'zone', name: 'Venue 4' }]
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
    expect(rootCauses.rootCauseText).toEqual(
      rootCauseRecommendationMap[failureType]['CCD_REASON_AUTH_FT_ROAM_FAILURE'].rootCauses)
    expect(recommendations.recommendationsText).toEqual(
      rootCauseRecommendationMap[failureType]['CCD_REASON_AUTH_FT_ROAM_FAILURE'].recommendations)
  })

  it('should return correct data for ccd incidents', () => {
    const incident = fakeIncident({
      ...baseIncident,
      metadata: {
        dominant: {},
        rootCauseChecks: {
          checks: [
            {
              CCD_REASON_UNSPECIFIED: true
            }
          ],
          params: {
            FW_VERSION: '6.1.1.0.917'
          }
        }
      }
    })
    const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(incident)
    expect(rootCauses.rootCauseText).toEqual(
      ccd80211RootCauseRecommendations['CCD_REASON_UNSPECIFIED'].rootCauses)
    expect(recommendations.recommendationsText).toEqual(
      ccd80211RootCauseRecommendations['CCD_REASON_UNSPECIFIED'].recommendations)
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
    expect(rootCauses).toEqual(defineMessage(
      { defaultMessage: '<p>Calculating...</p>' }))
    expect(recommendations).toEqual(defineMessage(
      { defaultMessage: '<p>Calculating...</p>' }))
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
    expect(rootCauses.rootCauseText).toEqual(
      rootCauseRecommendationMap[failureType]['DEFAULT'].rootCauses)
    expect(recommendations.recommendationsText).toEqual(
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
    expect(rootCauses.rootCauseText).toEqual(
      rootCauseRecommendationMap[failureType]['VARIOUS_REASONS'].rootCauses)
    expect(recommendations.recommendationsText).toEqual(
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
    expect(rootCauses.rootCauseText).toEqual(defineMessage({ defaultMessage: '<p>TBD</p>' }))
    expect(recommendations.recommendationsText).toEqual(
      defineMessage({ defaultMessage: '<p>TBD</p>' }))
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
    expect(rootCauses.rootCauseText).toEqual(defineMessage({ defaultMessage: '<p>TBD</p>' }))
    expect(recommendations.recommendationsText).toEqual(
      defineMessage({ defaultMessage: '<p>TBD</p>' }))
  })

  describe('airtime Busy Incident', () => {
    it('should return correct data if both true', () => {
      const checks = [
        { isRogueDetectionEnabled: true },
        { isCRRMRaised: true }
      ] as unknown as AirtimeBArray
      const incident = fakeIncident({
        ...airtimeBusyIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: {
            checks: [
              { isRogueDetectionEnabled: true },
              { isCRRMRaised: true }
            ]
          }
        }
      })
      const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(incident)
      const airtimeBRCA = getBRootCauses()
      const airtimeBRecommendations = getBRecommendations(checks)
      expect(rootCauses.rootCauseText).toEqual(airtimeBRCA.rootCauseText)
      expect(recommendations.recommendationsText).toEqual(
        airtimeBRecommendations.recommendationsText)
    })
    it('should return correct data if both false', () => {
      const checks = [
        { isRogueDetectionEnabled: true },
        { isCRRMRaised: true }
      ] as unknown as AirtimeBArray
      const incident = fakeIncident({
        ...airtimeBusyIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: {
            checks: [
              { isRogueDetectionEnabled: false },
              { isCRRMRaised: false }
            ]
          }
        }
      })
      const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(incident)
      const airtimeBRCA = getBRootCauses()
      const airtimeBRecommendations = getBRecommendations(checks)
      expect(rootCauses.rootCauseText).toEqual(airtimeBRCA.rootCauseText)
      expect(recommendations.recommendationsText).toEqual(
        airtimeBRecommendations.recommendationsText)
    })
  })

  describe('airtime Rx Incident', () => {
    it('should return correct data for all true', () => {
      const checks = [
        { isHighDensityWifiDevices: true },
        { isClbRecommendationRaised: true },
        { isHighSSIDCountPerRadio: true },
        { isChannelFlyEnabled: true },
        { isLargeMgmtFrameCount: true },
        { isHighLegacyWifiDevicesCount: true },
        { isCRRMRaised: true }
      ] as unknown as AirtimeRxArray
      const incident = fakeIncident({
        ...airtimeRxIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: {
            checks: [
              { isHighDensityWifiDevices: true },
              { isClbRecommendationRaised: true },
              { isHighSSIDCountPerRadio: true },
              { isChannelFlyEnabled: true },
              { isLargeMgmtFrameCount: true },
              { isHighLegacyWifiDevicesCount: true },
              { isCRRMRaised: true }
            ]
          }
        }
      })
      const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(incident)
      const airtimeRxRCA = getRxRootCauses(checks)
      const airtimeRxRecommendations = getRxRecommendations(checks)
      expect(rootCauses.rootCauseText).toEqual(airtimeRxRCA.rootCauseText)
      expect(recommendations.recommendationsText).toEqual(
        airtimeRxRecommendations.recommendationsText)
    })
    it('should return correct data for all false', () => {
      const checks = [
        { isHighDensityWifiDevices: false },
        { isClbRecommendationRaised: false },
        { isHighSSIDCountPerRadio: false },
        { isChannelFlyEnabled: false },
        { isLargeMgmtFrameCount: false },
        { isHighLegacyWifiDevicesCount: false },
        { isCRRMRaised: false }
      ] as unknown as AirtimeRxArray
      const incident = fakeIncident({
        ...airtimeRxIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: {
            checks: [
              { isHighDensityWifiDevices: false },
              { isClbRecommendationRaised: false },
              { isHighSSIDCountPerRadio: false },
              { isChannelFlyEnabled: false },
              { isLargeMgmtFrameCount: false },
              { isHighLegacyWifiDevicesCount: false },
              { isCRRMRaised: false }
            ]
          }
        }
      })
      const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(incident)
      const airtimeRxRCA = getRxRootCauses(checks)
      const airtimeRxRecommendations = getRxRecommendations(checks)
      expect(rootCauses.rootCauseText).toEqual(airtimeRxRCA.rootCauseText)
      expect(recommendations.recommendationsText).toEqual(
        airtimeRxRecommendations.recommendationsText)
    })
    it('should return correct varied data', () => {
      const checks = [
        { isHighDensityWifiDevices: true },
        { isClbRecommendationRaised: false },
        { isHighSSIDCountPerRadio: false },
        { isChannelFlyEnabled: false },
        { isLargeMgmtFrameCount: true },
        { isHighLegacyWifiDevicesCount: false },
        { isCRRMRaised: false }
      ] as unknown as AirtimeRxArray
      const incident = fakeIncident({
        ...airtimeRxIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: {
            checks: [
              { isHighDensityWifiDevices: true },
              { isClbRecommendationRaised: false },
              { isHighSSIDCountPerRadio: false },
              { isChannelFlyEnabled: false },
              { isLargeMgmtFrameCount: true },
              { isHighLegacyWifiDevicesCount: false },
              { isCRRMRaised: false }
            ]
          }
        }
      })
      const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(incident)
      const airtimeRxRCA = getRxRootCauses(checks)
      const airtimeRxRecommendations = getRxRecommendations(checks)
      expect(rootCauses.rootCauseText).toEqual(airtimeRxRCA.rootCauseText)
      expect(recommendations.recommendationsText).toEqual(
        airtimeRxRecommendations.recommendationsText)
    })
  })

  describe('airtime Tx Incident', () => {
    it('should return correct data for all true', () => {
      const checks = [
        { isHighDensityWifiDevices: true },
        { isClbRecommendationRaised: true },
        { isHighSSIDCountPerRadio: true },
        { isHighPacketErrorCount: true },
        { isLargeMgmtFrameCount: true },
        { isHighLegacyWifiDevicesCount: true },
        { isHighMCBCTraffic: true }
      ] as unknown as AirtimeTxArray
      const incident = fakeIncident({
        ...airtimeTxIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: {
            checks: [
              { isHighDensityWifiDevices: true },
              { isClbRecommendationRaised: true },
              { isHighSSIDCountPerRadio: true },
              { isHighPacketErrorCount: true },
              { isLargeMgmtFrameCount: true },
              { isHighLegacyWifiDevicesCount: true },
              { isHighMCBCTraffic: true }
            ]
          }
        }
      })
      const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(incident)
      const airtimeTxRCA = getTxRootCauses(checks)
      const airtimeTxRecommendations = getTxRecommendations(checks)
      expect(rootCauses.rootCauseText).toEqual(airtimeTxRCA.rootCauseText)
      expect(recommendations.recommendationsText).toEqual(
        airtimeTxRecommendations.recommendationsText)
    })
    it('should return correct data for all false', () => {
      const checks = [
        { isHighDensityWifiDevices: false },
        { isClbRecommendationRaised: false },
        { isHighSSIDCountPerRadio: false },
        { isHighPacketErrorCount: false },
        { isLargeMgmtFrameCount: false },
        { isHighLegacyWifiDevicesCount: false },
        { isHighMCBCTraffic: false }
      ] as unknown as AirtimeTxArray
      const incident = fakeIncident({
        ...airtimeTxIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: {
            checks: [
              { isHighDensityWifiDevices: false },
              { isClbRecommendationRaised: false },
              { isHighSSIDCountPerRadio: false },
              { isHighPacketErrorCount: false },
              { isLargeMgmtFrameCount: false },
              { isHighLegacyWifiDevicesCount: false },
              { isHighMCBCTraffic: false }
            ]
          }
        }
      })
      const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(incident)
      const airtimeTxRCA = getTxRootCauses(checks)
      const airtimeTxRecommendations = getTxRecommendations(checks)
      expect(rootCauses.rootCauseText).toEqual(airtimeTxRCA.rootCauseText)
      expect(recommendations.recommendationsText).toEqual(
        airtimeTxRecommendations.recommendationsText)
    })
    it('should return correct varied data', () => {
      const checks = [
        { isHighDensityWifiDevices: false },
        { isClbRecommendationRaised: false },
        { isHighSSIDCountPerRadio: false },
        { isHighPacketErrorCount: false },
        { isLargeMgmtFrameCount: true },
        { isHighLegacyWifiDevicesCount: false },
        { isHighMCBCTraffic: false }
      ] as unknown as AirtimeTxArray
      const incident = fakeIncident({
        ...airtimeTxIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: {
            checks: [
              { isHighDensityWifiDevices: false },
              { isClbRecommendationRaised: false },
              { isHighSSIDCountPerRadio: false },
              { isHighPacketErrorCount: false },
              { isLargeMgmtFrameCount: true },
              { isHighLegacyWifiDevicesCount: false },
              { isHighMCBCTraffic: false }
            ]
          }
        }
      })
      const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(incident)
      const airtimeTxRCA = getTxRootCauses(checks)
      const airtimeTxRecommendations = getTxRecommendations(checks)
      expect(rootCauses.rootCauseText).toEqual(airtimeTxRCA.rootCauseText)
      expect(recommendations.recommendationsText).toEqual(
        airtimeTxRecommendations.recommendationsText)
    })
  })

  describe('htmlValues', () => {
    it('should render a paragraph', () => {
      const text = 'Test paragraph'
      const result = htmlValues.p(text)

      expect(result.type).toBe('p')
      expect(result.props.children).toBe(text)
    })

    it('should render an ordered list', () => {
      const text = 'Test ordered list'
      const result = htmlValues.ol(text)

      expect(result.type).toBe('ol')
      expect(result.props.children).toBe(text)
    })

    it('should render a list item', () => {
      const text = 'Test list item'
      const result = htmlValues.li(text)

      expect(result.type).toBe('li')
      expect(result.props.children).toBe(text)
    })

    it('should render an unordered list', () => {
      const text = 'Test unordered list'
      const result = htmlValues.ul(text)

      expect(result.type).toBe('ul')
      expect(result.props.children).toBe(text)
    })
  })
})
