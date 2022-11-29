import { RefObject, useEffect } from 'react'

import { ECharts }  from 'echarts'
import ReactECharts from 'echarts-for-react'


type AxisEventData = {
  targetType: string,
  value: string
}

export function useOnAxisLabelClick (
  eChartsRef: RefObject<ReactECharts>,
  onAxisLabelClick?: (name: string) => void
) {
  useEffect(() => {
    if (!eChartsRef || !eChartsRef.current) return
    const echartInstance = eChartsRef.current?.getEchartsInstance() as ECharts
    echartInstance.on('click', function (params: unknown) {
      const { targetType, value } = params as unknown as AxisEventData
      if (targetType === 'axisLabel') {
        onAxisLabelClick && onAxisLabelClick(value)
      }
    })
  })
}
