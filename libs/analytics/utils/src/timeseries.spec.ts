import type { TimeStamp } from '@acx-ui/types'

import { getSeriesData } from './index'

const seriesMapping = [
  { key: 'newClientCount', name: 'New Clients' },
  { key: 'impactedClientCount', name: 'Impacted Clients' },
  { key: 'connectedClientCount', name: 'Connected Clients' }
] as Array<{ key: string, name: string }>

const sample = {
  time: [
    '2022-04-07T09:15:00.000Z',
    '2022-04-07T09:30:00.000Z',
    '2022-04-07T09:45:00.000Z',
    '2022-04-07T10:00:00.000Z',
    '2022-04-07T10:15:00.000Z'
  ] as TimeStamp[],
  newClientCount: [1, 2, 3, 4, 5],
  impactedClientCount: [6, 7, 8, 9, 10],
  connectedClientCount: [11, 12, 13, 14, 15]
}

describe('getSeriesData', () => {
  it('should return correct format', ()=>{
    expect(getSeriesData(sample, seriesMapping))
      .toEqual([
        {
          name: 'New Clients',
          data: sample.time.map((t,index)=>[t, 1+index])
        },
        {
          name: 'Impacted Clients',
          data: sample.time.map((t,index)=>[t, 6+index])
        },
        {
          name: 'Connected Clients',
          data: sample.time.map((t,index)=>[t, 11+index])
        }
      ])
  })
  it('should return - if data point is null', () => {
    const nullDataPointSample = {
      ...sample,
      newClientCount: [1, 2, null, 4, 5]
    }
    expect(
      getSeriesData(nullDataPointSample, seriesMapping)
        .find(d => d.name === 'New Clients')!
        .data[2][1]
    ).toEqual('-')
  })
  it('should return empty array if no data', ()=>{
    expect(getSeriesData(null, seriesMapping))
      .toEqual([])
  })
})
