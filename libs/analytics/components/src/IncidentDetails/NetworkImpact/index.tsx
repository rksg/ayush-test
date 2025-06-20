import React from 'react'

import { Col, Row }                   from 'antd'
import { MessageDescriptor, useIntl } from 'react-intl'
import AutoSizer                      from 'react-virtualized-auto-sizer'

import { Incident }                                      from '@acx-ui/analytics/utils'
import { Card, DonutChart, Loader, qualitativeColorSet } from '@acx-ui/components'
import { formatter }                                     from '@acx-ui/formatter'
import { getIntl }                                       from '@acx-ui/utils'

import {
  NetworkImpactChart,
  networkImpactChartConfigs,
  getDominanceByThreshold,
  NetworkImpactChartConfig,
  DominanceSummary,
  NetworkImpactQueryTypes
} from './config'
import { NetworkImpactChartData, useNetworkImpactChartsQuery } from './services'

export interface NetworkImpactProps {
  incident: Incident
  charts: NetworkImpactChartConfig[]
}

export const transformSummary = (
  queryType: NetworkImpactQueryTypes,
  config: NetworkImpactChart,
  metric: NetworkImpactChartData,
  incident: Incident
) => {
  const { $t } = getIntl()
  const { peak, count, total, data } = metric

  if(queryType === NetworkImpactQueryTypes.Distribution) {
    return $t(config.summary as MessageDescriptor, {
      count: (config.valueFormatter || formatter('percentFormat'))(peak)
    })
  }

  const dominance = (config.dominanceFn || getDominanceByThreshold())(data, incident)
  if (dominance) {
    return $t((config.summary as DominanceSummary).dominance, {
      value: dominance.value,
      percentage: formatter('percentFormatRound')(dominance.percentage),
      dominant: config.transformKeyFn
        ? config.transformKeyFn(dominance.key)
        : dominance.key
    })
  } else {
    return $t((config.summary as DominanceSummary).broad, { count, total })
  }
}

export const transformData = (
  config: NetworkImpactChart,
  metric: NetworkImpactChartData
) => {
  const colors = (config.colorSetFn && config.colorSetFn()) || qualitativeColorSet()
  return metric.data.map((record, index) => ({
    ...record,
    name: config.transformKeyFn ? config.transformKeyFn(record.name) : record.name,
    value: config.transformValueFn ? config.transformValueFn(record.value) : record.value,
    color: colors[index]
  }))
}

export const NetworkImpact: React.FC<NetworkImpactProps> = ({ charts, incident }) => {
  const { $t } = useIntl()

  const queryResults = useNetworkImpactChartsQuery({ charts, incident })
  return <Loader states={[queryResults]}>
    <Card title={$t({ defaultMessage: 'Network Impact' })} type='no-border'>
      <Row>
        {charts.map((chart) => {
          const config = networkImpactChartConfigs[chart.chart]
          const chartData = queryResults.data?.[chart.chart]!
          return <Col key={chart.chart} span={6} style={{ height: 200 }}>
            <AutoSizer>
              {({ height, width }) => {
                let [value, subTitle]: string[] = [
                  undefined as unknown as string,
                  transformSummary(chart.query, config, chartData, incident)
                ]
                if (chart.query === NetworkImpactQueryTypes.Distribution) {
                  value = (config.valueFormatter || formatter('percentFormat'))(chartData.summary)
                } else if (chart.disabled && config.disabled) {
                  value = $t(config.disabled.value)
                  subTitle = $t(config.disabled.summary)
                } else if (Number.isFinite(chartData?.total)){
                  value = formatter('countFormat')(chartData?.total)
                }
                return <DonutChart
                  showLegend={false}
                  style={{ width, height }}
                  title={$t(config.title)}
                  showTotal={config.showTotal}
                  value={value}
                  subTitle={subTitle}
                  tooltipFormat={config.tooltipFormat}
                  dataFormatter={config.dataFomatter || formatter('countFormat')}
                  data={transformData(config, chartData)}
                />
              }}
            </AutoSizer>
          </Col>
        })}
      </Row>
    </Card>
  </Loader>
}
