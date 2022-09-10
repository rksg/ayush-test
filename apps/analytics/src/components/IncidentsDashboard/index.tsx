import { Row, Col, Typography, Space } from 'antd'
import { defineMessage, useIntl }      from 'react-intl'
import AutoSizer                       from 'react-virtualized-auto-sizer'

import { IncidentFilter } from '@acx-ui/analytics/utils'
import {
  Card,
  Loader,
  StackedBarChart
} from '@acx-ui/components'

import { 
  IncidentsDashboardData,
  IncidentsBySeverityDataKey,
  useIncidentsBySeverityDashboardQuery
} from './services'
import * as UI from './styledComponents'

interface IncidentSeverityWidgetProps {
  severityKey: IncidentsBySeverityDataKey;
  incidentsCount: number | undefined;
  impactedClients: number | null | undefined;
}

const { Title, Paragraph, Text } = Typography

export const IncidentSeverityWidget = (props: IncidentSeverityWidgetProps) => {
  const intl = useIntl()
  const { severityKey, incidentsCount, impactedClients } = props
  
  return <Col span={12} key={severityKey}>
    <Typography>
      <Title level={1}>
        <Row>
          <Col>
            <UI.SeverityContainer>
              <UI.SeveritySpan severity={severityKey} />
            </UI.SeverityContainer>
          </Col>
          <Col>{intl.formatNumber(incidentsCount ?? 0)}</Col>
        </Row>
      </Title>
      <Paragraph>
        <Text strong>
          {intl.$t(defineMessage({ defaultMessage: 'Incident {severityKey}' }), { severityKey })}
        </Text>
      </Paragraph>
      <Paragraph>
        {intl.$t(
          defineMessage({ defaultMessage: '{impactedClients} clients impacted' }), 
          { impactedClients: impactedClients ?? 0 })}
      </Paragraph>
    </Typography>
  </Col>
}

function IncidentsDashboardWidget ({ filters }: { filters: IncidentFilter }) {
  const { $t } = useIntl()
  const queryResult = useIncidentsBySeverityDashboardQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: { ...data } as IncidentsDashboardData,
      ...rest
    })
  })

  const {
    P1Count, P1Impact,
    P2Count, P2Impact,
    P3Count, P3Impact,
    P4Count, P4Impact
  } = queryResult.data

  const topData = [
    {
      severityKey: 'P1',
      incidentsCount: P1Count,
      impactedClients: P1Impact
    },
    {
      severityKey: 'P2',
      incidentsCount: P2Count,
      impactedClients: P2Impact
    },
    {
      severityKey: 'P3',
      incidentsCount: P3Count,
      impactedClients: P3Impact
    },
    {
      severityKey: 'P4',
      incidentsCount: P4Count,
      impactedClients: P4Impact
    }
  ]

  const { 
    connectionP1,
    connectionP2,
    connectionP3,
    connectionP4,
    performanceP1,
    performanceP2,
    performanceP3,
    performanceP4,
    infrastructureP1,
    infrastructureP2,
    infrastructureP3,
    infrastructureP4
  } = queryResult.data

  const barChartData = [
    {
      category: $t({ defaultMessage: 'Connection' }),
      series: [
        { name: 'P1', value: connectionP1 },
        { name: 'P2', value: connectionP2 },
        { name: 'P3', value: connectionP3 },
        { name: 'P4', value: connectionP4 }
      ]
    },
    {
      category: $t({ defaultMessage: 'Performance' }),
      series: [
        { name: 'P1', value: performanceP1 },
        { name: 'P2', value: performanceP2 },
        { name: 'P3', value: performanceP3 },
        { name: 'P4', value: performanceP4 }
      ]
    },
    {
      category: $t({ defaultMessage: 'Infrastructure' }),
      series: [
        { name: 'P1', value: infrastructureP1 },
        { name: 'P2', value: infrastructureP2 },
        { name: 'P3', value: infrastructureP3 },
        { name: 'P4', value: infrastructureP4 }
      ]
    }
  ]

  return <Loader states={[queryResult]}>
    <Card 
      title={$t(defineMessage({ defaultMessage: 'Incidents' }))}
    >
      <AutoSizer>
        {
          ({ width }) => <div style={{ width, height: 150 }}>
            <Row gutter={[8, 8]} justify='space-evenly' align='middle'>
              {topData.map((datum) => 
                <IncidentSeverityWidget 
                  severityKey={datum.severityKey as IncidentsBySeverityDataKey}
                  incidentsCount={datum.incidentsCount}
                  impactedClients={datum.impactedClients.impactedClientCount[0]}
                />)}
            </Row>
            <Space />
            <StackedBarChart 
              data={barChartData}
              showTooltip
              style={{ width, height: 120 }}
            />
          </div>
        }
      </AutoSizer>
    </Card>
  </Loader>
}

export default IncidentsDashboardWidget
