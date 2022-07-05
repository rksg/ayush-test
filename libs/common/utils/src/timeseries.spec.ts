import { getSeriesData } from './index'

import { NetworkHistoryData }                    from '@acx-ui/utils'
import { TrafficByVolumeData }                   from '@acx-ui/utils'
import { seriesMapping }                         from '../../../../apps/analytics/src/widgets/NetworkHistory/index'
import { 
  seriesMapping as TrafficByVolumeseriesMapping
} from '../../../../apps/analytics/src/widgets/TrafficByVolume/index'

const sample = {
  time: [
    '2022-04-07T09:15:00.000Z',
    '2022-04-07T09:30:00.000Z',
    '2022-04-07T09:45:00.000Z',
    '2022-04-07T10:00:00.000Z',
    '2022-04-07T10:15:00.000Z'
  ],
  newClientCount: [1, 2, 3, 4, 5],
  impactedClientCount: [6, 7, 8, 9, 10],
  connectedClientCount: [11, 12, 13, 14, 15]
}

const TrafficByVolumeDataSample = {
  time: [
    '2022-04-07T09:15:00.000Z',
    '2022-04-07T09:30:00.000Z',
    '2022-04-07T09:45:00.000Z',
    '2022-04-07T10:00:00.000Z',
    '2022-04-07T10:15:00.000Z'
  ],
  totalTraffic_all: [1, 2, 3, 4, 5],
  totalTraffic_6: [6, 7, 8, 9, 10],
  totalTraffic_5: [11, 12, 13, 14, 15],
  totalTraffic_24: [16, 17, 18, 19, 20]
}

describe('getSeriesData', ()=>{
  it('should return correct format', ()=>{
    expect(getSeriesData(sample as NetworkHistoryData , seriesMapping))
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
  it('should return empty array if no data', ()=>{
    expect(getSeriesData(null, seriesMapping))
      .toEqual([])
  })
})

describe('getSeriesData for TrafficByVolume', ()=>{
  it('should return correct format', ()=>{
    expect(getSeriesData(TrafficByVolumeDataSample  as TrafficByVolumeData, TrafficByVolumeseriesMapping))
      .toEqual([
        {
          name: 'All Radios',
          data: sample.time.map((t,index)=>[t, 1+index])
        },
        {
          name: '2.4 GHz',
          data: sample.time.map((t,index)=>[t, 16+index])
        },
        {
          name: '5 GHz',
          data: sample.time.map((t,index)=>[t, 11+index])
        },
        {
          name: '6 GHz',
          data: sample.time.map((t,index)=>[t, 6+index])
        }
      ])
  })
  it('should return empty array if no data', ()=>{
    expect(getSeriesData(null, TrafficByVolumeseriesMapping))
    .toEqual([])
  })
})
