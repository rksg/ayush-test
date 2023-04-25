import { Space } from 'antd'
import { maxBy } from 'lodash'

import { TrendPill, TrendType } from '@acx-ui/components'

const rssGroups = {
  good: { lower: -74 },
  average: { lower: -85, upper: -75 },
  bad: { upper: -86 }
}

const getRSSConnectionQuality = (value:number|null) => {
  if (value === null || value === undefined) return null
  if (value >= rssGroups.good.lower) return 'good'
  if (value >= rssGroups.average.lower) return 'average'
  return 'bad'
}

const getSNRConnectionQuality = (value:number|null) => {
  if (value === null || value === undefined) return null
  if (value >= 15) return 'good'
  if (value > 5) return 'average'
  return 'bad'
}

const getThroughputConnectionQuality = (value:number|null) => {
  if (value === null || value === undefined) return null
  value = value / 1024
  if (value > 2) return 'good'
  if (value >= 1) return 'average'
  return 'bad'
}

const getAvgTxMCSConnectionQuality = (value:number|null) => {
  if (value === null || value === undefined) return null
  value = value / 1024
  if (value >= 36) return 'good'
  if (value > 11) return 'average'
  return 'bad'
}

export const getConnectionQualityFor = (type: string, value: number | null) => {
  switch (type) {
    case 'rss':        return getRSSConnectionQuality(value)
    case 'snr':        return getSNRConnectionQuality(value)
    case 'throughput': return getThroughputConnectionQuality(value)
    case 'avgTxMCS':   return getAvgTxMCSConnectionQuality(value)
    default:           return null
  }
}

const maxByCount = (sets: string[], qualities: string[]) => {
  const qualitiesWithCount = sets.map(quality =>
    ({ quality, count: qualities.filter(q => q === quality).length }))
  return maxBy(qualitiesWithCount, 'count')
}

export const takeWorseQuality = (qualities: string[]) => {
  if (qualities.length === 0) return null

  const types = ['bad', 'average', 'good']
  const others = qualities.filter(q => !types.includes(q))
  let type
  while ((type = types.shift())) {
    if (qualities.includes(type)) return type
  }

  const max = maxByCount(Array.from(new Set(qualities)), others)

  return max?.quality
}

export const getConnectionQuality = (wifiMetrics:{
    rss: number | null
    snr: number | null
    avgTxMCS: number | null
    throughput: number | null
  } | null) => {
  if(!wifiMetrics){
    return null
  }
  const qualities = Object.entries<number|null>(wifiMetrics).map(([key,value])=>
    getConnectionQualityFor(key,value)).filter(q => q !== null)
  return takeWorseQuality(qualities as string[])
}

export const getConnectionQualityTooltip = (wifiMetrics:{
  rss: number | null
  snr: number | null
  avgTxMCS: number | null
  throughput: number | null
} | null) => {
  if(!wifiMetrics){
    return []
  }
  const tooltipArr: JSX.Element[]=[]
  Object.entries<number|null>(wifiMetrics).forEach(([key,value])=>{
    const quality = getConnectionQualityFor(key,value)
    let qualityTitle = ''
    switch (key) {
      case 'rss':
        qualityTitle='RSS'
        break
      case 'snr':
        qualityTitle='SNR'
        break
      case 'avgTxMCS':
        qualityTitle='Avg. MCS (Downlink)'
        break
      case 'throughput':
        qualityTitle='Client Throughput'
        break
    }
    let [trend,pillValue] = ['none','None']
    if(quality === 'bad')
      [trend,pillValue]=['negative','Bad']
    else if(quality === 'good')
      [trend,pillValue]=['positive','Good']
    else if(quality === 'average')
      [trend,pillValue]=['none','Average']

    tooltipArr.push(
      <div style={{ paddingBottom: '5px' }} title={pillValue}>
        <Space>
          {quality ? <TrendPill value='' trend={trend as TrendType} /> : '-'}
          {qualityTitle}
        </Space>
      </div>)
  })
  return tooltipArr
}