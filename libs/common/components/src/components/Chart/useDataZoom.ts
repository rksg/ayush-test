import { RefObject, useEffect, useCallback, useState } from 'react'


import ReactECharts from 'echarts-for-react'
import { isEmpty }  from 'lodash'
import moment       from 'moment-timezone'

import type { TimeSeriesChartData } from '@acx-ui/analytics/utils'
import type { TimeStampRange }      from '@acx-ui/types'

import type { ECharts } from 'echarts'

type OnDatazoomEvent = {
  batch?: {
    startValue: number, endValue: number
  }[],
  start?: number,
  end?: number
}

export function useDataZoom<TChartData extends TimeSeriesChartData> (
  eChartsRef: RefObject<ReactECharts>,
  zoomEnabled: boolean,
  data: TChartData[],
  zoom?: TimeStampRange,
  onDataZoom?: (range: TimeStampRange, isReset: boolean) => void
): [boolean, () => void] {
  const firstLastTimeStamp = useCallback((data: TChartData[]) => {
    const firstSeries = data[0].data
    const firstTimeStamp = firstSeries[0][0]
    const lastTimeStamp = firstSeries[firstSeries.length - 1][0]
    return [firstTimeStamp, lastTimeStamp]
  }, [])
  const [canResetZoom, setCanResetZoom] = useState<boolean>(false)

  const onDatazoomCallback = useCallback((e: unknown) => {
    const event = e as unknown as OnDatazoomEvent
    const firstBatch = event.batch?.[0]
    firstBatch && onDataZoom && onDataZoom([firstBatch.startValue, firstBatch.endValue], false)
    if (event.start === 0 && event.end === 100) {
      const [firstTimeStamp, lastTimeStamp] = firstLastTimeStamp(data)
      onDataZoom && onDataZoom([+new Date(firstTimeStamp), +new Date(lastTimeStamp)], true)
      setCanResetZoom(false)
    } else {
      setCanResetZoom(true)
    }
  }, [data, onDataZoom, firstLastTimeStamp])
  useEffect(() => {
    if (!eChartsRef?.current || !zoomEnabled) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'dataZoomSelect',
      dataZoomSelectActive: true
    })
    echartInstance.on('datazoom', onDatazoomCallback)
  })

  useEffect(() => {
    if (!eChartsRef?.current || isEmpty(zoom)) return
    const [firstTimeStamp, lastTimeStamp] = firstLastTimeStamp(data)
    const canResetZoom = moment(firstTimeStamp).diff(moment(zoom![0])) < 0 ||
      moment(lastTimeStamp).diff(moment(zoom![1])) > 0
    if (!canResetZoom) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.dispatchAction({ type: 'dataZoom', startValue: zoom![0], endValue: zoom![1] })
  }, [eChartsRef, zoom, data, firstLastTimeStamp])

  const resetZoomCallback = useCallback(() => {
    if (!eChartsRef?.current) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.dispatchAction({ type: 'dataZoom', start: 0, end: 100 })
  }, [eChartsRef])

  return [canResetZoom, resetZoomCallback]
}
