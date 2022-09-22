import { Row, Col, Typography, Space } from 'antd'
import { defineMessage, useIntl }      from 'react-intl'
import AutoSizer                       from 'react-virtualized-auto-sizer'

import { IncidentFilter }                from '@acx-ui/analytics/utils'
import { Card, Loader, StackedBarChart } from '@acx-ui/components'
import { intlFormats }                   from '@acx-ui/utils'

import {
  IncidentsBySeverityDataKey,
  useIncidentsBySeverityDashboardQuery,
  ImpactedCount
} from './services'
import * as UI from './styledComponents'

const { countFormat } = intlFormats

interface IncidentSeverityWidgetProps {
  severityKey: IncidentsBySeverityDataKey;
  incidentsCount?: number;
  impactedClients?: number | null;
}

const { Title, Paragraph, Text } = Typography

export const IncidentSeverityWidget = (props: IncidentSeverityWidgetProps) => {
  const { $t } = useIntl()
  const { severityKey, incidentsCount, impactedClients } = props
  return <Col span={12} key={severityKey} push={1}>
    <Typography>
      <Title level={1}>
        <Row>
          <Col>
            <UI.SeverityContainer>
              <UI.SeveritySpan severity={severityKey} />
            </UI.SeverityContainer>
          </Col>
          <Col>{$t(countFormat, { value: incidentsCount ?? 0 })}</Col>
        </Row>
      </Title>
      <Paragraph>
        <Text strong>
          {$t(defineMessage({ defaultMessage: 'Incident {severityKey}' }), { severityKey })}
        </Text>
      </Paragraph>
      <UI.ClientImpactParagraph>
        {$t(
          defineMessage({ defaultMessage: '{impactedClients} clients impacted' }),
          { impactedClients: $t(countFormat, { value: impactedClients ?? 0 }) })}
      </UI.ClientImpactParagraph>
    </Typography>
  </Col>
}
type Header = {
  severityKey: string
  incidentsCount: number
  impactedClients: ImpactedCount
}
type Series = Array<{ name: string, value: number }>
function IncidentsDashboardWidget ({ filters }: { filters: IncidentFilter }) {
  const { $t } = useIntl()
  const response = useIncidentsBySeverityDashboardQuery(filters)
  const { data: severities } = response
  const headers: Header[] = []
  const barCharts = [
    { category: $t({ defaultMessage: 'Infrastructure' }), series: [] as Series },
    { category: $t({ defaultMessage: 'Performance' }), series: [] as Series },
    { category: $t({ defaultMessage: 'Connection' }), series: [] as Series }
  ]
  severities && Object.entries(severities).forEach(([severity, data]) => {
    headers.push({ severityKey: severity, ...data })
    const categories = [data.infrastructure, data.performance, data.connection]
    categories.forEach((value, index) => {
      barCharts[index].series.push({ name: severity, value })
    })
  })
  return <Loader states={[response]}>
    <Card title={$t(defineMessage({ defaultMessage: 'Incidents' }))}>
      <AutoSizer>
        {({ width }: { width: number }) =>
          <div style={{ width, height: 150 }}>
            <Row gutter={[8, 8]} justify='space-evenly' align='middle'>
              {headers.map((datum, index) =>
                <IncidentSeverityWidget
                  key={index}
                  severityKey={datum.severityKey as IncidentsBySeverityDataKey}
                  incidentsCount={datum.incidentsCount}
                  impactedClients={datum.impactedClients.impactedClientCount[0]}
                />)}
            </Row>
            <Space />
            <StackedBarChart
              data={barCharts}
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
