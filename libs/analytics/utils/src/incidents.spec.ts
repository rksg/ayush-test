import { omit } from 'lodash'

import { renderHook } from '@acx-ui/test-utils'

import { fakeIncident } from './fakeIncident'
import {
  calculateSeverity,
  transformIncidentQueryResult,
  useFormattedNodeType,
  useFormattedPath,
  useImpactedArea,
  useShortDescription
} from './incidents'

import type { NodeType, PathNode } from './types/incidents'

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

describe('useShortDescription', () => {
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
    expect(result.current).toEqual('V (Venue)\n> AG (AP Group)')
  })
  it('returns path which contains AP with correct format', () => {
    const { result } = renderHook(() => useFormattedPath([
      { type: 'network', name: 'N' },
      { type: 'zone', name: 'V' },
      { type: 'apGroup', name: 'AG' },
      { type: 'ap', name: 'IP' }
    ], 'Name'))
    expect(result.current).toEqual('V (Venue)\n> AG (AP Group)\n> Name (IP) (Access Point)')
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
})
