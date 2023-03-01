import { noDataSymbol }         from '@acx-ui/analytics/utils'
import { intlFormats, getIntl } from '@acx-ui/utils'

import { NetworkHealthTest } from './types'

export interface StatsFromSummary {
  isOngoing: boolean
  apsUnderTest?: number
  apsFinishedTest?: number
  lastResult?: number
}

export const statsFromSummary = (summary: NetworkHealthTest['summary'] | undefined) => {
  if (!summary) return {
    isOngoing: false,
    apsUnderTest: undefined,
    apsFinishedTest: undefined,
    lastResult: undefined
  } as StatsFromSummary
  const { apsTestedCount: apsUnderTest, apsPendingCount, apsSuccessCount } = summary
  const isOngoing = apsPendingCount > 0
  const apsFinishedTest = apsUnderTest - apsPendingCount
  const lastResult = apsSuccessCount / apsUnderTest
  return { isOngoing, apsUnderTest, apsFinishedTest, lastResult } as StatsFromSummary
}

export const formatApsUnderTest = (summary: NetworkHealthTest['summary'] | undefined) => {
  const stats = statsFromSummary(summary)
  const { $t } = getIntl()
  if (stats.isOngoing) return $t(
    { defaultMessage:
      '{apsFinishedTest} of {apsUnderTest} {apsUnderTest, plural, one {AP} other {APs}} tested' },
    { apsFinishedTest: stats.apsFinishedTest, apsUnderTest: stats.apsUnderTest }
  )
  if (stats.apsUnderTest) return `${stats.apsUnderTest}`
  return noDataSymbol
}

export const formatLastResult = (summary: NetworkHealthTest['summary'] | undefined) => {
  const stats = statsFromSummary(summary)
  const { $t } = getIntl()
  if (stats.isOngoing) return $t({ defaultMessage: 'In progress...' })
  if (stats.lastResult !== undefined) return $t(
    { defaultMessage: '{lastResultPercent} pass' },
    { lastResultPercent: $t(intlFormats.percentFormat, { value: stats.lastResult }) }
  )
  return noDataSymbol
}
