import React from 'react'

import { Col, Row }           from 'antd'
import { IntlShape, useIntl } from 'react-intl'

import { Incident }                         from '@acx-ui/analytics/utils'
import { Card, cssStr, DonutChart, Loader } from '@acx-ui/components'
import { formatter }                        from '@acx-ui/utils'

import { donutCharts, getDominanceByThreshold } from './config'
import { DonutChartData, useDonutChartsQuery }  from './services'

const colors = [
  // TODO
  cssStr('--acx-semantics-red-60'),
  cssStr('--acx-semantics-yellow-40'),
  cssStr('--acx-neutrals-50'),
  cssStr('--acx-semantics-green-50')
]

interface NetworkImpactProps {
  incident: Incident,
  charts: string[]
}

export const transformSummary = (metric: DonutChartData, incident: Incident, intl: IntlShape) => {
  const config = donutCharts[metric.key]
  const { count, data } = metric
  const dominance = (config.dominanceFn || getDominanceByThreshold())(data, incident)
  if (dominance) {
    return intl.$t(config.summary.dominance, {
      percentage: Math.round(dominance.percentage * 100),
      transformedKey: config.transformKeyFn
        ? config.transformKeyFn(dominance.key, intl) : dominance.key
    })
  } else {
    return intl.$t(config.summary.broad, { count })
  }
}

export const transformData = (metric: DonutChartData, intl: IntlShape) => {
  const config = donutCharts[metric.key]
  return metric.data.map((record, index) => ({
    ...record,
    name: config.transformKeyFn ? config.transformKeyFn(record.name, intl) : record.name,
    value: config.transformValueFn ? config.transformValueFn(record.value, intl) : record.value,
    color: colors[index]
  }))
}

export const NetworkImpact: React.FC<NetworkImpactProps> = ({ charts, incident }) => {
  const intl = useIntl()
  const queryResults = useDonutChartsQuery({ charts, incident })
  return <Loader states={[queryResults]}>
    <Row>
      {Object.entries(queryResults.data || {}).map(([chart, chartData])=>{
        const config = donutCharts[chartData.key]
        return <Col key={chart} span={6} style={{ height: 200 }}>
          <Card >
            <DonutChart
              showLegend={false}
              style={{ width: '100%', height: '95%' }}
              title={intl.$t(config.title)}
              subTitle={transformSummary(chartData, incident, intl)}
              unit={config.unit}
              dataFormatter={formatter('countFormat') as () => string}
              data={transformData(chartData, intl)}
            />
          </Card>
        </Col>
      })}
    </Row>
  </Loader>
}