import React from 'react'

import _ from 'lodash'

import { GridRow } from '@acx-ui/components'

import { NetworkHealthTest } from '../../../types'

import { Score }  from './Score'
import { Status } from './Status'

export enum ConfigStatusEnum {
  Configured = 'configured',
  NoData = 'no-data',
  NA = 'na'
}

export const getExecutionSectionData = (data: NetworkHealthTest) => {
  const isEmptyTest = _.get(data, ['summary', 'apsTestedCount']) === 0
  const {
    config: { pingAddress, speedTestEnabled }, summary, previousTest
  } = data || { config: {}, summary: {} }
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

export const ExecutionSection: React.FC<{ details: NetworkHealthTest }> = props => {
  const { details } = getExecutionSectionData(props.details)
  return <div>
    <GridRow>
      <Status details={details} />
      <Score details={details} />
      <div style={{ border: 'gray 1px solid', width: '100%', height: '400px' }}>Chart</div>
    </GridRow>
  </div>
}
