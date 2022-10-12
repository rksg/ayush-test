import { forwardRef, useContext } from 'react'

import ReactECharts from 'echarts-for-react'

import NetworkHistoryWidget  from '../../../components/NetworkHistory'
import { HealthPageContext } from '../HealthPageContext'


const ConnectedClientsOverTime = forwardRef<ReactECharts>((
  _props,
  ref
) => {
  const healthFilter = useContext(HealthPageContext)
  const { startDate, endDate, range, path, timeWindow, setTimeWindow, filter } = healthFilter
  const filters = { startDate, endDate, range, path, filter }

  return (
    <NetworkHistoryWidget
      filters={filters}
      ref={ref}
      brush={{ timeWindow, setTimeWindow }}
      type='no-border'
      hideTitle
      hideIncidents
    />
  )})

export default ConnectedClientsOverTime
