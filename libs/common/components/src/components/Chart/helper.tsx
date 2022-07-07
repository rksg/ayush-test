import { TooltipComponentOption } from 'echarts/components'
import { CallbackDataParams }     from 'echarts/types/dist/shared'
import { renderToString }         from 'react-dom/server'

import { TimeStamp } from '@acx-ui/types'
import { formatter } from '@acx-ui/utils'

import { cssStr, cssNumber } from '../../theme/helper'

import * as UI from './styledComponents'

export const gridOptions = () => ({
  left: '0%',
  right: '2%',
  bottom: '0%',
  top: '15%',
  containLabel: true
})

export const legendOptions = () => ({
  icon: 'square',
  right: 15,
  itemWidth: 15,
  itemGap: 15,
  textStyle: {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-neutral-brand-font'),
    fontSize: cssNumber('--acx-body-5-font-size'),
    lineHeight: cssNumber('--acx-body-5-line-height'),
    fontWeight: cssNumber('--acx-body-font-weight')
  }
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
})

export const yAxisOptions = () => ({
  boundaryGap: [0, '10%']
})

export const axisLabelOptions = () => ({
  color: cssStr('--acx-neutrals-50'),
  fontFamily: cssStr('--acx-neutral-brand-font'),
  fontSize: cssNumber('--acx-body-5-font-size'),
  fontWeight: cssNumber('--acx-body-font-weight')
})

export const dateAxisFormatter = () => ({
  // TODO:
  // handle smaller and larger time range
  month: '{MMM}', // Jan, Feb, ...
  day: '{d}' // 1, 2, ...
})

export const tooltipOptions = () => ({
  textStyle: {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-neutral-brand-font'),
    fontSize: cssNumber('--acx-body-5-font-size'),
    lineHeight: cssNumber('--acx-body-5-line-height'),
    fontWeight: cssNumber('--acx-body-font-weight')
  },
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: 2,
  borderWidth: 0,
  padding: 8,
  extraCssText: `box-shadow: 0px 4px 8px ${cssStr('--acx-primary-black')}26;`
})

type Unified<T> = Exclude<T, T[]>
type TooltipFormatterCallback = Exclude<TooltipComponentOption['formatter'], string|undefined>
export type TooltipFormatterParams = Unified<Parameters<TooltipFormatterCallback>[0]>

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
  parameters: any
) => {
  return renderToString(
    <UI.TooltipWrapper>
      <UI.Badge
        color={parameters.color?.toString()}
        text={dataFormatter ? dataFormatter(parameters.value[0]) : parameters.value[0]}
      />
    </UI.TooltipWrapper>
  )
}

export const donutChartTooltipFormatter = (
  dataFormatter?: ((value: unknown) => string | null)
) => (
  parameters: CallbackDataParams
) => {
  return renderToString(
    <UI.TooltipWrapper>
      <UI.Badge
        color={parameters.color?.toString()}
        text={<>
          {`${parameters.name}`}<br/>
          <b><span>{`${dataFormatter
            ? dataFormatter(parameters.value): parameters.value}`}</span></b>
        </>}
      />
    </UI.TooltipWrapper>
  )
}
