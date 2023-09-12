import { useIntl } from 'react-intl'

import { useAnalyticsFilter }   from '@acx-ui/analytics/utils'
import { GridRow, GridCol }     from '@acx-ui/components'
import type { AnalyticsFilter } from '@acx-ui/utils'

import { Header }             from '../Header'
import { IncidentBySeverity } from '../IncidentBySeverity'
import { IncidentTable }      from '../IncidentTable'
import { NetworkHistory }     from '../NetworkHistory'

export const IncidentTabContent = (props: {
  filters?: AnalyticsFilter,
  disableGraphs?: boolean
}) => {
  const { filters: widgetFilters, disableGraphs } = props
  const { filters } = useAnalyticsFilter()
  const incidentsPageFilters = widgetFilters ? widgetFilters : filters
  return (
    <GridRow>
      {disableGraphs ? null : <>
        <GridCol col={{ span: 4 }} style={{ height: '210px' }}>
          <IncidentBySeverity type='bar' filters={incidentsPageFilters} />
        </GridCol>
        <GridCol col={{ span: 20 }} style={{ height: '210px' }}>
          <NetworkHistory hideTitle filters={incidentsPageFilters} type='no-border' />
        </GridCol>
      </>}
      <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
        <IncidentTable filters={incidentsPageFilters} />
      </GridCol>
    </GridRow>
  )
}

export function IncidentListPage () {
  const { $t } = useIntl()
  return (
    <>
      <Header
        title={$t({ defaultMessage: 'Incidents' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'AI Assurance' }) },
          { text: $t({ defaultMessage: 'AI Analytics' }) }
        ]}
        shouldQuerySwitch
        withIncidents
      />
      <IncidentTabContent/>
    </>
  )
}
