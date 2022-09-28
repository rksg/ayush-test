import { capitalize, omit } from 'lodash'

import { renderHook } from '@acx-ui/test-utils'

import { fakeIncident, fakeIncident1 } from './fakeIncident'
import {
  calculateSeverity,
  impactValues,
  transformIncidentQueryResult,
  formattedNodeType,
  formattedPath,
  impactedArea,
  useImpactValues,
  shortDescription,
  incidentScope,
  getThreshold
} from './incidents'

import type { Incident, NodeType, PathNode } from './types/incidents'

describe('calculateSeverity', () => {
  it('should return correct value', () => {
    const output = [0.1, 0.65, 0.76, 0.92].map((severity) => calculateSeverity(severity))
    expect(output).toEqual(['P4', 'P3', 'P2', 'P1'])
  })
})

describe('transformIncidentQueryResult', () => {
  it('adds incident information into the result', () => {
    const incident = fakeIncident({
      id: '1',
      code: 'dhcp-failure',
      startTime: '2022-08-12T00:00:00.000Z',
      endTime: '2022-08-12T01:00:00.000Z',
      path: [
        { type: 'network', name: 'Network' },
        { type: 'zone', name: 'Venue 1' }
      ]
    })
    const result = omit(incident, [
      'incidentType',
      'shortDescription',
      'longDescription',
      'category',
      'subCategory'
    ])
    expect(transformIncidentQueryResult(result)).toEqual(incident)
  })
})

describe('shortDescription', () => {
  it('should return correct value', () => {
    const incident = fakeIncident({
      id: '1',
      code: 'eap-failure',
      startTime: '2022-08-12T00:00:00.000Z',
      endTime: '2022-08-12T01:00:00.000Z',
      path: [
        { type: 'network', name: 'Network' },
        { type: 'zone', name: 'Venue 1' }
      ],
      sliceType: 'zoneName',
      sliceValue: 'Venue 1'
    })
    const renderShortDescription: typeof shortDescription = (incident) =>
      renderHook(() => shortDescription(incident)).result.current
    expect(renderShortDescription(incident)).toContain('Venue: Venue 1')
  })
  it('should return correct value with threshold', () => {
    const incident = fakeIncident({
      id: '1',
      code: 'ttc',
      startTime: '2022-08-12T00:00:00.000Z',
      endTime: '2022-08-12T01:00:00.000Z',
      path: [
        { type: 'network', name: 'Network' },
        { type: 'zone', name: 'Venue 1' }
      ],
      sliceType: 'zoneName',
      sliceValue: 'Venue 1'
    })
    const renderShortDescription: typeof shortDescription = (incident) =>
      renderHook(() => shortDescription(incident)).result.current
    expect(renderShortDescription(incident)).toContain('2s')
  })
})

describe('formattedNodeType', () => {
  const renderNodeType = (nodeType: NodeType) =>
    renderHook(() => formattedNodeType(nodeType)).result.current

  it('should return correct value', () => {
    expect(renderNodeType('network')).toEqual('Organization')
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

describe('formattedPath', () => {
  it('returns path with correct format', () => {
    const { result } = renderHook(() => formattedPath([
      { type: 'network', name: 'N' },
      { type: 'zone', name: 'V' },
      { type: 'apGroup', name: 'AG' }
    ], 'Name'))
    expect(result.current).toEqual('V (Venue)\n> AG (AP Group)')
  })
  it('returns path which contains AP with correct format', () => {
    const { result } = renderHook(() => formattedPath([
      { type: 'network', name: 'N' },
      { type: 'zone', name: 'V' },
      { type: 'apGroup', name: 'AG' },
      { type: 'ap', name: 'IP' }
    ], 'Name'))
    expect(result.current).toEqual('V (Venue)\n> AG (AP Group)\n> Name (IP) (Access Point)')
  })
})

describe('impactedArea', () => {
  const renderImpactedArea: typeof impactedArea = (path, sliceValue) =>
    renderHook(() => impactedArea(path, sliceValue)).result.current

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

    const renderImpactValues: typeof useImpactValues =
    (type: 'ap' | 'client', incident: Incident) =>
      renderHook(() => useImpactValues(type, incident)).result.current

    it('returns object for invalid count & impactArea', () => {
      expect(renderImpactValues('client', fakeIncident1)).toMatchObject({
        clientImpactDescription: '5 of 27 clients (18.52%)'
      })
    })

  })
})

describe('impactValues', () => {
  const incident = (type: 'ap' | 'client', count: number | null, impactedCount: number | null) => ({
    [`${type}Count`]: count,
    [`impacted${capitalize(type)}Count`]: impactedCount
  }) as unknown as Incident

  const renderImpactValues = (
    type: 'ap' | 'client',
    count: number | null,
    impactedCount: number | null
  ) => renderHook(() => impactValues(
    type,
    incident(type, count, impactedCount)
  )).result.current

  it('handles when incident has no client impact', () => {
    expect(renderImpactValues('client', -1, -1)).toMatchSnapshot()
  })

  it('handles when incident is calculating', () => {
    expect(renderImpactValues('client', null, null)).toMatchSnapshot()
  })

  it('handles clientCount = 0', () => {
    expect(renderImpactValues('client', 0, 0)).toMatchSnapshot()
  })

  it('handles when incident has no client impact but has clinet count', () => {
    expect(renderImpactValues('client', 128, 0)).toMatchSnapshot()
  })

  it('handles when incident has client impact', () => {
    expect(renderImpactValues('client', 128, 55)).toMatchSnapshot()
  })

  it('formats impacted client count', () => {
    expect(renderImpactValues('client', 1500, 1300)).toMatchSnapshot()
  })

  it('formats impacted ap count', () => {
    expect(renderImpactValues('ap', 1, 1)).toMatchSnapshot()
  })

  describe('incidentScope', () => {
    const renderUseIncidentScope = () => renderHook(
      () => incidentScope(
        fakeIncident({
          id: '1',
          code: 'dhcp-failure',
          startTime: '2022-08-12T00:00:00.000Z',
          endTime: '2022-08-12T01:00:00.000Z',
          path: [
            { type: 'network', name: 'Network' },
            { type: 'zone', name: 'Venue 1' }
          ]
        })
      )).result.current

    it('formats correct incident scope', () => {
      expect(renderUseIncidentScope()).toMatchSnapshot()
    })
  })
})

describe('useGetThreshold', () => {
  const useGetThreshold = (incident: Incident) => {
    const threshold = getThreshold(incident)
    return threshold
  }
  it('should return the correct result for ttc', () => {
    const renderUseGetThreshold = () => renderHook(
      () => useGetThreshold(
        fakeIncident({
          id: '1',
          code: 'ttc',
          startTime: '2022-08-12T00:00:00.000Z',
          endTime: '2022-08-12T01:00:00.000Z',
          path: [
            { type: 'network', name: 'Network' },
            { type: 'zone', name: 'Venue 1' }
          ]
        })
      )).result.current
    expect(renderUseGetThreshold()).toEqual('2s')
  })
  it('should return undefined when code does not match', () => {
    const renderUseGetThreshold = () => renderHook(
      () => useGetThreshold(
        fakeIncident({
          id: '1',
          code: 'radius-failure',
          startTime: '2022-08-12T00:00:00.000Z',
          endTime: '2022-08-12T01:00:00.000Z',
          path: [
            { type: 'network', name: 'Network' },
            { type: 'zone', name: 'Venue 1' }
          ]
        })
      )).result.current
    expect(renderUseGetThreshold()).toEqual(undefined)
  })
})
