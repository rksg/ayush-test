import { useContext, useEffect } from 'react'

import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'
import moment       from 'moment-timezone'

import { kpisForTab, useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { GridCol, GridRow, NotAvailable } from '@acx-ui/components'

import { HealthTab }         from '../'
import { HealthPageContext } from '../HealthPageContext'

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
  const defaultZoom = (
    moment(filters.startDate).isSame(timeWindow[0]) &&
    moment(filters.endDate).isSame(timeWindow[1])
  )
  useEffect(() => { connect('timeSeriesGroup') }, [])
  return (<>{
    kpis.map((kpi) => (<GridRow key={kpi + defaultZoom} divider>
      <GridCol col={{ span: 16 }}>
        <GridRow style={{ height: '150px' }}>
          <GridCol col={{ span: 5 }}>
            <HealthPill filters={filters} kpi={kpi} timeWindow={timeWindow}/>
          </GridCol>
          <GridCol col={{ span: 19 }}>
            <KpiTimeseries
              filters={filters}
              kpi={kpi}
              chartRef={connectChart}
              setTimeWindow={setTimeWindow}
              {...(defaultZoom ? {} : { timeWindow })}
            />
          </GridCol>
        </GridRow>
      </GridCol>
      <GridCol col={{ span: 8 }}>
        <NotAvailable/>
      </GridCol>
    </GridRow>))
  }</>)
}
