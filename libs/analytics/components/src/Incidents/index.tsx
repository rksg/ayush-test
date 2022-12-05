import { useIntl, defineMessage, MessageDescriptor } from 'react-intl'

import { useAnalyticsFilter }                           from '@acx-ui/analytics/utils'
import { categoryNames, categoryCodeMap, IncidentCode } from '@acx-ui/analytics/utils'
import { AnalyticsFilter }                              from '@acx-ui/analytics/utils'
import { GridRow, GridCol, Tabs }                       from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink }        from '@acx-ui/react-router-dom'

import { Header }             from '../Header'
import { IncidentBySeverity } from '../IncidentBySeverity'
import { IncidentTable }      from '../IncidentTable'
import { NetworkHistory }     from '../NetworkHistory'

const incidentTabs = [{ text: 'Overview', value: 'overview' }, ...categoryNames]
type IncidentListTabs = 'overview' | 'connection' | 'performance' | 'infrastructure'

const tabsMap : Record<IncidentListTabs, MessageDescriptor> = {
  connection: defineMessage({
    defaultMessage: 'Connection'
  }),
  overview: defineMessage({
    defaultMessage: 'Overview'
  }),
  performance: defineMessage({
    defaultMessage: 'Performance'
  }),
  infrastructure: defineMessage({
    defaultMessage: 'Infrastructure'
  })
}

export const IncidentTabContent = (props: { tabSelection?: IncidentListTabs,
  filters? : AnalyticsFilter }) => {
  const { tabSelection,filters: widgetFilters } = props
  const { filters } = useAnalyticsFilter()
  const incidentsPageFilters = widgetFilters ? widgetFilters : filters
  const incidentCodesBasedOnCategory: IncidentCode[] | undefined = categoryCodeMap[
    tabSelection as Exclude<IncidentListTabs, 'overview'>
  ]?.codes as IncidentCode[]

  return (
    <GridRow>
      <GridCol col={{ span: 4 }} style={{ height: '210px' }}>
        <IncidentBySeverity
          type='bar'
          filters={{ ...incidentsPageFilters, code: incidentCodesBasedOnCategory }}
        />
      </GridCol>
      <GridCol col={{ span: 20 }} style={{ height: '210px' }}>
        <NetworkHistory
          hideTitle
          filters={{ ...incidentsPageFilters, code: incidentCodesBasedOnCategory }}
          type='no-border'
        />
      </GridCol>
      <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
        <IncidentTable filters={{ ...incidentsPageFilters, code: incidentCodesBasedOnCategory }} />
      </GridCol>
    </GridRow>
  )
}

function IncidentListPage () {
  const { $t } = useIntl()
  const { activeTab = incidentTabs[0].value } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/incidents/tab/')

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  return (
    <>
      <Header
        title={$t({ defaultMessage: 'Incidents' })}
        shouldQuerySwitch
        withIncidents
        footer={<Tabs activeKey={activeTab} onChange={onTabChange}>
          {incidentTabs.map((tabInfo) => (
            <Tabs.TabPane
              tab={$t(tabsMap[tabInfo.value as IncidentListTabs])}
              key={tabInfo.value} />
          ))}
        </Tabs>} />
      <IncidentTabContent tabSelection={activeTab as IncidentListTabs} /></>
  )
}
export { IncidentListPage }
