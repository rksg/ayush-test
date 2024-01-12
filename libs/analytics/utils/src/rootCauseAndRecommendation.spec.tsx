import { FormattedMessage, defineMessage } from 'react-intl'

import { get }            from '@acx-ui/config'
import { render, screen } from '@acx-ui/test-utils'

import { IncidentCode } from './constants'
import { fakeIncident } from './fakeIncident'
import {
  getRootCauseAndRecommendations,
  codeToFailureTypeMap,
  rootCauseRecommendationMap,
  ccd80211RootCauseRecommendations,
  htmlValues,
  AirtimeParams,
  AirtimeArray
} from './rootCauseRecommendation'

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

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
    expect(rootCauses.rootCauseText).toEqual(defineMessage(
      { defaultMessage: '<p>Calculating...</p>' }))
    expect(recommendations.recommendationsText).toEqual(defineMessage(
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
    it('should return correct data for all true', () => {
      const checks = [
        { isRogueDetectionEnabled: true },
        { isCRRMRaised: true }
      ] as unknown as AirtimeArray
      const incident = fakeIncident({
        ...airtimeBusyIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: { checks }
        }
      })
      expect(getRootCauseAndRecommendations(incident)).toMatchSnapshot()
    })
    it('should return correct data for all false', () => {
      const checks = [
        { isRogueDetectionEnabled: false },
        { isCRRMRaised: false }
      ] as unknown as AirtimeArray
      const incident = fakeIncident({
        ...airtimeBusyIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: { checks }
        }
      })
      expect(getRootCauseAndRecommendations(incident)).toMatchSnapshot()
    })
  })

  describe('airtime Rx Incident', () => {
    it('should return correct data for all true', () => {
      const checks = [
        { isHighDensityWifiDevices: true },
        { isAclbRaised: true },
        { isLargeMgmtFrameCount: true },
        { isHighSsidCountPerRadio: true },
        { isCRRMRaised: true },
        { isChannelFlyEnabled: true },
        { isHighLegacyWifiDevicesCount: true }
      ] as unknown as AirtimeArray
      const params = {
        ssidCountPerRadioSlice: 1
      } as AirtimeParams
      const incident = fakeIncident({
        ...airtimeRxIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: { checks, params }
        }
      })
      expect(getRootCauseAndRecommendations(incident)).toMatchSnapshot()
    })
    it('should return correct data for all false', () => {
      const checks = [
        { isHighDensityWifiDevices: false },
        { isAclbRaised: false },
        { isLargeMgmtFrameCount: false },
        { isHighSsidCountPerRadio: false },
        { isCRRMRaised: false },
        { isChannelFlyEnabled: false },
        { isHighLegacyWifiDevicesCount: false }
      ] as unknown as AirtimeArray
      const params = {
        ssidCountPerRadioSlice: 0
      } as AirtimeParams
      const incident = fakeIncident({
        ...airtimeRxIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: { checks, params }
        }
      })
      expect(getRootCauseAndRecommendations(incident)).toMatchSnapshot()
    })
    it('should return correct data for all false for RA', () => {
      jest.mocked(get).mockReturnValue('true')
      const checks = [
        { isHighDensityWifiDevices: false },
        { isAclbRaised: false },
        { isLargeMgmtFrameCount: false },
        { isHighSsidCountPerRadio: false },
        { isCRRMRaised: false },
        { isChannelFlyEnabled: false },
        { isHighLegacyWifiDevicesCount: false }
      ] as unknown as AirtimeArray
      const params = {
        ssidCountPerRadioSlice: 0
      } as AirtimeParams
      const incident = fakeIncident({
        ...airtimeRxIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: { checks, params }
        }
      })
      expect(getRootCauseAndRecommendations(incident)).toMatchSnapshot()
    })
    it('should return correct data when checks are false but text conditions are true', () => {
      const checks = [
        { isHighDensityWifiDevices: false },
        { isAclbRaised: true },
        { isLargeMgmtFrameCount: false },
        { isHighSsidCountPerRadio: true },
        { isCRRMRaised: false },
        { isChannelFlyEnabled: true },
        { isHighLegacyWifiDevicesCount: false }
      ] as unknown as AirtimeArray
      const params = {
        ssidCountPerRadioSlice: 0
      } as AirtimeParams
      const incident = fakeIncident({
        ...airtimeRxIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: { checks, params }
        }
      })
      expect(getRootCauseAndRecommendations(incident)).toMatchSnapshot()
    })
    it('should return correct data when only 1 root cause', () => {
      const checks = [
        { isHighDensityWifiDevices: false },
        { isAclbRaised: false },
        { isLargeMgmtFrameCount: true },
        { isHighSsidCountPerRadio: true },
        { isCRRMRaised: false },
        { isChannelFlyEnabled: false },
        { isHighLegacyWifiDevicesCount: false }
      ] as unknown as AirtimeArray
      const params = {
        ssidCountPerRadioSlice: 0
      } as AirtimeParams
      const incident = fakeIncident({
        ...airtimeRxIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: { checks, params }
        }
      })
      expect(getRootCauseAndRecommendations(incident)).toMatchSnapshot()
    })
    it('should return correct data when only 1 root cause not triggered', () => {
      const checks = [
        { isHighDensityWifiDevices: true },
        { isAclbRaised: false },
        { isLargeMgmtFrameCount: false },
        { isHighSsidCountPerRadio: false },
        { isCRRMRaised: true },
        { isChannelFlyEnabled: false },
        { isHighLegacyWifiDevicesCount: true }
      ] as unknown as AirtimeArray
      const params = {
        ssidCountPerRadioSlice: 0
      } as AirtimeParams
      const incident = fakeIncident({
        ...airtimeRxIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: { checks, params }
        }
      })
      expect(getRootCauseAndRecommendations(incident)).toMatchSnapshot()
    })
  })

  describe('airtime Tx Incident', () => {
    it('should return correct data for all true', () => {
      const checks = [
        { isHighDensityWifiDevices: true },
        { isAclbRaised: true },
        { isLargeMgmtFrameCount: true },
        { isHighSsidCountPerRadio: true },
        { isHighPacketErrorCount: true },
        { isHighMcbcTraffic: true },
        { isHighLegacyWifiDevicesCount: true }
      ] as unknown as AirtimeArray
      const params = {
        ssidCountPerRadioSlice: 1
      } as AirtimeParams
      const incident = fakeIncident({
        ...airtimeTxIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: { checks, params }
        }
      })
      expect(getRootCauseAndRecommendations(incident)).toMatchSnapshot()
    })
    it('should return correct data for all false', () => {
      const checks = [
        { isHighDensityWifiDevices: false },
        { isAclbRaised: false },
        { isLargeMgmtFrameCount: false },
        { isHighSsidCountPerRadio: false },
        { isHighPacketErrorCount: false },
        { isHighMcbcTraffic: false },
        { isHighLegacyWifiDevicesCount: false }
      ] as unknown as AirtimeArray
      const params = {
        ssidCountPerRadioSlice: 0
      } as AirtimeParams
      const incident = fakeIncident({
        ...airtimeTxIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: { checks, params }
        }
      })
      expect(getRootCauseAndRecommendations(incident)).toMatchSnapshot()
    })
    it('should return correct data when checks are false but text conditions are true', () => {
      const checks = [
        { isHighDensityWifiDevices: false },
        { isAclbRaised: true },
        { isLargeMgmtFrameCount: false },
        { isHighSsidCountPerRadio: true },
        { isHighPacketErrorCount: false },
        { isHighMcbcTraffic: false },
        { isHighLegacyWifiDevicesCount: false }
      ] as unknown as AirtimeArray
      const params = {
        ssidCountPerRadioSlice: 0
      } as AirtimeParams
      const incident = fakeIncident({
        ...airtimeTxIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: { checks, params }
        }
      })
      expect(getRootCauseAndRecommendations(incident)).toMatchSnapshot()
    })
    it('should return correct data when only 1 root cause', () => {
      const checks = [
        { isHighDensityWifiDevices: false },
        { isAclbRaised: false },
        { isLargeMgmtFrameCount: true },
        { isHighSsidCountPerRadio: true },
        { isHighPacketErrorCount: false },
        { isHighMcbcTraffic: false },
        { isHighLegacyWifiDevicesCount: false }
      ] as unknown as AirtimeArray
      const params = {
        ssidCountPerRadioSlice: 0
      } as AirtimeParams
      const incident = fakeIncident({
        ...airtimeTxIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: { checks, params }
        }
      })
      expect(getRootCauseAndRecommendations(incident)).toMatchSnapshot()
    })
    it('should return correct data when only 1 root cause not triggered', () => {
      const checks = [
        { isHighDensityWifiDevices: true },
        { isAclbRaised: false },
        { isLargeMgmtFrameCount: false },
        { isHighSsidCountPerRadio: false },
        { isHighPacketErrorCount: true },
        { isHighMcbcTraffic: true },
        { isHighLegacyWifiDevicesCount: true }
      ] as unknown as AirtimeArray
      const params = {
        ssidCountPerRadioSlice: 0
      } as AirtimeParams
      const incident = fakeIncident({
        ...airtimeTxIncident,
        metadata: {
          dominant: {},
          rootCauseChecks: { checks, params }
        }
      })
      expect(getRootCauseAndRecommendations(incident)).toMatchSnapshot()
    })
  })

  describe('htmlValues', () => {
    function testNode (node: string) {
      const FormatMessage = FormattedMessage
      return () => {
        const text = 'Test paragraph'
        const message = `<${node}>${text}</${node}>`
        render(<FormatMessage
          id='test-rcr-html-values'
          defaultMessage={message}
          values={htmlValues}
        />)

        const result = screen.getByText(text)
        expect(result.nodeName).toBe(node.toUpperCase())
        expect(result.textContent).toBe(text)
      }
    }
    it('should render a paragraph', testNode('p'))
    it('should render an ordered list', testNode('ol'))
    it('should render a list item', testNode('li'))
    it('should render an unordered list', testNode('ul'))
  })
})
