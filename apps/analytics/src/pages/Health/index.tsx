import { useEffect, useMemo, useRef } from 'react'

import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'
import { useIntl }  from 'react-intl'

import { useAnalyticsFilter } from '@acx-ui/analytics/utils'

import Header                from '../../components/Header'
import HealthTimeSeriesChart from '../../components/HealthConnectedClientsOverTime'

import { HealthPageContextProvider } from './HealthPageContext'

export default function HealthPage () {
  const { $t } = useIntl()
  const { filters } = useAnalyticsFilter()

  const clientsRef = useRef<ReactECharts>(null)
  const clientsRef1 = useRef<ReactECharts>(null)

  const chartRefs = useMemo(() => [
    clientsRef,
    clientsRef1
  ],[])

  useEffect(() => {
    if(chartRefs.every(ref => ref && ref.current)){
      [chartRefs[0], chartRefs[1]].forEach(ref => {
        let instance = ref.current!.getEchartsInstance()
        instance.group = 'group1'
      })
      connect('group1')
      console.log('trigger')
    }
  }, [chartRefs])

  return <HealthPageContextProvider>
    <Header title={$t({ defaultMessage: 'Health' })} />
    <HealthTimeSeriesChart filters={filters} ref={chartRefs[0]} key='1' />
    <HealthTimeSeriesChart filters={filters} ref={chartRefs[1]} key='2' />
  </HealthPageContextProvider>
}
