import { useIntl } from 'react-intl'

import {
  useAnalyticsFilter,
  categoryTabs,
  CategoryTab,
  CategoryOption,
  categoryCodeMap,
  IncidentCode,
  AnalyticsFilter
}                                                from '@acx-ui/analytics/utils'
import { GridRow, GridCol, Tabs }                from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { HeaderLegacy }       from '../Header'
import { IncidentBySeverity } from '../IncidentBySeverity'
import { IncidentTable }      from '../IncidentTable'
import { NetworkHistory }     from '../NetworkHistory'

export const IncidentTabContentLegacy = (props: {
  tabSelection?: CategoryTab,
  filters?: AnalyticsFilter,
  disableGraphs?: boolean
}) => {
  const { tabSelection, filters: widgetFilters, disableGraphs } = props
  const { filters } = useAnalyticsFilter()
  const incidentsPageFilters = widgetFilters ? widgetFilters : filters
  const incidentCodesBasedOnCategory: IncidentCode[] | undefined
    = categoryCodeMap[tabSelection as CategoryOption]?.codes as IncidentCode[]
  return (<>
    <GridRow style={{ marginBottom: 20 }}>
      {disableGraphs ? null : <>
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
      </>
      }
    </GridRow>
    <IncidentTable filters={{ ...incidentsPageFilters, code: incidentCodesBasedOnCategory }} />
  </>)
}

function IncidentListPageLegacy () {
  const { $t } = useIntl()
  const { activeTab = categoryTabs[0].value } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/incidents/tab/')

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  return (
    <>
      <HeaderLegacy
        title={$t({ defaultMessage: 'Incidents' })}
        shouldQuerySwitch
        withIncidents
        footer={
          <Tabs activeKey={activeTab} onChange={onTabChange}>
            {categoryTabs.map(({ value, label }) => (
              <Tabs.TabPane tab={$t(label)} key={value} />
            ))}
          </Tabs>
        }
      />
      <IncidentTabContentLegacy tabSelection={activeTab as CategoryTab} />
    </>
  )
}
export { IncidentListPageLegacy }
