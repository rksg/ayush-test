import { IntlShape } from 'react-intl'

import { noDataSymbol } from '@acx-ui/analytics/utils'
import { intlFormats }  from '@acx-ui/utils'

import { authMethodsByCode }                      from './authMethods'
import { stage }                                  from './stages'
import { NetworkHealthConfig, NetworkHealthTest } from './types'

export const stagesFromConfig = (config: NetworkHealthConfig) => {
  if (!config.authenticationMethod) { return [] }
  const stages = [...authMethodsByCode[config.authenticationMethod].stages, stage('dns')]
  if (config.pingAddress) { stages.push(stage('ping')) }
  if (config.tracerouteAddress) { stages.push(stage('traceroute')) }
  if (config.speedTestEnabled) { stages.push(stage('speedTest')) }
  return stages.map((item) => ({ ...item }))
}

export interface StatsFromSummary extends NetworkHealthTest {
  isOngoing?: boolean
  apsUnderTest?: number
  apsFinishedTest?: number
  lastResult?: number
}

export const statsFromSummary = (
  summary: NetworkHealthTest['summary']
) => {
  const { apsTestedCount: apsUnderTest, apsPendingCount, apsSuccessCount }
    = summary
  const isOngoing = apsPendingCount !== undefined && apsPendingCount > 0
  const apsFinishedTest = apsUnderTest
    ? apsUnderTest - apsPendingCount
    : undefined
  const lastResult = apsUnderTest
    ? apsSuccessCount / apsUnderTest
    : undefined
  return { isOngoing, apsFinishedTest, lastResult, apsUnderTest }
}

export const formatApsUnderTest = (
  details: StatsFromSummary, $t: IntlShape['$t']
) => details.isOngoing
  ? $t(
    { defaultMessage:
      '{apsFinishedTest} of {apsUnderTest} {apsUnderTest, plural, one {AP} other {APs}} tested' },
    { apsFinishedTest: details.apsFinishedTest, apsUnderTest: details.apsUnderTest })
  : details.apsUnderTest
    ? $t({ defaultMessage: '{apsUnderTest} APs' }, { apsUnderTest: details.apsUnderTest })
    : noDataSymbol

export const formatLastResult = (
  details: StatsFromSummary, $t: IntlShape['$t']
) => details.isOngoing
  ? $t({ defaultMessage: 'In progress...' })
  : details.lastResult !== undefined
    ? $t({ defaultMessage: '{lastResultPercent} pass' }, {
      lastResultPercent: $t(intlFormats.percentFormat, { value: details.lastResult })
    })
    : noDataSymbol
