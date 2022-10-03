import { useRef } from 'react'

import { Tabs }                                      from 'antd'
import ReactECharts                                  from 'echarts-for-react'
import { useIntl, defineMessage, MessageDescriptor } from 'react-intl'

import { categoryNames }                         from '@acx-ui/analytics/utils'
import { GridCol, GridRow }                      from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import Header from '../../components/Header'

import ConnectedClientsOverTime      from './ConnectedClientsOverTime'
import { HealthPageContextProvider } from './HealthPageContext'
import * as UI                       from './styledComponents'
import { SummaryBoxes }              from './SummaryBoxes'

const healthTabs = [{ text: 'Overview', value: 'overview' }, ...categoryNames]
type HealthTab = 'overview' | 'connection' | 'performance' | 'infrastructure'

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

const HealthTabContent = (props: { tabSelection: HealthTab }) => {
  return (
    <GridRow>
      <GridCol col={{ span: 16 }} >
        <div>{props.tabSelection}</div>
      </GridCol>
      <GridCol col={{ span: 8 }} >
        <div>Threshold Content</div>
      </GridCol>
    </GridRow>
  )
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

  const connectedClientsRef = useRef<ReactECharts>(null)

  return (
    <>
      <Header title={$t({ defaultMessage: 'Health' })} />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <SummaryBoxes/>
        </GridCol>
        <HealthPageContextProvider>
          <GridCol col={{ span: 24 }} style={{ height: '210px' }}>
            <ConnectedClientsOverTime ref={connectedClientsRef} />
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
            <HealthTabContent tabSelection={activeTab as HealthTab} />
          </GridCol>
        </HealthPageContextProvider>
      </GridRow>
    </>
  )
}
