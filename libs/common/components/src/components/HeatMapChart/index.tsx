import { useRef } from 'react'

import ReactECharts    from 'echarts-for-react'
import {
  TooltipFormatterCallback,
  CallbackDataParams
} from 'echarts/types/dist/shared'
import { cssStr } from '@acx-ui/components'

import {
  tooltipOptions,axisLabelOptions, dateAxisFormatter,gridOptions,xAxisOptions,yAxisOptions
}                 from '../Chart/helper'


export function Heatmap (props: {
  style: React.CSSProperties;
  data: object;
  xAxisCategories: string[];
  yAxisCategories: string[];
  tooltipFormatter: TooltipFormatterCallback<CallbackDataParams>
  colors: string[];
  min: number;
  max: number;
  title: string;
}) {
  const eChartsRef = useRef<ReactECharts>(null)

  const option = {
    tooltip: {
      position: 'top',
      ...tooltipOptions(),
      formatter: props.tooltipFormatter
    },
    grid: { ...gridOptions({ rightGridOffset: 5 }), height: '80%', top: 10, bottom: 10 },

    xAxis: {
      ...xAxisOptions(),
      type: 'category',
      data: props.xAxisCategories,
      axisLabel: {
        ...axisLabelOptions(),
        formatter: dateAxisFormatter()
      }
    },
    yAxis: {
      ...yAxisOptions(),
      axisTick: {
        show: false
      },
      type: 'category',
      data: props.yAxisCategories,
      axisLabel: {
        interval: 0,
        ...axisLabelOptions()
      }
    },
    visualMap: {
      min: props.min,
      max: props.max,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 5,
      inRange: {
        color: props.colors
      }
    },
    series: [
      {
        name: props.title,
        type: 'heatmap',
        data: props.data,
        label: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10
          }
        }
      }
    ]
  }

  return <ReactECharts ref={eChartsRef} {...props} option={option} />
}





