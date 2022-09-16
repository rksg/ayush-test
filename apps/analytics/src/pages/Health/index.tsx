import { useEffect, useMemo, useRef } from 'react'

import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'
import { useIntl }  from 'react-intl'

import { getSeriesData, TimeSeriesData, useAnalyticsFilter } from '@acx-ui/analytics/utils'

import Header                from '../../components/Header'
import HealthTimeSeriesChart from '../../components/HealthConnectedClientsOverTime'

import { HealthPageContextProvider } from './HealthPageContext'
import { useHealthTimeseriesQuery } from '../../components/HealthConnectedClientsOverTime/services'

export default function HealthPage () {
  const { $t } = useIntl()
  const { filters } = useAnalyticsFilter()

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

  const queryResults = useHealthTimeseriesQuery(filters, {
    selectFromResult: ({
      data,
      ...rest
    }) => ({
      data: getSeriesData(data as TimeSeriesData | null, seriesMapping),
      ...rest
    })
  })

  const clientsRef = useRef<ReactECharts>(null)
  const clientsRef1 = useRef<ReactECharts>(null)

  const chartRefs = useMemo(() => [
    clientsRef,
    clientsRef1
  ],[])

  useEffect(() => {
    console.log(chartRefs)
    if(chartRefs.every(ref => ref && ref.current)){
      [chartRefs[0], chartRefs[1]].forEach(ref => {
        let instance = ref.current!.getEchartsInstance()
        instance.group = 'group1'
      })
      // connect('group1')
      // console.log('trigger')
    }
    connect('group1')
  }, [chartRefs, queryResults])

  return <HealthPageContextProvider>
    <Header title={$t({ defaultMessage: 'Health' })} />
    <HealthTimeSeriesChart filters={filters} chartRef={chartRefs[0]} data={queryResults}/>
    <HealthTimeSeriesChart filters={filters} chartRef={chartRefs[1]} data={queryResults}/>
  </HealthPageContextProvider>
}
