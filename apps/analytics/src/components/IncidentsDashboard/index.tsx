import { Row, Col, Typography, Space } from 'antd'
import { defineMessage, useIntl }      from 'react-intl'
import AutoSizer                       from 'react-virtualized-auto-sizer'

import { categoryCodeMap, IncidentFilter } from '@acx-ui/analytics/utils'
import {
  Card,
  Loader,
  StackedBarChart
} from '@acx-ui/components'

import { 
  IncidentsDashboardData,
  IncidentsBySeverityDataKey,
  IncidentByCategory,
  useIncidentsBySeverityDashboardQuery,
  useIncidentsByCategoryDashboardQuery
} from './services'
import * as UI from './styledComponents'

interface IncidentSeverityWidgetProps {
  severityKey: IncidentsBySeverityDataKey;
  incidentsCount: number;
  impactedClients: number;
}

const { Title, Paragraph, Text } = Typography

const IncidentSeverityWidget = (props: IncidentSeverityWidgetProps) => {
  const intl = useIntl()
  const { severityKey, incidentsCount, impactedClients } = props
  
  return <Col span={12}>
    <Typography>
      <Title level={1}>
        <Row>
          <Col>
            <UI.SeverityContainer>
              <UI.SeveritySpan severity={severityKey} />
            </UI.SeverityContainer>
          </Col>
          <Col>{intl.formatNumber(incidentsCount)}</Col>
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

interface IncidentSeverityStackChartsWidgetProps { 
  filters: IncidentFilter;
  style: React.CSSProperties | undefined
}

function IncidentSeverityStackChartsWidget (props: IncidentSeverityStackChartsWidgetProps) {
  const { filters, style } = props
  const intl = useIntl()
  const { connection, performance, infrastructure } = categoryCodeMap
  const connectionQueryResult = useIncidentsByCategoryDashboardQuery({
    ...filters,
    code: connection.codes
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: { ...data } as IncidentByCategory,
      ...rest
    })
  })
  const performanceQueryResult = useIncidentsByCategoryDashboardQuery({
    ...filters,
    code: performance.codes
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: { ...data } as IncidentByCategory,
      ...rest
    })
  })
  const infrastructureQueryResult = useIncidentsByCategoryDashboardQuery({
    ...filters,
    code: infrastructure.codes
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: { ...data } as IncidentByCategory,
      ...rest
    })
  })

  const connectionData = getChartData(connectionQueryResult, 'Connection')
  const performanceData = getChartData(performanceQueryResult, 'Performance')
  const infrastructureData = getChartData(infrastructureQueryResult, 'Infrastructure')
  const plotData = [connectionData, performanceData, infrastructureData]

  return <Loader 
    states={[connectionQueryResult, performanceQueryResult, infrastructureQueryResult ]}>
    <StackedBarChart 
      data={plotData}
      showLabels
      showTooltip
      style={style}
    />
  </Loader>

  function getChartData (queryResult: typeof connectionQueryResult, category: string) {
    const { data } = queryResult
    const series = Object.entries(data).map(([key, value]) => ({ name: key, value }))
    const plotData = {
      category: intl.$t(defineMessage({ defaultMessage: '{category}' }), { category }),
      series
    }
    return plotData
  }
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
            <IncidentSeverityStackChartsWidget 
              filters={filters} 
              style={{ width, height: 130 }}
            />
          </div>
        }
      </AutoSizer>
    </Card>
  </Loader>
}

export default IncidentsDashboardWidget
