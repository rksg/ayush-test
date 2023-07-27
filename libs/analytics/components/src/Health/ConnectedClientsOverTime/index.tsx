import { useContext, useEffect } from 'react'

import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'

import { AnalyticsFilter } from '@acx-ui/analytics/utils'

import { NetworkHistory }    from '../../NetworkHistory'
import { HealthPageContext } from '../HealthPageContext'

const ConnectedClientsOverTime = (props: { filters : AnalyticsFilter }) => {
  const {
    startDate,
    endDate,
    range,
    timeWindow,
    setTimeWindow,
    apCount
  } = useContext(HealthPageContext)
  const { filters: healthPageFilters } = props
  const filters = { ...healthPageFilters, startDate, endDate, range }
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'timeSeriesGroup'
    }
  }
  useEffect(() => { connect('timeSeriesGroup') }, [])
  return (
    <NetworkHistory
      filters={filters}
      ref={connectChart}
      brush={{ timeWindow, setTimeWindow }}
      type='no-border'
      hideTitle
      hideIncidents
      apCount={apCount}
    />
  )}

export default ConnectedClientsOverTime
