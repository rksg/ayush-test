import { useContext, useEffect } from 'react'

import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'

import { AnalyticsFilter } from '@acx-ui/analytics/utils'

import NetworkHistoryWidget  from '../../../components/NetworkHistory'
import { HealthPageContext } from '../HealthPageContext'


const ConnectedClientsOverTime = (props: { filters : AnalyticsFilter }) => {
  const healthFilter = useContext(HealthPageContext)
  const { filters: healthPageFilters } = props
  const { startDate, endDate, range, timeWindow, setTimeWindow } = healthFilter
  const filters = { ...healthPageFilters, startDate, endDate, range }
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'timeSeriesGroup'
    }
  }
  useEffect(() => { connect('timeSeriesGroup') }, [])
  return (
    <NetworkHistoryWidget
      filters={filters}
      ref={connectChart}
      brush={{ timeWindow, setTimeWindow }}
      type='no-border'
      hideTitle
      hideIncidents
    />
  )}

export default ConnectedClientsOverTime
