import React from 'react'

import { Col, Row }           from 'antd'
import { IntlShape, useIntl } from 'react-intl'
import AutoSizer              from 'react-virtualized-auto-sizer'

import { Incident }                         from '@acx-ui/analytics/utils'
import { Card, cssStr, DonutChart, Loader } from '@acx-ui/components'
import { intlFormats }                      from '@acx-ui/utils'

import {
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
  metric: NetworkImpactChartData, incident: Incident, intl: IntlShape
) => {
  const config = Object.values(networkImpactChartConfigs)
    .find((chartConfig) => chartConfig.key === metric.key)!
  const { count, data } = metric
  const dominance = (config.dominanceFn || getDominanceByThreshold())(data, incident)
  if (dominance) {
    return intl.$t(config.summary.dominance, {
      percentage: intl
        .$t(intlFormats.percentFormatRound, { value: dominance.percentage as number }),
      dominant: config.transformKeyFn
        ? config.transformKeyFn(dominance.key, intl) : dominance.key
    })
  } else {
    return intl.$t(config.summary.broad, { count })
  }
}

export const transformData = (metric: NetworkImpactChartData, intl: IntlShape) => {
  const config = Object.values(networkImpactChartConfigs)
    .find((chartConfig) => chartConfig.key === metric.key)!
  return metric.data.map((record, index) => ({
    ...record,
    name: config.transformKeyFn ? config.transformKeyFn(record.name, intl) : record.name,
    value: config.transformValueFn ? config.transformValueFn(record.value, intl) : record.value,
    color: colors[index]
  }))
}

export const NetworkImpact: React.FC<NetworkImpactProps> = ({ charts, incident }) => {
  const intl = useIntl()

  const queryResults = useNetworkImpactChartsQuery({ charts, incident })
  return <Loader states={[queryResults]}>
    <Card title={intl.$t({ defaultMessage: 'Network Impact' })} type='no-border'>
      <Row style={{ flex: 1 }}>
        {Object.entries(queryResults.data || {}).map(([chart, chartData])=>{
          const config = Object.values(networkImpactChartConfigs)
            .find((chartConfig) => chartConfig.key === chartData.key)!
          return <Col key={chart} span={6} style={{ height: 200 }}>
            <Card type='no-border'>
              <AutoSizer>
                {({ height, width }) => (
                  <DonutChart
                    showLegend={false}
                    style={{ width, height }}
                    title={intl.$t(config.title)}
                    subTitle={transformSummary(chartData, incident, intl)}
                    tooltipFormat={config.highlight}
                    dataFormatter={(v) => intl.$t(intlFormats.countFormat, { value: v as number })}
                    data={transformData(chartData, intl)}
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
