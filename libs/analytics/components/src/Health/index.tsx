import { useState } from 'react'

import { useIntl } from 'react-intl'

import { AnalyticsFilter, useAnalyticsFilter, categoryTabs, CategoryTab } from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Tabs }                                         from '@acx-ui/components'
import { get }                                                            from '@acx-ui/config'
import {  useIsTierAllowed }                                              from '@acx-ui/feature-toggle'
import { useNavigate, useParams, useTenantLink }                          from '@acx-ui/react-router-dom'

import { Header } from '../Header'

import ConnectedClientsOverTime                         from './ConnectedClientsOverTime'
import { HealthDrillDown }                              from './HealthDrillDown'
import { DrilldownSelection }                           from './HealthDrillDown/config'
import { HealthPageContextProvider, getAPCountForNode } from './HealthPageContext'
import Kpis                                             from './Kpi'
import * as UI                                          from './styledComponents'
import { SummaryBoxes }                                 from './SummaryBoxes'

const HealthPage = (props: { filters? : AnalyticsFilter, path?: string }) => {
  const { $t } = useIntl()
  const canUseAnltAdv = useIsTierAllowed('ANLT-ADV')
  const isMLISA = get('IS_MLISA_SA')
  const { filters: widgetFilters } = props
  const params = useParams()
  const selectedTab = params['categoryTab'] ?? categoryTabs[0].value
  const navigate = useNavigate()
  const basePath = useTenantLink(props.path ?? '/analytics/health/tab/')
  const { filters } = useAnalyticsFilter()
  const healthPageFilters = widgetFilters ? widgetFilters : filters
  const [drilldownSelection, setDrilldownSelection] = useState<DrilldownSelection>(null)

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  return (
    <>
      {!widgetFilters && !canUseAnltAdv && !isMLISA &&
      <Header
        title={$t({ defaultMessage: 'Health' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'AI Assurance' }) },
          { text: $t({ defaultMessage: 'Network Assurance' }) }
        ]}
        shouldQuerySwitch={false}
        withIncidents={false} />
      }
      <GridRow>
        <GridCol col={{ span: 24 }} style={{ minHeight: '105px' }}>
          <SummaryBoxes
            filters={healthPageFilters}
            drilldownSelection={drilldownSelection}
            setDrilldownSelection={setDrilldownSelection}
          />
          <HealthDrillDown
            filters={healthPageFilters}
            drilldownSelection={drilldownSelection}
            setDrilldownSelection={setDrilldownSelection}
          />
        </GridCol>
        <HealthPageContextProvider>
          <GridCol col={{ span: 24 }} style={{ height: '210px' }}>
            <ConnectedClientsOverTime filters={healthPageFilters} />
          </GridCol>
          <GridCol col={{ span: 16 }}>
            <UI.TabTitle activeKey={selectedTab} onChange={onTabChange}>
              {categoryTabs.map(({ value, label }) => (
                <Tabs.TabPane tab={$t(label)} key={value} />
              ))}
            </UI.TabTitle>
          </GridCol>
          <GridCol col={{ span: 8 }}>
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
export { HealthPage, getAPCountForNode }
