import { useIntl } from 'react-intl'

import { AnalyticsFilter, useAnalyticsFilter, categoryTabs, CategoryTab } from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Tabs }                                         from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink }                          from '@acx-ui/react-router-dom'

import { Header } from '../Header'

import ConnectedClientsOverTime      from './ConnectedClientsOverTime'
import { HealthPageContextProvider } from './HealthPageContext'
import Kpis                          from './Kpi'
import * as UI                       from './styledComponents'
import { SummaryBoxes }              from './SummaryBoxes'

const HealthPage = (props: { filters? : AnalyticsFilter, path?: string }) => {
  const { $t } = useIntl()
  const { filters: widgetFilters } = props
  const params = useParams()
  const selectedTab = params['categoryTab'] ?? categoryTabs[0].value
  const navigate = useNavigate()
  const basePath = useTenantLink(props.path ?? '/analytics/health/tab/')
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
          <SummaryBoxes filters={healthPageFilters} />
        </GridCol>
        <HealthPageContextProvider>
          <GridCol col={{ span: 24 }} style={{ height: '210px' }}>
            <ConnectedClientsOverTime filters={healthPageFilters} />
          </GridCol>
          <GridCol col={{ span: 16 }} >
            <Tabs style={{ marginRight: '-20px' }} activeKey={selectedTab} onChange={onTabChange}>
              {categoryTabs.map(({ value, label }) => (
                <Tabs.TabPane tab={$t(label)} key={value} />
              ))}
            </Tabs>
          </GridCol>
          <GridCol col={{ span: 8 }} >
            <UI.ThresholdTitle>
              {$t({ defaultMessage: 'Customized SLA Threshold' })}
            </UI.ThresholdTitle>
          </GridCol>
          <GridCol col={{ span: 24 }}>
            <Kpis tab={selectedTab as CategoryTab} filters={healthPageFilters}/>
          </GridCol>
        </HealthPageContextProvider>
      </GridRow>
    </>
  )
}
export { HealthPage }
