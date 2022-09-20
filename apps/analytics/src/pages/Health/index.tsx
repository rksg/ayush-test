import { useCallback, useEffect, useMemo, useRef } from 'react'

import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'
import { useIntl }  from 'react-intl'

import { getSeriesData, TimeSeriesData, useAnalyticsFilter } from '@acx-ui/analytics/utils'

import Header                       from '../../components/Header'
import HealthTimeSeriesChart        from '../../components/HealthConnectedClientsOverTime'
import { useHealthTimeseriesQuery } from '../../components/HealthConnectedClientsOverTime/services'

import { HealthPageContext, HealthPageContextProvider, TimeWindow } from './HealthPageContext'

const HealthChartGroup = 'healthGroup'

export default function HealthPage () {
  const { $t } = useIntl()
  const analyticsFilter = useAnalyticsFilter()
  const clientsRef = useRef<ReactECharts>(null)
  const clientsRef1 = useRef<ReactECharts>(null)
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

  const healthQueryResults = useHealthTimeseriesQuery(analyticsFilter.filters, {
    selectFromResult: ({
      data,
      ...rest
    }) => ({
      data: getSeriesData(data as TimeSeriesData | null, seriesMapping),
      ...rest
    })
  })

  const chartRefs = useMemo(() => [
    clientsRef,
    clientsRef1
  ], [])

  const connectRefs = useCallback(() => {
    const validRefs = chartRefs.filter(ref => ref && ref.current)
    validRefs.forEach(ref => {
      let instance = ref.current!.getEchartsInstance()
      instance.group = HealthChartGroup
    })
    connect(HealthChartGroup)
  }, [chartRefs])

  useEffect(() => {
    connectRefs()
  }, [connectRefs, healthQueryResults.data])

  return <HealthPageContextProvider>
    <Header title={$t({ defaultMessage: 'Health' })} />
    <HealthPageContext.Consumer>
      {
        (context) => {
          const setTimeWindowCallback = (range: TimeWindow) => {
            context.setTimeWindow(range)
            connectRefs()
          }
          return (<HealthTimeSeriesChart
            {...context}
            setTimeWindow={setTimeWindowCallback}
            ref={clientsRef}
            queryResults={healthQueryResults}
          />)
        }
      }
    </HealthPageContext.Consumer>
  </HealthPageContextProvider>
}
