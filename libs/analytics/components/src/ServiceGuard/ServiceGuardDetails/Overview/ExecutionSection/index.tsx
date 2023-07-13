import React from 'react'

import { get, zip }          from 'lodash'
import { MessageDescriptor } from 'react-intl'
import AutoSizer             from 'react-virtualized-auto-sizer'

import {
  GridCol,
  GridRow,
  NoData,
  VerticalStackedBarChart,
  VerticalStackedBarChartData,
  cssStr
} from '@acx-ui/components'
import { formatter } from '@acx-ui/formatter'
import { getIntl }   from '@acx-ui/utils'

import { ServiceGuardTest, TestStage } from '../../../types'
import { stagesFromConfig }            from '../../../utils'

import { Score }  from './Score'
import { Status } from './Status'

export enum ConfigStatusEnum {
  Configured = 'configured',
  NoData = 'no-data',
  NA = 'na'
}

const stageFields = (stage: TestStage) => [
  `${stage}NA`,
  `${stage}Error`,
  `${stage}Failure`,
  `${stage}Success`,
  `${stage}Pending`
]

export const getChatData = (data: ServiceGuardTest) => {
  const { $t } = getIntl()
  const stages = stagesFromConfig(data.config).map(s => [s.key, s.title])
  const [categories, nas, errors, failures, successes, pendings] = zip(...stages
    .map(([stage, label]) => [
      $t(label as MessageDescriptor), ...stageFields(stage as TestStage).map(f => data.summary[f])
    ]))
  return {
    categories: categories as string[],
    data: [
      { name: 'Pass', data: successes, color: cssStr('--acx-semantics-green-50') },
      { name: 'Fail', data: failures, color: cssStr('--acx-semantics-red-50') },
      { name: 'Error', data: errors, color: cssStr('--acx-semantics-yellow-40') },
      { name: 'N/A', data: nas, color: cssStr('--acx-neutrals-50') }
    ].concat(pendings.every(v => v === 0)
      ? []
      : [{ name: 'Pending', data: pendings, color: cssStr('--acx-primary-white') }]
    ) as VerticalStackedBarChartData[]
  }
}

export const getExecutionSectionData = (data: ServiceGuardTest) => {
  const isEmptyTest = get(data, ['summary', 'apsTestedCount']) === 0
  const {
    config: { pingAddress, speedTestEnabled }, summary, previousTest
  } = data || { config: {}, summary: {} }
  const previousSummary = (previousTest && previousTest.summary) || {}

  return {
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
    errorAps: summary.apsErrorCount
  }
}

export const ExecutionSection: React.FC<{ details: ServiceGuardTest }> = props => {
  const details = getExecutionSectionData(props.details)
  const chart = getChatData(props.details)
  return <GridRow>
    <Status details={details} />
    <Score details={details} />
    <GridCol col={{ span: 24 }} style={{ height: '390px' }}>
      <AutoSizer>
        {({ height, width }) => ((details.testedAps !==0)
          ? <VerticalStackedBarChart
            key={props.details.id}
            style={{ width, height }}
            data={chart.data}
            categories={chart.categories}
            yAxisLabelFormatter={(value)=>
              formatter('percentFormatRound')(value/props.details.summary.apsTestedCount)}/>
          : <NoData/>
        )}
      </AutoSizer>
    </GridCol>
  </GridRow>
}
