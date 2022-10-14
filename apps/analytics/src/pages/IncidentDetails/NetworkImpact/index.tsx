import React from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'
import AutoSizer    from 'react-virtualized-auto-sizer'

import { Incident }                         from '@acx-ui/analytics/utils'
import { Card, cssStr, DonutChart, Loader } from '@acx-ui/components'
import { formatter, getIntl }               from '@acx-ui/utils'

import {
  NetworkImpactChart,
  networkImpactChartConfigs,
  getDominanceByThreshold,
  NetworkImpactChartConfig
} from './config'
import { NetworkImpactChartData, useNetworkImpactChartsQuery } from './services'

const colors = [
  // TODO
  cssStr('--acx-semantics-red-60'),
  cssStr('--acx-semantics-yellow-40'),
  cssStr('--acx-neutrals-50'),
  cssStr('--acx-semantics-green-50')
]

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
  const { count, data } = metric
  const dominance = (config.dominanceFn || getDominanceByThreshold())(data, incident)
  if (dominance) {
    return intl.$t(config.summary.dominance, {
      percentage: formatter('percentFormatRound')(dominance.percentage),
      dominant: config.transformKeyFn
        ? config.transformKeyFn(dominance.key, intl)
        : dominance.key
    })
  } else {
    return intl.$t(config.summary.broad, { count })
  }
}

export const transformData = (
  config: NetworkImpactChart,
  metric: NetworkImpactChartData
) => {
  const intl = getIntl()
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
      <Row style={{ flex: 1 }}>
        {charts.map(({ chart })=>{
          const config = networkImpactChartConfigs[chart]
          const chartData = queryResults.data?.[chart]!
          return <Col key={chart} span={6} style={{ height: 200 }}>
            <Card type='no-border'>
              <AutoSizer>
                {({ height, width }) => (
                  <DonutChart
                    showLegend={false}
                    style={{ width, height }}
                    title={$t(config.title)}
                    subTitle={transformSummary(config, chartData, incident)}
                    tooltipFormat={config.tooltipFormat}
                    dataFormatter={formatter('countFormat')}
                    data={transformData(config, chartData)}
                  />
                )}
              </AutoSizer>
            </Card>
          </Col>
        })}
      </Row>
    </Card>
  </Loader>
}
