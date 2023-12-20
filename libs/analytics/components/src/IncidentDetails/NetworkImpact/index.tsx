import React from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'
import AutoSizer    from 'react-virtualized-auto-sizer'

import { Incident }                                      from '@acx-ui/analytics/utils'
import { Card, DonutChart, Loader, qualitativeColorSet } from '@acx-ui/components'
import { formatter }                                     from '@acx-ui/formatter'
import { getIntl }                                       from '@acx-ui/utils'

import {
  NetworkImpactChart,
  networkImpactChartConfigs,
  getDominanceByThreshold,
  NetworkImpactChartConfig
} from './config'
import { NetworkImpactChartData, useNetworkImpactChartsQuery } from './services'

export interface NetworkImpactProps {
  incident: Incident
  charts: NetworkImpactChartConfig[]
}

export const transformSummary = (
  config: NetworkImpactChart,
  metric: NetworkImpactChartData,
  incident: Incident
) => {
  const intl = getIntl()
  const { count, total, data } = metric
  const dominance = (config.dominanceFn || getDominanceByThreshold())(data, incident)
  if (dominance) {
    return intl.$t(config.summary.dominance, {
      value: dominance.value,
      percentage: formatter('percentFormatRound')(dominance.percentage),
      dominant: config.transformKeyFn
        ? config.transformKeyFn(dominance.key, intl)
        : dominance.key
    })
  } else {
    return intl.$t(config.summary.broad, { count, total })
  }
}

export const transformData = (
  config: NetworkImpactChart,
  metric: NetworkImpactChartData
) => {
  const intl = getIntl()
  const colors = qualitativeColorSet()
  return metric.data.map((record, index) => ({
    ...record,
    name: config.transformKeyFn ? config.transformKeyFn(record.name, intl) : record.name,
    value: config.transformValueFn ? config.transformValueFn(record.value, intl) : record.value,
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
              {({ height, width }) => (
                <DonutChart
                  showLegend={false}
                  style={{ width, height }}
                  title={$t(config.title)}
                  value={chart.disabled && config.disabled
                    ? $t(config.disabled.value)
                    : Number.isFinite(chartData?.total)
                      ? formatter('countFormat')(chartData?.total)
                      : undefined}
                  subTitle={chart.disabled && config.disabled
                    ? $t(config.disabled.summary)
                    : transformSummary(config, chartData, incident)}
                  tooltipFormat={config.tooltipFormat}
                  dataFormatter={formatter('countFormat')}
                  data={transformData(config, chartData)}
                />
              )}
            </AutoSizer>
          </Col>
        })}
      </Row>
    </Card>
  </Loader>
}
