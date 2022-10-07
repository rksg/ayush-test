import { RefObject, useEffect, useCallback, useState } from 'react'


import ReactECharts from 'echarts-for-react'
import { isEmpty }  from 'lodash'
import moment       from 'moment-timezone'

import type { MultiLineTimeSeriesChartData } from '@acx-ui/analytics/utils'
import type { TimeStampRange }               from '@acx-ui/types'

import type { ECharts } from 'echarts'

type OnDatazoomEvent = {
  batch?: {
    startValue: number, endValue: number
  }[],
  start?: number,
  end?: number
}

export function useDataZoom<TChartData extends MultiLineTimeSeriesChartData> (
  eChartsRef: RefObject<ReactECharts>,
  zoomEnabled: boolean,
  data: TChartData[],
  zoom?: TimeStampRange,
  onDataZoom?: (range: TimeStampRange) => void
): [boolean, (event: OnDatazoomEvent) => void, () => void] {
  useEffect(() => {
    if (!eChartsRef?.current || !zoomEnabled) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'dataZoomSelect',
      dataZoomSelectActive: true
    })
  })

  useEffect(() => {
    if (!eChartsRef?.current || isEmpty(zoom)) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    const firstSeries = data[0].data
    if (
      moment(firstSeries[0][0]).diff(moment(zoom![0])) !== 0 ||
      moment(firstSeries[firstSeries.length - 1][0]).diff(moment(zoom![1])) !== 0
    ) {
      echartInstance.dispatchAction({ type: 'dataZoom', startValue: zoom![0], endValue: zoom![1] })
    }
  }, [eChartsRef, zoom, data])

  const [canResetZoom, setCanResetZoom] = useState<boolean>(false)
  const onDatazoomCallback = useCallback((event: OnDatazoomEvent) => {
    const firstBatch = event.batch?.[0]
    firstBatch && onDataZoom && onDataZoom([firstBatch.startValue, firstBatch.endValue])
    if (event.start === 0 && event.end === 100) {
      const firstSeries = data[0].data
      onDataZoom && onDataZoom([
        +new Date(firstSeries[0][0]),
        +new Date(firstSeries[firstSeries.length - 1][0])
      ])
      setCanResetZoom(false)
    } else {
      setCanResetZoom(true)
    }
  }, [data, onDataZoom])

  const resetZoomCallback = useCallback(() => {
    if (!eChartsRef?.current) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.dispatchAction({ type: 'dataZoom', start: 0, end: 100 })
  }, [eChartsRef])

  return [canResetZoom, onDatazoomCallback, resetZoomCallback]
}
