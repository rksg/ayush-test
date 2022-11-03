import { useIntl, defineMessage, MessageDescriptor } from 'react-intl'

import { AnalyticsFilter, useAnalyticsFilter, categoryNames } from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Tabs }                             from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink }              from '@acx-ui/react-router-dom'

import Header from '../../components/Header'

import ConnectedClientsOverTime      from './ConnectedClientsOverTime'
import { HealthPageContextProvider } from './HealthPageContext'
import Kpis                          from './Kpi'
import * as UI                       from './styledComponents'
import { SummaryBoxes }              from './SummaryBoxes'

const healthTabs = [{ text: 'Overview', value: 'overview' }, ...categoryNames]
export type HealthTab = 'overview' | 'connection' | 'performance' | 'infrastructure'

const tabsMap : Record<HealthTab, MessageDescriptor> = {
  overview: defineMessage({
    defaultMessage: 'Overview'
  }),
  connection: defineMessage({
    defaultMessage: 'Connection'
  }),
  performance: defineMessage({
    defaultMessage: 'Performance'
  }),
  infrastructure: defineMessage({
    defaultMessage: 'Infrastructure'
  })
}



const HealthPage = (props: { filters? : AnalyticsFilter }) => {
  const { $t } = useIntl()
  const { filters: widgetFilters } = props
  const { activeTab = healthTabs[0].value } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(
    widgetFilters?.urlBasePath
      ? widgetFilters?.urlBasePath
      : '/analytics/health/tab/'
  )
  const { filters } = useAnalyticsFilter()
  const healthPageFilters = widgetFilters ? widgetFilters : filters

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  return (
    <>
      { !widgetFilters &&
      <Header
        title={$t({ defaultMessage: 'Health' })}
        shouldQuerySwitch={false}
        withIncidents={false}
      />
      }
      <GridRow>
        <GridCol col={{ span: 24 }} style={{ minHeight: '105px' }}>
          <SummaryBoxes/>
        </GridCol>
        <HealthPageContextProvider>
          <GridCol col={{ span: 24 }} style={{ height: '210px' }}>
            <ConnectedClientsOverTime filters={healthPageFilters}/>
          </GridCol>
          <GridCol col={{ span: 16 }} >
            <Tabs activeKey={activeTab} onChange={onTabChange}>
              {healthTabs.map((tab) => (
                <Tabs.TabPane
                  tab={$t(tabsMap[tab.value as HealthTab])}
                  key={tab.value}
                />
              ))}
            </Tabs>
          </GridCol>
          <GridCol col={{ span: 8 }} >
            <UI.ThresholdTitle>
              {$t({ defaultMessage: 'Customized SLA Threshold' })}
            </UI.ThresholdTitle>
          </GridCol>
          <GridCol col={{ span: 24 }}>
            <Kpis tab={activeTab as HealthTab} filters={healthPageFilters}/>
          </GridCol>
        </HealthPageContextProvider>
      </GridRow>
    </>
  )
}
export default HealthPage
