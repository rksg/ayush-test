import { Space }     from 'antd'
import { maxBy }     from 'lodash'
import { IntlShape } from 'react-intl'

import { TrendTypeEnum } from '@acx-ui/components'

import { rssGroups }   from '../VideoCallQoe/constants'
import { WifiMetrics } from '../VideoCallQoe/types'

import { TrendCircle } from './styledComponents'


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

export const getConnectionQuality = (wifiMetrics:WifiMetrics | null) => {
  if(!wifiMetrics){
    return null
  }
  const qualities = Object.entries(wifiMetrics).map(([key,value])=>
    getConnectionQualityFor(key,value)).filter(q => q !== null)
  return takeWorseQuality(qualities as string[])
}

export const getConnectionQualityTooltip = (wifiMetrics: WifiMetrics | null,{ $t }:IntlShape) => {
  if(!wifiMetrics){
    return []
  }
  const tooltipArr: JSX.Element[]=[]
  Object.entries(wifiMetrics).forEach(([key,value])=>{
    const quality = getConnectionQualityFor(key,value)
    let qualityTitle = ''
    switch (key) {
      case 'rss':
        qualityTitle=$t({ defaultMessage: 'RSS' })
        break
      case 'snr':
        qualityTitle=$t({ defaultMessage: 'SNR' })
        break
      case 'avgTxMCS':
        qualityTitle=$t({ defaultMessage: 'Avg. MCS (Downlink)' })
        break
      case 'throughput':
        qualityTitle=$t({ defaultMessage: 'Client Throughput' })
        break
    }
    let [trend,pillValue] = [TrendTypeEnum.None,$t({ defaultMessage: 'None' })]
    if(quality === 'bad')
      [trend,pillValue]=[TrendTypeEnum.Negative,$t({ defaultMessage: 'Bad' })]
    else if(quality === 'good')
      [trend,pillValue]=[TrendTypeEnum.Positive,$t({ defaultMessage: 'Good' })]
    else if(quality === 'average')
      [trend,pillValue]=[TrendTypeEnum.None,$t({ defaultMessage: 'Average' })]

    tooltipArr.push(
      <div style={{ paddingBottom: '5px' }} title={pillValue}>
        <Space>
          {quality ? <TrendCircle value='' trend={trend} /> : '-'}
          {qualityTitle}
        </Space>
      </div>)
  })
  return tooltipArr
}