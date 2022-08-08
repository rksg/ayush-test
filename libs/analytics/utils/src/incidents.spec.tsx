import {
  calculateSeverity,
  formattedNodeName,
  formattedSliceType,
  formattedPath,
  impactedArea
} from './incidents'

import type { PathNode } from 'types/incidents'

describe('calculateSeverity', () => {
  it('should return correct value', () => {
    const output = [0.1, 0.65, 0.76, 0.92].map((severity) => calculateSeverity(severity))
    expect(output).toEqual(['P4', 'P3', 'P2', 'P1'])
  })
})

describe('formattedNodeName', () => {
  it('should return correct value', () => {
    expect(formattedNodeName({ type: 'ap', name: '70:CA:97:01:A0:C0' }, 'RuckusAP'))
      .toBe('RuckusAP (70:CA:97:01:A0:C0)')
    expect(formattedNodeName({ type: 'ap', name: 'RuckusAP' }, 'RuckusAP'))
      .toBe('RuckusAP')
    expect(formattedNodeName({ type: 'apGroup', name: 'default' }, 'default'))
      .toBe('default')
  })
})

describe('formattedSliceType', () => {
  it('should return correct value', () => {
    expect(formattedSliceType('network')).toEqual('Network')
    expect(formattedSliceType('apGroupName')).toEqual('AP Group')
    expect(formattedSliceType('apGroup')).toEqual('AP Group')
    expect(formattedSliceType('zoneName')).toEqual('Venue')
    expect(formattedSliceType('zone')).toEqual('Venue')
    expect(formattedSliceType('switchGroup')).toEqual('Venue')
    expect(formattedSliceType('switch')).toEqual('Switch')
    expect(formattedSliceType('apMac')).toEqual('Access Point')
    expect(formattedSliceType('ap')).toEqual('Access Point')
    expect(formattedSliceType('AP')).toEqual('Access Point')
    expect(formattedSliceType('other')).toEqual('other')
  })
})

describe('formattedPath', () => {
  it('returns path with correct format', () => {
    const path = [
      { type: 'network', name: 'N' },
      { type: 'zone', name: 'V' },
      { type: 'apGroup', name: 'AG' }
    ]
    expect(formattedPath(path, 'Name'))
      .toEqual('N (Network)\n> V (Venue)\n> AG (AP Group)')
  })
  it('returns path which contains AP with correct format', () => {
    const path = [
      { type: 'network', name: 'N' },
      { type: 'zone', name: 'V' },
      { type: 'apGroup', name: 'AG' },
      { type: 'ap', name: 'IP' }
    ]
    expect(formattedPath(path, 'Name')).toEqual(
      'N (Network)\n> V (Venue)\n> AG (AP Group)\n> Name (IP) (Access Point)'
    )
  })
})

describe('impactedArea', () => {
  const path = [{ type: 'zone', name: 'Venue' }]
  it('return correct value for normal incident', () => {
    const sliceValue = 'Venue'
    expect(impactedArea(path, sliceValue)).toEqual(sliceValue)
  })
  it('return correct value for AP incident', () => {
    const apPath = [...path, { type: 'ap', name: 'IP' }]
    const sliceValue = 'AP'
    expect(impactedArea(apPath, sliceValue)).toEqual(`${sliceValue} (IP)`)
  })
  it('returns sliceValue when node name same as sliceValue', () => {
    const sameNamePath = [...path, { type: 'ap', name: 'AP' }]
    const sliceValue = 'AP'
    expect(impactedArea(sameNamePath, sliceValue)).toEqual(sliceValue)
  })
  it('returns sliceValue when empty path', () => {
    const emptyPath = [] as PathNode[]
    const sliceValue = 'AP'
    expect(impactedArea(emptyPath, sliceValue)).toEqual(sliceValue)
  })
})
