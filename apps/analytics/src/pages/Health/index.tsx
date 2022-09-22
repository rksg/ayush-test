import { useCallback, useEffect, useRef } from 'react'

import { Tabs }                                      from 'antd'
import { connect }                                   from 'echarts'
import ReactECharts                                  from 'echarts-for-react'
import { useIntl, defineMessage, MessageDescriptor } from 'react-intl'

import { categoryNames }                                     from '@acx-ui/analytics/utils'
import { getSeriesData, TimeSeriesData, useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { GridCol, GridRow }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink }             from '@acx-ui/react-router-dom'

import Header                       from '../../components/Header'
import { useHealthTimeseriesQuery } from '../../components/HealthConnectedClientsOverTime/services'

import { HealthPageContextProvider } from './HealthPageContext'
import * as UI                       from './styledComponents'

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

const HealthChartGroup = 'healthGroup'

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

  const analyticsFilter = useAnalyticsFilter()
  const clientsRef = useRef<ReactECharts>(null)
  const clientsRef1 = useRef<ReactECharts>(null)
  const seriesMapping = [
    {
      key: 'newClientCount',
      name: $t({ defaultMessage: 'New Clients' })
    },
    {
      key: 'connectedClientCount',
      name: $t({ defaultMessage: 'Connected Clients' })
    }
  ] as Array<{ key: string; name: string }>
  
  const healthQueryResults = useHealthTimeseriesQuery(analyticsFilter.filters, {
    selectFromResult: ({
      data,
      ...rest
    }) => ({
      data: getSeriesData(data as TimeSeriesData | null, seriesMapping),
      ...rest
    })
  })
  
  const connectRefs = useCallback(() => {
    const chartRefs = [
      clientsRef,
      clientsRef1
    ]
  
    const validRefs = chartRefs.filter(ref => ref && ref.current)
    validRefs.forEach(ref => {
      let instance = ref.current!.getEchartsInstance()
      instance.group = HealthChartGroup
    })
    connect(HealthChartGroup)
  }, [])
  
  useEffect(() => {
    connectRefs()
  }, [connectRefs, healthQueryResults.data])

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
            <HealthTabContent tabSelection={activeTab as HealthTab} />
          </GridCol>
        </HealthPageContextProvider>
      </GridRow>
    </>
  )
}
