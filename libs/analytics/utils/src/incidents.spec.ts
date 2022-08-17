import { renderHook } from '@acx-ui/test-utils'

import { noDataSymbol } from './constants'
import {
  calculateSeverity,
  useFormattedNodeType,
  useFormattedPath,
  useImpactedArea,
  useImpactValues,
  useLongDesription,
  useShortDescription
} from './incidents'
import { getRootCauseAndRecommendations } from './rootCauseReccomendationMap'

import type { Incident, NodeType, PathNode } from './types/incidents'

describe('calculateSeverity', () => {
  it('should return correct value', () => {
    const output = [0.1, 0.65, 0.76, 0.92].map((severity) => calculateSeverity(severity))
    expect(output).toEqual(['P4', 'P3', 'P2', 'P1'])
  })
})

describe('useShortDescription', () => {
  const incident = {
    code: 'eap-failure',
    sliceType: 'zoneName',
    sliceValue: 'Venue 1',
    path: [
      { type: 'network', name: 'Network' },
      { type: 'zone', name: 'Venue 1' }
    ]
  } as Incident
  const renderShortDescription: typeof useShortDescription = (incident) =>
    renderHook(() => useShortDescription(incident)).result.current

  it('should return correct value', () => {
    expect(renderShortDescription(incident)).toContain('Venue: Venue 1')
  })
})

describe('useFormattedNodeType', () => {
  const renderNodeType = (nodeType: NodeType) =>
    renderHook(() => useFormattedNodeType(nodeType)).result.current

  it('should return correct value', () => {
    expect(renderNodeType('network')).toEqual('Entire Organization')
    expect(renderNodeType('apGroupName')).toEqual('AP Group')
    expect(renderNodeType('apGroup')).toEqual('AP Group')
    expect(renderNodeType('zoneName')).toEqual('Venue')
    expect(renderNodeType('zone')).toEqual('Venue')
    expect(renderNodeType('switchGroup')).toEqual('Venue')
    expect(renderNodeType('switch')).toEqual('Switch')
    expect(renderNodeType('apMac')).toEqual('Access Point')
    expect(renderNodeType('ap')).toEqual('Access Point')
    expect(renderNodeType('AP')).toEqual('Access Point')
    expect(renderNodeType('other' as unknown as NodeType)).toEqual('Unknown')
  })
})

describe('useFormattedPath', () => {
  it('returns path with correct format', () => {
    const { result } = renderHook(() => useFormattedPath([
      { type: 'network', name: 'N' },
      { type: 'zone', name: 'V' },
      { type: 'apGroup', name: 'AG' }
    ], 'Name'))
    expect(result.current).toEqual('V (Venue) > AG (AP Group)')
  })
  it('returns path which contains AP with correct format', () => {
    const { result } = renderHook(() => useFormattedPath([
      { type: 'network', name: 'N' },
      { type: 'zone', name: 'V' },
      { type: 'apGroup', name: 'AG' },
      { type: 'ap', name: 'IP' }
    ], 'Name'))
    expect(result.current).toEqual('V (Venue) > AG (AP Group) > Name (IP) (Access Point)')
  })
})

describe('useImpactedArea', () => {
  const renderImpactedArea: typeof useImpactedArea = (path, sliceValue) =>
    renderHook(() => useImpactedArea(path, sliceValue)).result.current

  const path = [{ type: 'zone', name: 'Venue' }] as PathNode[]
  it('return correct value for normal incident', () => {
    const sliceValue = 'Venue'
    expect(renderImpactedArea(path, sliceValue)).toEqual(sliceValue)
  })
  it('return correct value for AP incident', () => {
    const apPath = [...path, { type: 'ap', name: 'IP' }] as PathNode[]
    const sliceValue = 'AP'
    expect(renderImpactedArea(apPath, sliceValue)).toEqual(`${sliceValue} (IP)`)
  })
  it('returns sliceValue when node name same as sliceValue', () => {
    const sameNamePath = [...path, { type: 'ap', name: 'AP' }] as PathNode[]
    const sliceValue = 'AP'
    expect(renderImpactedArea(sameNamePath, sliceValue)).toEqual(sliceValue)
  })
  it('returns sliceValue when empty path', () => {
    const emptyPath = [] as PathNode[]
    const sliceValue = 'AP'
    expect(renderImpactedArea(emptyPath, sliceValue)).toEqual(sliceValue)
  })


  describe('useImpactValues', () => {
    const renderImpactValues: typeof useImpactValues = (type, count, impactArea) => 
      renderHook(() => useImpactValues(type, count, impactArea)).result.current

    it('returns object for invalid count & impactArea', () => {
      const type = 'test'
      expect(renderImpactValues(type, undefined, undefined)).toMatchObject({
        testImpact: null,
        testImpactFormatted: '',
        testImpactCountFormatted: '',
        testImpactDescription: 'Calculating...'
      })

      expect(renderImpactValues(type, 1, undefined)).toMatchObject({
        testImpact: null,
        testImpactFormatted: '',
        testImpactCountFormatted: '',
        testImpactDescription: 'Calculating...'
      })
    })

    it('return object for count & impactArea of -1 / 0', () => {
      const type = 'test'
      expect(renderImpactValues(type, -1, -1)).toMatchObject({
        testImpact: noDataSymbol,
        testImpactFormatted: noDataSymbol,
        testImpactCountFormatted: noDataSymbol,
        testImpactDescription: noDataSymbol
      })

      expect(renderImpactValues(type, 1, -1)).toMatchObject({
        testImpact: noDataSymbol,
        testImpactFormatted: noDataSymbol,
        testImpactCountFormatted: noDataSymbol,
        testImpactDescription: noDataSymbol
      })

      expect(renderImpactValues(type, 0, 1)).toMatchObject({
        testImpact: noDataSymbol,
        testImpactFormatted: noDataSymbol,
        testImpactCountFormatted: noDataSymbol,
        testImpactDescription: noDataSymbol
      })
    })

    it('returns object from correct values', () => {
      const type = 'ap'
      expect(renderImpactValues(type, 1, 1)).toMatchObject({
        apImpact: 1,
        apImpactFormatted: '100%',
        apImpactCountFormatted: '1',
        apImpactDescription: '1 of 1 AP (100%)'
      })

      expect(renderImpactValues(type, 2, 1)).toMatchObject({
        apImpact: 0.5,
        apImpactFormatted: '50%',
        apImpactCountFormatted: '1',
        apImpactDescription: '1 of 2 APs (50%)'
      })

      const nonApType = 'radius'
      expect(renderImpactValues(nonApType, 1, 1)).toMatchObject({
        radiusImpact: 1,
        radiusImpactFormatted: '100%',
        radiusImpactCountFormatted: '1',
        radiusImpactDescription: '1 of 1 radius (100%)'
      })
    })
  })

  describe('useLongDescription', () => {
    const renderLongDescription: typeof useLongDesription = (incident, rootCauses) => 
      renderHook(() => useLongDesription(incident, rootCauses)).result.current

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
    
    it('renders object on correct inputs', () => {
      const rootCauseAndRecomendation = 
        getRootCauseAndRecommendations(testIncident.code, testIncident.metadata)
      const { rootCauses } = rootCauseAndRecomendation[0]
      expect(renderLongDescription(testIncident, rootCauses)).toMatchSnapshot()
    })

    it('renders object on wrong inputs', () => {
      const undefinedMetadata = 
        { metadata: undefined, code: testIncident.code } as Incident
      const undefinedDominant = 
        { metadata: { dominant: undefined }, code: testIncident.code } as Incident
      const undefinedClientImpact = { 
        metadata: { dominant: 'testDominant' },
        clientImpact: null, code: testIncident.code 
      } as unknown as Incident
      const undefinedSSID = { 
        metadata: { dominant: { ssid: undefined } },
        clientImpact: null, code: testIncident.code 
      } as unknown as Incident

      const rootCauseAndRecomendation = 
        getRootCauseAndRecommendations(testIncident.code, testIncident.metadata)
      const { rootCauses } = rootCauseAndRecomendation[0]

      expect(renderLongDescription(undefinedMetadata, rootCauses)).toMatchSnapshot()
      expect(renderLongDescription(undefinedDominant, rootCauses)).toMatchSnapshot()
      expect(renderLongDescription(undefinedClientImpact, rootCauses)).toMatchSnapshot()
      expect(renderLongDescription(undefinedSSID, rootCauses)).toMatchSnapshot()
    })
  })
})
