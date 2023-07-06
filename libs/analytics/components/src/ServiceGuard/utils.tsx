import moment from 'moment-timezone'

import { Tooltip }                                from '@acx-ui/components'
import { intlFormats, formatter, DateFormatEnum } from '@acx-ui/formatter'
import { getIntl, noDataDisplay }                 from '@acx-ui/utils'

import { authMethodsByCode } from './authMethods'
import { testTypes }         from './contents'
import { stage }             from './stages'
import {
  ServiceGuardSpec,
  ServiceGuardConfig,
  ServiceGuardTest,
  TestType
} from './types'

export interface StatsFromSummary {
  isOngoing: boolean
  apsUnderTest?: number
  apsFinishedTest?: number
  lastResult?: number
}

export const stagesFromConfig = (config: ServiceGuardConfig) => {
  if (!config.authenticationMethod) { return [] }
  const stages = [...authMethodsByCode[config.authenticationMethod].stages, stage('dns')]
  if (config.pingAddress) { stages.push(stage('ping')) }
  if (config.tracerouteAddress) { stages.push(stage('traceroute')) }
  if (config.speedTestEnabled) { stages.push(stage('speedTest')) }
  return stages.map((item) => ({ ...item }))
}

export const statsFromSummary = (summary: ServiceGuardTest['summary'] | undefined) => {
  if (!summary) return {
    isOngoing: false,
    apsUnderTest: undefined,
    apsFinishedTest: undefined,
    lastResult: undefined
  } as StatsFromSummary
  const { apsTestedCount: apsUnderTest, apsPendingCount, apsSuccessCount } = summary
  const isOngoing = apsPendingCount !== undefined && apsPendingCount > 0
  const apsFinishedTest = apsUnderTest ? apsUnderTest - apsPendingCount: undefined
  const lastResult = apsUnderTest ? apsSuccessCount / apsUnderTest : undefined
  return { isOngoing, apsUnderTest, apsFinishedTest, lastResult } as StatsFromSummary
}

export const formatApsUnderTest = (summary: ServiceGuardTest['summary'] | undefined) => {
  const stats = statsFromSummary(summary)
  const { $t } = getIntl()
  if (stats.isOngoing) return $t(
    { defaultMessage:
      '{apsFinishedTest} of {apsUnderTest} {apsUnderTest, plural, one {AP} other {APs}} tested' },
    { apsFinishedTest: stats.apsFinishedTest, apsUnderTest: stats.apsUnderTest }
  )
  if (stats.apsUnderTest) return `${stats.apsUnderTest}`
  return noDataDisplay
}

export const formatLastResult = (summary: ServiceGuardTest['summary'] | undefined) => {
  const stats = statsFromSummary(summary)
  const { $t } = getIntl()
  if (stats.isOngoing) return $t({ defaultMessage: 'In progress...' })
  if (stats.lastResult !== undefined) return $t(
    { defaultMessage: '{lastResultPercent} pass' },
    { lastResultPercent: $t(intlFormats.percentFormat, { value: stats.lastResult }) }
  )
  return noDataDisplay
}

export const formatTestType = (value: TestType, schedule: ServiceGuardSpec['schedule']) => {
  const { $t } = getIntl()
  const testType = $t(testTypes[value])
  if (value === TestType.OnDemand) return testType
  return <Tooltip title={formatter(DateFormatEnum.DateTimeFormat)(schedule?.nextExecutionTime)}>{$t(
    {
      defaultMessage: '{testType} ({scheduledIn})',
      description: 'Test Type: "Scheduled" or "On-Demand", in brackets: when it is next scheduled'
    },
    { testType, scheduledIn: moment(schedule?.nextExecutionTime).fromNow() }
  )}</Tooltip>
}
