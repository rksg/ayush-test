import React from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { Incident }                         from '@acx-ui/analytics/utils'
import { Card, cssStr, DonutChart, Loader } from '@acx-ui/components'
import { formatter }                        from '@acx-ui/utils'


import { useDonutChartsQuery } from './services'

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

export const NetworkImpact: React.FC<NetworkImpactProps> = (props) => {
  const { $t } = useIntl()
  const queryResults = useDonutChartsQuery(props)
  return <Loader states={[queryResults]}>
    <Row>
      {Object.entries(queryResults.data || {}).map(([chart, chartData])=>{
        return <Col key={chart} span={6} style={{ height: 200 }}>
          <Card >
            <DonutChart
              showLegend={false}
              style={{ width: '100%', height: '95%' }}
              title={$t(chartData.title)}
              subTitle={$t(chartData.summary.defaultMessage, chartData.summary.values)}
              unit={chartData.unit}
              dataFormatter={formatter('countFormat') as () => string}
              data={chartData.data.map((record, index) => ({ ...record, color: colors[index] }))}
            />
          </Card>
        </Col>
      })}
    </Row>
  </Loader>
}