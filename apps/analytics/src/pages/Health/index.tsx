import { useEffect, useMemo, useRef, useState } from 'react'

import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'
import { useIntl }  from 'react-intl'

import { getSeriesData, TimeSeriesData, useAnalyticsFilter } from '@acx-ui/analytics/utils'

import Header                       from '../../components/Header'
import HealthTimeSeriesChart        from '../../components/HealthConnectedClientsOverTime'
import { useHealthTimeseriesQuery } from '../../components/HealthConnectedClientsOverTime/services'

import { HealthPageContextProvider, TimeWindow } from './HealthPageContext'

export default function HealthPage () {
  const { $t } = useIntl()
  const { filters } = useAnalyticsFilter()
  const { startDate, endDate } = filters
  const [timeWindow, setTimeWindow] = useState<TimeWindow>([startDate, endDate])

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

  const queryResults = useHealthTimeseriesQuery({
    ...filters,
    startDate: timeWindow[0] as string,
    endDate: timeWindow[1] as string
  }, {
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
  const chartRefs = useMemo(() => [clientsRef, clientsRef1],[])
  useEffect(() => {
    if(chartRefs.every(ref => ref && ref.current)){
      [chartRefs[0], chartRefs[1]].forEach(ref => {
        let instance = ref.current!.getEchartsInstance()
        instance.group = 'group1'
      })
    }
    connect('group1')
  }, [chartRefs, queryResults.data])

  return <HealthPageContextProvider>
    <Header title={$t({ defaultMessage: 'Health' })} />
    <HealthTimeSeriesChart
      ref={chartRefs[0]}
      queryResults={queryResults}
      setTimeWindow={setTimeWindow}
    />
    <HealthTimeSeriesChart
      ref={chartRefs[1]}
      queryResults={queryResults}
      setTimeWindow={setTimeWindow}
    />
  </HealthPageContextProvider>
}
