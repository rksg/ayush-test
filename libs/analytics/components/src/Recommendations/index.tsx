import { useIntl } from 'react-intl'

import { useAnalyticsFilter, AnalyticsFilter } from '@acx-ui/analytics/utils'
import { GridRow, GridCol }                    from '@acx-ui/components'

import { Header }             from '../Header'
import { IncidentBySeverity } from '../IncidentBySeverity'
import { RecommendationTable }      from '../Recommendations/table'
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
      </>
      }
      <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
        <RecommendationTable filters={incidentsPageFilters} />
      </GridCol>
    </GridRow>
  )
}

export function Recommendations () {
  const { $t } = useIntl()
  const { filters } = useAnalyticsFilter()
  return (
    <>
      <Header
        title={$t({ defaultMessage: 'Recommendations' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'AI Assurance' }) },
          { text: $t({ defaultMessage: 'AI Analytics' }) }
        ]}
        shouldQuerySwitch={false}
      />
       <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
         <RecommendationTable filters={filters} /> 
      </GridCol>
      {/* <IncidentTabContent/> */}
    </>
  )
}
