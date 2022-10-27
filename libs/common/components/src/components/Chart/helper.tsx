import {
  TooltipComponentFormatterCallbackParams,
  XAXisComponentOption,
  YAXisComponentOption,
  RegisteredSeriesOption,
  TooltipComponentOption
}                                                   from 'echarts'
import { CallbackDataParams, InsideDataZoomOption } from 'echarts/types/dist/shared'
import { FormatXMLElementFn }                       from 'intl-messageformat'
import moment                                       from 'moment-timezone'
import { renderToString }                           from 'react-dom/server'
import {
  MessageDescriptor,
  IntlShape,
  RawIntlProvider,
  FormattedMessage,
  defineMessage
}                                                   from 'react-intl'

import { TimeSeriesChartData } from '@acx-ui/analytics/utils'
import { TimeStamp }           from '@acx-ui/types'
import {
  formatter,
  dateTimeFormats,
  intlFormats,
  getIntl
}                              from '@acx-ui/utils'

import { cssStr, cssNumber } from '../../theme/helper'

import * as UI from './styledComponents'

export type TooltipFormatterParams = Exclude<
  TooltipComponentFormatterCallbackParams,
  Array<unknown>
>

export type ChartFormatterFn = (
  value: unknown,
  tz?: string,
  index?: number
) => string

const defaultRichTextFormatValues: Record<
  string,
  FormatXMLElementFn<React.ReactNode, React.ReactNode>
> = {
  br: () => <br />,
  div: content => <div>{content}</div>,
  span: content => <span>{content}</span>,
  b: content => <b>{content}</b>,
  space: content => <span style={{ marginLeft: 10 }}>{content}</span>
}

export const gridOptions = ({
  disableLegend = false,
  hasXAxisName = false,
  xAxisOffset = 0
} = {}) => ({
  left: 0,
  right: 0,
  bottom: hasXAxisName ? 16 + xAxisOffset : 0,
  top: disableLegend ? 6 : '15%',
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

export const dataZoomOptions = (data: TimeSeriesChartData[]) => [{
  id: 'zoom',
  type: 'inside',
  filterMode: 'none' as InsideDataZoomOption['filterMode'],
  zoomLock: true,
  minValueSpan: Math.max(...data.map(datum =>
    moment.duration(moment(datum.data[1][0])
      .diff(moment(datum.data[0][0])))
      .asMilliseconds()
  ))
}]

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

export const xAxisNameOptions = (name: string) => ({
  name,
  nameGap: 25,
  nameTextStyle: {
    color: cssStr('--acx-neutrals-60'),
    fontFamily: cssStr('--acx-neutral-brand-font'),
    fontSize: cssNumber('--acx-body-5-font-size'),
    lineHeight: cssNumber('--acx-body-5-line-height'),
    fontWeight: cssNumber('--acx-body-font-weight-bold')
  },
  nameLocation: 'middle'
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
  fontSize: cssNumber('--acx-body-4-font-size'),
  lineHeight: cssNumber('--acx-body-4-line-height'),
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

const dateTimeFormatMap: { [key: string]: string } = {
  YYYY: 'yyyy',
  YY: 'yy',
  DD: 'dd',
  D: 'd'
}
const convertDateTimeFormat = (format: string) => format
  .split(/([ :])/)
  .map((part, i, whole) => i % 2
    ? null
    : `{${dateTimeFormatMap[part] || part}}${whole[i + 1] || ''}`)
  .filter(Boolean)
  .join('')
export const dateAxisFormatter = () => {
  return {
    year: convertDateTimeFormat(dateTimeFormats.yearFormat),
    month: convertDateTimeFormat(dateTimeFormats.monthFormat),
    day: convertDateTimeFormat(dateTimeFormats.monthDateFormat),
    hour: convertDateTimeFormat(dateTimeFormats.timeFormat)
  }
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
  extraCssText: 'box-shadow: 0px 4px 8px rgba(51, 51, 51, 0.08); z-index: 4;'
} as TooltipComponentOption)

export const timeSeriesTooltipFormatter = (
  series: TimeSeriesChartData[],
  dataFormatters: { default: ChartFormatterFn } & Record<string, ChartFormatterFn>
) => (
  parameters: TooltipFormatterParams | TooltipFormatterParams[]
) => {
  const intl = getIntl()
  const params = Array.isArray(parameters) ? parameters : [parameters]
  const [ time ] = params[0].data as [TimeStamp, number]
  const dataIndex = params[0].dataIndex

  return renderToString(
    <RawIntlProvider value={intl}>
      <UI.TooltipWrapper>
        <time dateTime={new Date(time).toJSON()}>
          {formatter('dateTimeFormat')(time) as string}
        </time>
        <ul>{
          series.map((data: TimeSeriesChartData)=> {
            const color = params.find(p => p.seriesName === data.name)?.color || ''
            if (!color && data.show !== false) return null

            const formatter = dataFormatters[data.key] || dataFormatters.default
            const [, value] = data.data[dataIndex as number] as [TimeStamp, number | null]
            let text = <FormattedMessage
              defaultMessage='{name}: <b>{value}</b>'
              values={{
                ...defaultRichTextFormatValues,
                name: data.name,
                value: formatter(value, undefined, dataIndex)
              }}
            />
            text = data.show !== false ? <UI.Badge color={(color) as string} text={text} /> : text
            text = <li key={data.name}>{text}</li>
            return text
          })
        }</ul>
      </UI.TooltipWrapper>
    </RawIntlProvider>
  )
}

export const getTimeSeriesSymbol = (data: TimeSeriesChartData[]) =>
  (_: TimeSeriesChartData['data'], params: CallbackDataParams) => {
    const series = data[params.seriesIndex!].data
    if( params.dataIndex - 1 > 0
        && typeof series[(params.dataIndex - 1) as number ][1] !== 'number'
        && params.dataIndex + 1 < series.length
        && typeof series[params.dataIndex + 1][1] !== 'number'){
      return 'circle'
    }
    return 'none'
  }

export const stackedBarTooltipFormatter = (
  dataFormatter?: ((value: unknown) => string | null),
  format?: MessageDescriptor
) => (
  parameters: TooltipComponentFormatterCallbackParams
) => {
  const intl = getIntl()
  const param = parameters as TooltipFormatterParams
  const value = param.value as string[]
  const name = param.seriesName
  const formattedValue = dataFormatter ? dataFormatter(value[0]) : value[0]
  const tooltipFormat = format ?? defineMessage({
    defaultMessage: '{name}<br></br><space><b>{formattedValue}</b></space>',
    description: 'StackedBarChart: default tooltip format for stacked bar chart'
  })
  const text = <FormattedMessage {...tooltipFormat}
    values={{
      ...defaultRichTextFormatValues,
      name,
      formattedValue,
      value: value[0]
    }}
  />

  return renderToString(
    <RawIntlProvider value={intl}>
      <UI.TooltipWrapper>
        <UI.Badge color={param.color?.toString()} text={text} />
      </UI.TooltipWrapper>
    </RawIntlProvider>
  )
}

export const donutChartTooltipFormatter = (
  intl: IntlShape,
  dataFormatter: ((value: unknown) => string | null),
  total: number,
  format?: MessageDescriptor
) => (
  parameters: TooltipFormatterParams
) => {
  const { name, value } = parameters
  let percent = (parameters.percent ?? 0)
  if (percent) percent = percent / 100
  const formattedValue = dataFormatter(parameters.value)
  const formattedTotal = dataFormatter(total)
  const formattedPercent = intl.$t(intlFormats.percentFormat, { value: percent })
  const tooltipFormat = format ?? defineMessage({
    defaultMessage: '{name}<br></br><space><b>{formattedValue}</b></space>',
    description: 'DonutChart: default tooltip format for donut chart'
  })

  const text = <FormattedMessage {...tooltipFormat}
    values={{
      ...defaultRichTextFormatValues,
      name, value, percent, total,
      formattedPercent, formattedValue, formattedTotal
    }}
  />

  return renderToString(
    <RawIntlProvider value={intl}>
      <UI.TooltipWrapper>
        <UI.Badge color={parameters.color?.toString()} text={text} />
      </UI.TooltipWrapper>
    </RawIntlProvider>
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

export const deviceStatusColors = {
  empty: '--acx-neutrals-20',
  connected: '--acx-semantics-green-50',
  initial: '--acx-neutrals-50',
  alerting: '--acx-semantics-yellow-40',
  disconnected: '--acx-semantics-red-50'
}

export const getDeviceConnectionStatusColors = () => [
  cssStr(deviceStatusColors.connected), // Operational
  cssStr(deviceStatusColors.initial), // Setup Phase
  cssStr(deviceStatusColors.alerting), // Transient Issue
  cssStr(deviceStatusColors.disconnected) // Requires Attention
]
