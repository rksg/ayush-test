import { forwardRef, useContext, useEffect } from 'react'

import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'

import NetworkHistoryWidget  from '../../../components/NetworkHistory'
import { HealthPageContext } from '../HealthPageContext'


const ConnectedClientsOverTime = () => {
  const healthFilter = useContext(HealthPageContext)
  const { startDate, endDate, range, path, timeWindow, setTimeWindow } = healthFilter
  const filters = { startDate, endDate, range, path }
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
