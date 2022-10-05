import { useContext, useEffect } from 'react'

import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'

import { kpisForTab, useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { GridCol, GridRow }               from '@acx-ui/components'

import { HealthTab }         from '../'
import { HealthPageContext } from '../HealthPageContext'
import { KpiRow }            from '../styledComponents'

import HealthPill    from './Pill'
import KpiTimeseries from './Timeseries'

export default function KpiSection (props: { tab: HealthTab }) {
  const { kpis } = kpisForTab[props.tab]
  const healthFilter = useContext(HealthPageContext)
  const { timeWindow, setTimeWindow } = healthFilter
  const { filters } = useAnalyticsFilter()
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'timeSeriesGroup'
    }
  }
  useEffect(() => { connect('timeSeriesGroup') }, [])
  return (<>{
    kpis.map((kpi, index) => (<KpiRow key={kpi}>
      <GridCol col={{ span: 16 }}>
        <GridRow style={{ height: '150px' }}>
          <GridCol col={{ span: 5 }}>
            <HealthPill filters={filters} kpi={kpi} timeWindow={timeWindow as [string, string]}/>
          </GridCol>
          <GridCol col={{ span: 19 }}>
            <KpiTimeseries
              filters={filters} 
              kpi={kpi} 
              chartRef={connectChart}
              setTimeWindow={index < 1 ? setTimeWindow : undefined}
            />
          </GridCol>
        </GridRow>
      </GridCol>
      <GridCol col={{ span: 8 }}>
        <div>Threshold Content</div>
      </GridCol>
    </KpiRow>))
  }</>)
}