import React from 'react'

import { Statistic }                                            from 'antd'
import _                                                        from 'lodash'
import { IntlShape, MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { noDataSymbol }                         from '@acx-ui/analytics/utils'
import { GridCol, GridRow, TrendPill, Tooltip } from '@acx-ui/components'
import { formatter }                            from '@acx-ui/utils'

import { NetworkHealthTestResult } from '../../services'

enum ConfigStatusEnum {
  Configured = 'configured',
  NoData = 'no-data',
  NA = 'na'
}

enum BadgeStatusEnum {
  Positive = 'positive',
  Negative = 'negative'
}

const getExecutionSectionData = (data: NetworkHealthTestResult) => {
  const isEmptyTest = _.get(data, ['summary', 'apsTestedCount']) === 0
  const { config: { pingAddress, speedTestEnabled }, summary, previousTest } = data
  const previousSummary = (previousTest && previousTest.summary) || {}

  const details = {
    configured: {
      passedApsPercent: isEmptyTest ? ConfigStatusEnum.NoData : ConfigStatusEnum.Configured,
      avgPingTime: isEmptyTest
        ? ConfigStatusEnum.NoData
        : pingAddress ? ConfigStatusEnum.Configured : ConfigStatusEnum.NA,
      avgUpload: isEmptyTest
        ? ConfigStatusEnum.NoData
        : speedTestEnabled ? ConfigStatusEnum.Configured : ConfigStatusEnum.NA,
      avgDownload: isEmptyTest
        ? ConfigStatusEnum.NoData
        : speedTestEnabled ? ConfigStatusEnum.Configured : ConfigStatusEnum.NA,
      testedAps: isEmptyTest ? ConfigStatusEnum.NoData : ConfigStatusEnum.Configured,
      successAps: isEmptyTest ? ConfigStatusEnum.NoData : ConfigStatusEnum.Configured,
      failureAps: isEmptyTest ? ConfigStatusEnum.NoData : ConfigStatusEnum.Configured,
      errorAps: isEmptyTest ? ConfigStatusEnum.NoData : ConfigStatusEnum.Configured
    },
    passedApsPercent: [
      (previousSummary.apsSuccessCount as number) / (previousSummary.apsTestedCount as number),
      (summary.apsSuccessCount as number) / (summary.apsTestedCount as number)
    ],
    avgPingTime: [previousSummary.avgPingTime, summary.avgPingTime],
    avgUpload: [previousSummary.avgUpload, summary.avgUpload],
    avgDownload: [previousSummary.avgDownload, summary.avgDownload],
    testedAps: summary.apsTestedCount,
    successAps: summary.apsSuccessCount,
    failureAps: summary.apsFailureCount,
    errorAps: summary.apsErrorCount,
    chart: summary.chart
  }
  return { details }
}

interface StatusColumn {
  title: MessageDescriptor,
  format: (value: number, state: ConfigStatusEnum, $t: IntlShape['$t']) => string
  diff: (current: number, previous: number) => number|null
  badgeColor: (value: number) => BadgeStatusEnum
}

export const statusColumns: Record<string, StatusColumn> = {
  passedApsPercent: {
    title: defineMessage({ defaultMessage: 'Test Result' }),
    format: (value: number, state: ConfigStatusEnum) => state === ConfigStatusEnum.NoData
      ? noDataSymbol
      : formatter('percentFormat')(Math.abs(value || 0)),
    diff: (current, previous) => current - previous,
    badgeColor: value => (value > 0) ? BadgeStatusEnum.Positive : BadgeStatusEnum.Negative
  },
  avgPingTime: {
    title: defineMessage({ defaultMessage: 'Average Ping Time' }),
    format: (value: number, state: ConfigStatusEnum, $t: IntlShape['$t']) =>
      state === ConfigStatusEnum.Configured
        ? (value ? formatter('durationFormat')(Math.abs(value)) : noDataSymbol)
        : state === ConfigStatusEnum.NA ? $t({ defaultMessage: 'N/A' }) : noDataSymbol,
    diff: (current, previous) => (current !== 0 && previous !== 0) ? current - previous : null,
    badgeColor: value => (value > 0) ? BadgeStatusEnum.Negative : BadgeStatusEnum.Positive
  },
  avgUpload: {
    title: defineMessage({ defaultMessage: 'Average Upload' }),
    format: (value: number, state: ConfigStatusEnum, $t: IntlShape['$t']) =>
      state === ConfigStatusEnum.Configured
        ? (value ? formatter('networkSpeedFormat')(Math.abs(value)) : noDataSymbol)
        : state === ConfigStatusEnum.NA ? $t({ defaultMessage: 'N/A' }) : noDataSymbol,
    diff: (current, previous) => (current !== 0 && previous !== 0) ? current - previous : null,
    badgeColor: value => (value > 0) ? BadgeStatusEnum.Positive : BadgeStatusEnum.Negative
  },
  avgDownload: {
    title: defineMessage({ defaultMessage: 'Average Download' }),
    format: (value: number, state: ConfigStatusEnum, $t: IntlShape['$t']) =>
      state === ConfigStatusEnum.Configured
        ? (value ? formatter('networkSpeedFormat')(Math.abs(value)) : noDataSymbol)
        : state === ConfigStatusEnum.NA ? $t({ defaultMessage: 'N/A' }) : noDataSymbol,
    diff: (current, previous) => (current !== 0 && previous !== 0) ? current - previous : null,
    badgeColor: value => (value > 0) ? BadgeStatusEnum.Positive : BadgeStatusEnum.Negative
  }
}

const Status = ( { details }: ReturnType<typeof getExecutionSectionData>) => {
  const { $t } = useIntl()
  return <> {
    Object.keys(statusColumns).map(key => {
      const item = _.get(statusColumns, key)
      const [ previous, current ] = _.get(details, key)
      const configured = _.get(details, ['configured', key])
      const diff = item.diff(current, previous) as number
      return <GridCol key={`grid-col-${key}`} col={{ span: 6 }}>
        <Statistic
          title={$t(item.title)}
          value={item.format(current, configured as ConfigStatusEnum, $t)}
          suffix={true
            ? <Tooltip title={$t({ defaultMessage: 'Compared to previous test' })}>
              <TrendPill
                value={
                  `${(diff > 0) ? '+' : '-'}${item.format(diff, ConfigStatusEnum.Configured, $t)}`}
                trend={item.badgeColor(diff)} />
            </Tooltip>
            : null}
        />
      </GridCol>
    })
  } </>
}

const Scores = ( { details }: ReturnType<typeof getExecutionSectionData>) => {
  const { $t } = useIntl()
  console.log(details)
  return <div style={{ border: 'gray 1px solid', width: '100%' }}>Total Score:</div>
}


export const ExecutionSection: React.FC<{ details: NetworkHealthTestResult }> = props => {
  const { details } = getExecutionSectionData(props.details)
  return <>
    <GridRow>
      <Status details={details} />
    </GridRow>
    <GridRow>
      <Scores details={details} />
    </GridRow>
    <GridRow>
      <div style={{ border: 'gray 1px solid', width: '100%', height: '400px' }}>Chart</div>
    </GridRow>
  </>
}