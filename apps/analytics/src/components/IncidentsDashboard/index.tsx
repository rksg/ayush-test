import { Row, Col, Typography }   from 'antd'
import { defineMessage, useIntl } from 'react-intl'
import AutoSizer                  from 'react-virtualized-auto-sizer'

import { IncidentFilter, incidentInformation } from '@acx-ui/analytics/utils'
import {
  Card,
  Loader,
  StackedBarChart,
  NoData
} from '@acx-ui/components'
import { useTenantLink, useNavigate } from '@acx-ui/react-router-dom'

import { IncidentsBySeverityData, useIncidentsBySeverityDashboardQuery } from './services'
import * as UI                                                           from './styledComponents'

interface IncidentSeverityWidgetProps {
  incidents: IncidentsBySeverityData[keyof IncidentsBySeverityData];
  severityKey: keyof IncidentsBySeverityData;
}

const { Title, Paragraph, Text } = Typography

const IncidentSeverityWidget = (props: IncidentSeverityWidgetProps) => {
  // account for i8tn
  const intl = useIntl()
  const { incidents, severityKey } = props
  const incidentsCount = intl.formatNumber(incidents.length)
  const impactedClients = intl.formatNumber((incidents
    .map(incidents => incidents.impactedClientCount)
    .filter((count) => count && count > 1) as number[])
    .reduce((prev: number, curr: number) => prev + curr, 0))
  
  return <Col span={12}>
    <Typography>
      <Title level={2}>
        <Row>
          <Col>
            <UI.SeverityContainer>
              <UI.SeveritySpan severity={severityKey} />
            </UI.SeverityContainer>
          </Col>
          <Col>{incidentsCount}</Col>
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
          { impactedClients })}
      </Paragraph>
    </Typography>
  </Col>
}

const IncidentSeverityStackCharts = (props: IncidentsBySeverityData) => {
  const intl = useIntl()
  const incidents = Object.entries(props).map((val) => val[1].map(
    (incident) => {
      const category = incidentInformation[incident.code].category
      return { ...incident, label: val[0], category: intl.$t(category) }
    }
  )).flat()
  const categories = Array.from(new Set(incidents.map(incidents => incidents.category))).sort()
  const chartData = categories.map(category => dataHelper(category, incidents))

  return <StackedBarChart 
    data={chartData}
    showLabels
    style={{ height: 140, width: 200 }}
  />

  function dataHelper (targetCategory: string, dataIncidents: typeof incidents) {
    const countData = dataIncidents
      .filter(incident => incident.category === targetCategory)
      .reduce((prev, curr) => ({
        ...prev,
        [curr.label]: prev[curr.label as keyof IncidentsBySeverityData] + 1
      }),
        {
          P1: 0,
          P2: 0,
          P3: 0,
          P4: 0
        } as Record<keyof IncidentsBySeverityData, number>)
    
    const series = Object.entries(countData).map(val => ({ name: val[0], value: val[1] }))
    return {
      category: targetCategory,
      series
    }
  }
}


function IncidentsDashboardWidget ({ filters }: { filters: IncidentFilter }) {
  const basePath = useTenantLink('/analytics/incidents')
  const navigator = useNavigate()
  const { startDate, endDate } = filters
  const { $t } = useIntl()
  const queryResult = useIncidentsBySeverityDashboardQuery({
    ...filters,
    startDate,
    endDate
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: { ...data } as IncidentsBySeverityData,
      ...rest
    })
  })

  const expandCallback = () => navigator(basePath.pathname)

  return <Loader states={[queryResult]}>
    <Card 
      title={$t(defineMessage({ defaultMessage: 'Incidents' }))}
      onExpandClick={expandCallback}
    >
      <AutoSizer>
        {
          ({ width }) => <div style={{ width, height: 150 }}>
            <Row gutter={[16, 16]}>
              {
                Object.entries(queryResult.data).map((datum) =>
                  <IncidentSeverityWidget 
                    severityKey={datum[0] as keyof IncidentsBySeverityData} 
                    incidents={datum[1]}
                  />
                ) ?? <NoData />
              }
            </Row>
            <IncidentSeverityStackCharts 
              {...queryResult.data}
            />
          </div>
        }
      </AutoSizer>
    </Card>
  </Loader>
}

export default IncidentsDashboardWidget