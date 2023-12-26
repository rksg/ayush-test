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
  const { count, data } = metric
  if(queryType === NetworkImpactQueryTypes.Distribution) {
    return $t( config.summary as MessageDescriptor, { count: formatter('percentFormat')(count) })}

  const dominance = (config.dominanceFn || getDominanceByThreshold())(data, incident)
  if (dominance) {
    return $t((config.summary as DominanceSummary).dominance, {
      percentage: formatter('percentFormatRound')(dominance.percentage),
      dominant: config.transformKeyFn
        ? config.transformKeyFn(dominance.key)
        : dominance.key
    })
  } else {
    return $t((config.summary as DominanceSummary).broad, { count })
  }
}

export const transformData = (
  config: NetworkImpactChart,
  metric: NetworkImpactChartData
) => {
  const colors = qualitativeColorSet()
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
        {charts.map(({ chart, query })=>{
          const config = networkImpactChartConfigs[chart]
          const chartData = queryResults.data?.[chart]!
          return <Col key={chart} span={6} style={{ height: 200 }}>
            <AutoSizer>
              {({ height, width }) => (
                <DonutChart
                  showLegend={false}
                  style={{ width, height }}
                  title={$t(config.title)}
                  subTitle={transformSummary(query, config, chartData, incident)}
                  tooltipFormat={config.tooltipFormat}
                  dataFormatter={query === NetworkImpactQueryTypes.Distribution
                    ? formatter('percentFormat')
                    : formatter('countFormat')}
                  data={transformData(config, chartData)}
                  value={query === NetworkImpactQueryTypes.Distribution
                    ? formatter('percentFormat')(
                      chartData.data.find(({ key }) => key === chart)?.value)
                    : undefined}
                />
              )}
            </AutoSizer>
          </Col>
        })}
      </Row>
    </Card>
  </Loader>
}
