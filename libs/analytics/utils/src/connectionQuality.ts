import { maxBy } from 'lodash'

import { rssGroups } from './constants'

/**
 * reference from: https://jira-wiki.ruckuswireless.com/pages/viewpage.action?spaceKey=Team&title=MLISA+Client+Troubleshooting
 */

const getRSSConnectionQuality = (value: number | null | undefined) => {
  if (value === null || value === undefined) return null
  if (value >= rssGroups.good.lower) return 'good'
  if (value >= rssGroups.average.lower) return 'average'
  return 'bad'
}

const getSNRConnectionQuality = (value: number | null | undefined) => {
  if (value === null || value === undefined) return null
  if (value >= 15) return 'good'
  if (value > 5) return 'average'
  return 'bad'
}

const getThroughputConnectionQuality = (value: number | null | undefined) => {
  if (value === null || value === undefined) return null
  value = value / 1024
  if (value > 2) return 'good'
  if (value >= 1) return 'average'
  return 'bad'
}

const getAvgTxMCSConnectionQuality = (value: number | null | undefined) => {
  if (value === null || value === undefined) return null
  value = value / 1024
  if (value >= 36) return 'good'
  if (value > 11) return 'average'
  return 'bad'
}

export const getConnectionQualityFor = (
  type: 'rss' | 'snr' | 'throughput' | 'avgTxMCS',
  value: number | null | undefined) => {
  switch (type) {
    case 'rss':        return { quality: getRSSConnectionQuality(value), value }
    case 'snr':        return { quality: getSNRConnectionQuality(value), value }
    case 'throughput': return { quality: getThroughputConnectionQuality(value), value }
    case 'avgTxMCS':   return { quality: getAvgTxMCSConnectionQuality(value), value }
    default:           return null
  }
}
// export const getConnectionQualityFor = (
//   type: 'rss' | 'snr' | 'throughput' | 'avgTxMCS',
//   value: number | null | undefined) => {
//   switch (type) {
//     case 'rss':        return value
//     case 'snr':        return value
//     case 'throughput': return value
//     case 'avgTxMCS':   return value
//     default:           return null
//   }
// }


export const takeWorseQuality = (...qualities: (string | null| undefined)[]) => {
  qualities = qualities.filter(q => q !== null)
  if (qualities.length === 0) return null

  const types = ['bad', 'average', 'good']
  const others = (qualities as string[]).filter(q => !types.includes(q))
  let type
  while ((type = types.shift())) {
    if (qualities.includes(type)) return type
  }

  const sets = Array.from(new Set(qualities))
    .map(quality => ({ quality, count: others.filter(q => q === quality).length }))

  const max = maxBy(sets, 'count')

  return max && max.quality
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getQualityColor = (type: any) => {
  switch (type) {
    case 'bad': return '--acx-semantics-red-50'
    case 'good': return '--acx-semantics-green-50'
    case 'average': return '--acx-neutrals-50'
    default: return '--acx-semantics-green-50'
  }
}