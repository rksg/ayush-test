import { RefObject, useEffect, useCallback, useState } from 'react'

import ReactECharts from 'echarts-for-react'

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

  const [canResetZoom, setCanResetZoom] = useState<boolean>(false)

  const onDatazoomCallback = useCallback((e: unknown) => {
    const event = e as unknown as OnDatazoomEvent
    const firstBatch = event.batch?.[0]
    firstBatch && onDataZoom && onDataZoom([firstBatch.startValue, firstBatch.endValue], false)
    if (event.start === 0 && event.end === 100) {
      setCanResetZoom(false)
    } else {
      setCanResetZoom(true)
    }
  }, [onDataZoom])
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

  const resetZoomCallback = useCallback(() => {
    if (!eChartsRef?.current) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.dispatchAction({ type: 'dataZoom', start: 0, end: 100 })
  }, [eChartsRef])

  return [canResetZoom, resetZoomCallback]
}
