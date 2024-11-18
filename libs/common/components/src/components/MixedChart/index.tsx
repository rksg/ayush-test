import React from 'react'

import ReactECharts, { EChartsOption } from 'echarts-for-react'

export function MixedChart (props: {
  style?: React.CSSProperties,
  option: EChartsOption }) {


  return (<ReactECharts
    {...props}
    opts={{ renderer: 'svg' }}
  />
  )
}
