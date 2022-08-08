import { IncidentDetailsProps } from '@acx-ui/analytics/utils'

import {
  getDataWithPercentage,
  getDominance,
  getWLANDominance,
  getDominanceByThreshold
} from './config'

describe('getDataWithPercentage', () => {
  it('should return correct data', () => {
    const data = [
      { key: 'ssid1', name: 'ssid1', value: 2 },
      { key: 'ssid2', name: 'ssid2', value: 1 }
    ]
    expect(getDataWithPercentage(data)).toEqual([
      {
        key: 'ssid1',
        percentage: 0.6666666666666666,
        value: 2
      },
      {
        key: 'ssid2',
        percentage: 0.3333333333333333,
        value: 1
      }
    ])
  })
  it('should return correct data when no data', () => {
    const data = [
      { key: 'ssid1', name: 'ssid1', value: 0 },
      { key: 'ssid2', name: 'ssid2', value: 0 }
    ]
    expect(getDataWithPercentage(data)).toEqual([
      { key: 'ssid1', percentage: 0, value: 0 },
      { key: 'ssid2', percentage: 0, value: 0 }
    ])
  })
})

describe('getDominance', () => {
  it('should return correct data', () => {
    const data = [
      { key: 'ssid1', name: 'ssid1', value: 2 },
      { key: 'ssid2', name: 'ssid2', value: 1 }
    ]
    expect(getDominance(data)).toEqual({
      key: 'ssid1',
      percentage: 0.6666666666666666,
      value: 2
    })
  })
})

describe('getDominanceByThreshold', () => {
  it('should return correct data', () => {
    const data = [
      { key: 'ssid1', name: 'ssid1', value: 2 },
      { key: 'ssid2', name: 'ssid2', value: 1 }
    ]
    expect(getDominanceByThreshold(0.5)(data)).toEqual({
      key: 'ssid1',
      percentage: 0.6666666666666666,
      value: 2
    })
  })
  it('should return null when result less than threshold', () => {
    const data = [
      { key: 'ssid1', name: 'ssid1', value: 2 },
      { key: 'ssid2', name: 'ssid2', value: 1 }
    ]
    expect(getDominanceByThreshold(0.7)(data)).toEqual(null)
  })
  it('should return null when key is Others', () => {
    const data = [
      { key: 'Others', name: 'Others', value: 2 },
      { key: 'ssid2', name: 'ssid2', value: 1 }
    ]
    expect(getDominanceByThreshold(0.5)(data)).toEqual(null)
  })
})

describe('getWLANDominance', () => {
  it('should return null when no ssid', () => {
    const incident = { id: 'id', metadata: { dominant: { } } } as IncidentDetailsProps
    const data = [
      { key: 'ssid1', name: 'ssid1', value: 2 },
      { key: 'ssid2', name: 'ssid2', value: 1 }
    ]
    expect(getWLANDominance(data, incident)).toEqual(null)
  })
  it('should return correct data', () => {
    const incident = { id: 'id', metadata: { dominant: { ssid: 'ssid2' } } } as IncidentDetailsProps
    const data = [
      { key: 'ssid1', name: 'ssid1', value: 2 },
      { key: 'ssid2', name: 'ssid2', value: 1 }
    ]
    expect(getWLANDominance(data, incident)).toEqual({
      key: 'ssid2',
      percentage: 0.3333333333333333,
      value: 1
    })
  })
})
