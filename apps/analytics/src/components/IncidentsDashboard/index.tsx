import { defineMessage, useIntl } from 'react-intl'
import AutoSizer                  from 'react-virtualized-auto-sizer'

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

type Header = {
  severityKey: string
  incidentsCount: number
  impactedClients: ImpactedCount
}
type Series = Array<{ name: string, value: number }>
const IncidentSeverityWidget = ({ data }: { data: Header }) => {
  const { $t } = useIntl()
  const { severityKey, incidentsCount, impactedClients: { impactedClientCount } } = data
  return <UI.SeverityContainer key={severityKey}>
    <div>
      <UI.SeverityDot severity={severityKey as IncidentsBySeverityDataKey} />
    </div>
    <div>
      <UI.Count>{$t(countFormat, { value: incidentsCount || 0 })}</UI.Count>
      <UI.Title level={5}>
        {$t(defineMessage({ defaultMessage: 'Incident {severityKey}' }), { severityKey })}
      </UI.Title>
      <UI.Impact>
        {$t(
          defineMessage({ defaultMessage: '{impactedClients} clients impacted' }),
          { impactedClients: $t(countFormat, { value: impactedClientCount[0] || 0 }) }
        )}
      </UI.Impact>
    </div>
  </UI.SeverityContainer>
}
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
        {({ width, height }) => <UI.Container style={{ width, height }}>
          <UI.SeveritiesContainer>
            {headers.map((datum, index) => <IncidentSeverityWidget key={index} data={datum} />)}
          </UI.SeveritiesContainer>
          <StackedBarChart data={barCharts} showTooltip style={{ height: 100 }} />
        </UI.Container>}
      </AutoSizer>
    </Card>
  </Loader>
}

export default IncidentsDashboardWidget
