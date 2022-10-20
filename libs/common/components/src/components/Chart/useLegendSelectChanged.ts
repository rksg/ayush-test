import { RefObject, useEffect } from 'react'

import { ECharts }  from 'echarts'
import ReactECharts from 'echarts-for-react'

type LegendEventData = {
  type: string,
  name: string
  selected: {
      [name: string]: boolean
  }
}

export function useLegendSelectChanged (
  eChartsRef: RefObject<ReactECharts>
) {
  useEffect(() => {
    if (!eChartsRef || !eChartsRef.current) return
    const echartInstance = eChartsRef.current?.getEchartsInstance() as ECharts
    echartInstance.on('legendselectchanged', function (params: unknown) {
      const { selected } = params as unknown as LegendEventData
      const areFalsy = Object.values(selected).every(value => !value)
      if (areFalsy)
        echartInstance.dispatchAction({
          type: 'legendAllSelect'
        })
    })
  })
}
