import { forwardRef, useContext } from 'react'


// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import NetworkHistoryWidget from 'apps/analytics/src/components/NetworkHistory'
import ReactECharts         from 'echarts-for-react'

import { HealthPageContext } from '../HealthPageContext'


export interface HealthTimeSeriesChartProps {

}

const HealthTimeSeriesChart = forwardRef<ReactECharts, HealthTimeSeriesChartProps>((
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _props,
  ref
) => {
  const healthFilter = useContext(HealthPageContext)
  const { startDate, endDate, range, path, timeWindow, setTimeWindow } = healthFilter
  const filters = { startDate, endDate, range, path }

  return (
    <NetworkHistoryWidget
      filters={filters}
      ref={ref}
      brush={{ timeWindow, setTimeWindow }}
      hideTitle
      hideIncidents
    />
  )})

export default HealthTimeSeriesChart
