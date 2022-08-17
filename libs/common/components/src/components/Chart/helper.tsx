import {
  TooltipComponentFormatterCallbackParams,
  XAXisComponentOption,
  YAXisComponentOption,
  RegisteredSeriesOption,
  TooltipComponentOption
} from 'echarts'
import moment             from 'moment-timezone'
import { renderToString } from 'react-dom/server'

import { TimeStamp } from '@acx-ui/types'
import { formatter } from '@acx-ui/utils'

import { cssStr, cssNumber } from '../../theme/helper'

import * as UI from './styledComponents'

export type TooltipFormatterParams = Exclude<
  TooltipComponentFormatterCallbackParams,
  Array<unknown>
>

export const gridOptions = () => ({
  left: '0%',
  right: '0%',
  bottom: '0%',
  top: '15%',
  containLabel: true
})

export const legendOptions = () => ({
  icon: 'square',
  right: 15,
  itemWidth: 15,
  itemGap: 15
})

export const legendTextStyleOptions = () => ({
  color: cssStr('--acx-primary-black'),
  fontFamily: cssStr('--acx-neutral-brand-font'),
  fontSize: cssNumber('--acx-body-5-font-size'),
  lineHeight: cssNumber('--acx-body-5-line-height'),
  fontWeight: cssNumber('--acx-body-font-weight')
})

export const xAxisOptions = () => ({
  axisLine: {
    lineStyle: {
      color: 'transparent'
    }
  },
  axisPointer: {
    type: 'line',
    lineStyle: {
      type: 'solid',
      width: 1,
      color: cssStr('--acx-primary-black')
    }
  }
} as XAXisComponentOption)

export const barChartAxisLabelOptions = () => ({
  color: cssStr('--acx-primary-black'),
  fontFamily: cssStr('--acx-neutral-brand-font'),
  fontSize: cssNumber('--acx-body-4-font-size'),
  lineHeight: cssNumber('--acx-body-4-line-height'),
  fontWeight: cssNumber('--acx-body-font-weight')
})

export const barChartSeriesLabelOptions = () => ({
  show: true,
  position: 'right',
  fontFamily: cssStr('--acx-neutral-brand-font'),
  fontSize: cssNumber('--acx-body-3-font-size'),
  lineHeight: cssNumber('--acx-body-3-line-height'),
  color: cssStr('--acx-primary-black'),
  fontWeight: cssNumber('--acx-body-font-weight'),
  silent: true
} as RegisteredSeriesOption['bar']['label'])

export const yAxisOptions = () => ({
  boundaryGap: [0, '10%']
} as YAXisComponentOption)

export const axisLabelOptions = () => ({
  color: cssStr('--acx-neutrals-50'),
  fontFamily: cssStr('--acx-neutral-brand-font'),
  fontSize: cssNumber('--acx-body-5-font-size'),
  lineHeight: cssNumber('--acx-body-5-line-height'),
  fontWeight: cssNumber('--acx-body-font-weight')
})

export const dateAxisFormatter = (value: number): string => {
  const dateTime = moment(value).format('YYYY-MM-DD HH:mm')
  let formatted
  if (dateTime.match(/^\d{4}-01-01 00:00$/))
    formatted = formatter('yearFormat')(value)
  else if (dateTime.match(/^\d{4}-\d{2}-01 00:00$/))
    formatted = formatter('monthFormat')(value)
  else if (dateTime.match(/^\d{4}-\d{2}-\d{2} 00:00$/))
    formatted = formatter('monthDateFormat')(value)
  return formatted ||
    formatter('shortDateTimeFormat')(value) as string
}

export const tooltipOptions = () => ({
  textStyle: {
    color: cssStr('--acx-primary-white'),
    fontFamily: cssStr('--acx-neutral-brand-font'),
    fontSize: cssNumber('--acx-body-5-font-size'),
    lineHeight: cssNumber('--acx-body-5-line-height'),
    fontWeight: cssNumber('--acx-body-font-weight')
  },
  backgroundColor: cssStr('--acx-primary-black'),
  borderRadius: 2,
  borderWidth: 0,
  padding: 8,
  confine: true,
  extraCssText: 'box-shadow: 0px 4px 8px rgba(51, 51, 51, 0.08);'
} as TooltipComponentOption)

export const timeSeriesTooltipFormatter = (
  dataFormatter?: ((value: unknown) => string | null)
) => (
  parameters: TooltipFormatterParams | TooltipFormatterParams[]
) => {
  const [ time ] = (Array.isArray(parameters)
    ? parameters[0].data : parameters.data) as [TimeStamp, number]
  return renderToString(
    <UI.TooltipWrapper>
      <time dateTime={new Date(time).toJSON()}>{formatter('dateTimeFormat')(time)}</time>
      <ul>{
        (Array.isArray(parameters) ? parameters : [parameters])
          .map((parameter: TooltipFormatterParams)=> {
            const [, value] = parameter.data as [TimeStamp, number]
            return <li key={parameter.seriesName}>
              <UI.Badge
                color={parameter.color!.toString()}
                text={<>
                  {`${parameter.seriesName}: `}
                  <b>{`${dataFormatter ? dataFormatter(value) : value}`}</b>
                </>}
              />
            </li>
          })
      }</ul>
    </UI.TooltipWrapper>
  )
}

export const stackedBarTooltipFormatter = (
  dataFormatter?: ((value: unknown) => string | null)
) => (
  parameters: TooltipComponentFormatterCallbackParams
) => {
  const param = parameters as TooltipFormatterParams
  const value = param.value as string[]
  return renderToString(
    <UI.TooltipWrapper>
      <UI.Badge
        color={param.color?.toString()}
        text={dataFormatter ? dataFormatter(value[0]) : value[0]}
      />
    </UI.TooltipWrapper>
  )
}

export const donutChartTooltipFormatter = (
  showTooltipPercentage: boolean,
  dataFormatter?: ((value: unknown) => string | null)
) => (
  parameters: TooltipFormatterParams
) => {
  return renderToString(
    <UI.TooltipWrapper>
      <UI.Badge
        color={parameters.color?.toString()}
        text={<>
          {`${parameters.name}`}<br/>
          <b><span>{`${dataFormatter
            ? dataFormatter(parameters.value): parameters.value}`}</span></b>
          {
            showTooltipPercentage
              ? <span>{` (${Math.round(parameters.percent || 0)}%)`}</span>
              : null
          }
        </>}
      />
    </UI.TooltipWrapper>
  )
}

export type EventParams = {
  // The component name clicked,
  // component type, could be 'series'、'markLine'、'markPoint'、'timeLine', etc..
  componentType: string,
  // series type, could be 'line'、'bar'、'pie', etc.. Works when componentType is 'series'.
  seriesType: string,
  // the index in option.series. Works when componentType is 'series'.
  seriesIndex: number,
  // series name, works when componentType is 'series'.
  seriesName: string,
  // name of data (categories).
  name: string,
  // the index in 'data' array.
  dataIndex: number,
  // incoming raw data item
  data: Object,
  // charts like 'sankey' and 'graph' included nodeData and edgeData as the same time.
  // dataType can be 'node' or 'edge', indicates whether the current click is on node or edge.
  // most of charts have one kind of data, the dataType is meaningless
  dataType: string,
  // incoming data value
  value: number | Array<number|string>,
  // color of the shape, works when componentType is 'series'.
  color: string
}
