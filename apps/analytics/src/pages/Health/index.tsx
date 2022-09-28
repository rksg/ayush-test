import { Tabs }                                      from 'antd'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { categoryNames }                         from '@acx-ui/analytics/utils'
import { GridCol, GridRow }                      from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import Header from '../../components/Header'

import { HealthPageContextProvider } from './HealthPageContext'
import * as UI                       from './styledComponents'
import Kpis from './Kpi/'

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



export default function HealthPage () {
  const { $t } = useIntl()
  const { activeTab = healthTabs[0].value } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/health/tab/')
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  return (
    <>
      <Header title={$t({ defaultMessage: 'Health' })} />
      <GridRow>
        <GridCol col={{ span: 24 }} style={{ height: '105px' }}>
          <div>Summary Boxes</div>
        </GridCol>
        <HealthPageContextProvider>
          <GridCol col={{ span: 24 }} style={{ height: '210px' }}>
            <div>Summary TimeSeries</div>
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
            <Kpis tab={activeTab as HealthTab} />
          </GridCol>
        </HealthPageContextProvider>
      </GridRow>
    </>
  )
}
