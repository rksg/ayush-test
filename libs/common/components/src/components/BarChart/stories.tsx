import { ReactNode } from 'react'

import { withKnobs, object }                       from '@storybook/addon-knobs'
import { storiesOf }                               from '@storybook/react'
import { TooltipComponentFormatterCallbackParams } from 'echarts'
import { CallbackDataParams }                      from 'echarts/types/dist/shared'
import { renderToString }                          from 'react-dom/server'

import type { BarChartData } from '@acx-ui/analytics/utils'
import { formatter }         from '@acx-ui/utils'

import { cssNumber, cssStr } from '../../theme/helper'
import { Card }              from '../Card'
import { EventParams }       from '../Chart'
import { TooltipWrapper }    from '../Chart/styledComponents'

import { BarChart } from '.'


export const data = (multiseries = false): BarChartData => ({
  dimensions: ['Switch Name', 'PoE Usage', 'Utilisation_per', 'Transmitted', 'Received', 'Mac'],
  source: [
    ['Switch 1', 53, 7.3, 309773533136, 109773533136, 'C0:C5:20:AA:33:1B'],
    ['Switch 2', 73, 19.3, 409773533136, 179773533136, 'D4:C1:9E:84:59:4A'],
    ['Switch 3', 107, 79.11, 509773533136, 219773533136, 'C0:C5:20:AA:32:31'],
    ['Switch 4', 207, 89.11, 709773533136, 309773533136, 'D4:C1:9E:14:68:0D'],
    ['Switch 5', 307, 99.11, 809773533136, 509773533136, 'C0:C5:20:AA:32:C1']
  ],
  seriesEncode: multiseries ?
    [
      {
        // Map "tx" to x-axis.
        x: 'Transmitted',
        // Map "switch_name" to y-axis.
        y: 'Switch Name',
        // series name
        seriesName: 'Transmitted'
      },
      {
        // Map "rx" to x-axis.
        x: 'Received',
        // Map "switch_name" to y-axis.
        y: 'Switch Name',
        // series name
        seriesName: 'Received'
      }
    ] :
    [
      {
        // Map "poe_usage" to x-axis.
        x: 'PoE Usage',
        // Map "switch_name" to y-axis.
        y: 'Switch Name'
      }
    ]

})

export const barColors = [
  cssStr('--acx-semantics-yellow-40'),
  cssStr('--acx-accents-orange-25'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-accents-blue-40'),
  cssStr('--acx-accents-blue-50')
]

function switchUsageLabelFormatter (params: CallbackDataParams): string {
  const usage = Array.isArray(params.data) ? params.data[1] : params.data
  const utilisation_per = Array.isArray(params.data) ? params.data[2] : params.data
  return '{poe_usage|' +
    formatter('milliWattsFormat')(usage) + '} {utilisationPer|(' +
    utilisation_per + '%)}'
}

function switchTrafficLabelFormatter (params: CallbackDataParams): string {
  const usage = Array.isArray(params.data) ? params.data[params?.encode?.['x'][0]!] : params.data
  return '{traffic|' +formatter('bytesFormat')(usage) + '}'
}

export const tooltipFormatter = (params: TooltipComponentFormatterCallbackParams) => {
  const name = Array.isArray(params) && Array.isArray(params[0].data) ? params[0].data[0] : ''
  const mac = Array.isArray(params) && Array.isArray(params[0].data) ? params[0].data[5] : ''
  return renderToString(
    <TooltipWrapper>
      <div> 
        {name as string}
        <b> ({mac as string})</b> 
      </div>
    </TooltipWrapper>
  )
}

const getSwitchUsageRichStyle = () => ({
  poe_usage: {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-neutral-brand-font'),
    fontSize: cssNumber('--acx-subtitle-5-font-size'),
    lineHeight: cssNumber('--acx-subtitle-5-line-height'),
    fontWeight: cssNumber('--acx-subtitle-5-font-weight')
  },
  utilisationPer: {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-neutral-brand-font'),
    fontSize: cssNumber('--acx-body-5-font-size'),
    lineHeight: cssNumber('--acx-body-5-line-height'),
    fontWeight: cssNumber('--acx-body-5-font-weight')
  }
})

const getSwitchTrafficRichStyle = () => ({
  traffic: {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-neutral-brand-font'),
    fontSize: cssNumber('--acx-body-5-font-size'),
    lineHeight: cssNumber('--acx-body-5-line-height'),
    fontWeight: cssNumber('--acx-body-5-font-weight')
  }
})

export const wrapInsideCard = (title: string, children: ReactNode) => (
  <div style={{ width: 496, height: 280 }}>
    <Card title={title}>
      {children}
    </Card>
  </div>)

const clickHandler = (params: EventParams) => {
  // eslint-disable-next-line
  console.log('Chart clicked:', params)
}

storiesOf('BarChart', module)
  .addDecorator(withKnobs)
  .add('Single Series - Default', () =>
    wrapInsideCard('Top 5 Switches',
      <BarChart
        style={{ width: '100%', height: '100%' }}
        data={data()}
        barColors={barColors}
        onClick={clickHandler}
      />))
  .add('Single Series - Custom formatter', () =>
    wrapInsideCard('Top 5 Switches by PoE Usage',
      <BarChart
        style={{ width: '100%', height: '100%' }}
        data={data()}
        grid={{ right: '15%' }}
        barColors={barColors}
        labelFormatter={switchUsageLabelFormatter}
        labelRichStyle={getSwitchUsageRichStyle()}
      />))
  .add('Multi Series', () =>
    wrapInsideCard('Top 5 Switches by Traffic',
      <BarChart
        style={{ width: '100%', height: '100%' }}
        data={data(true)}
        barWidth={8}
        barColors={[
          cssStr('--acx-accents-blue-50'),
          cssStr('--acx-accents-orange-30')
        ]}
        tooltipFormatter={tooltipFormatter}
        labelFormatter={switchTrafficLabelFormatter}
        labelRichStyle={getSwitchTrafficRichStyle()}
        onClick={clickHandler}
      />))
  .add('With Knobs', () =>
    wrapInsideCard('Top 5 Switches by PoE Usage',
      <BarChart
        style={{ width: '100%', height: '100%' }}
        data={object('data', data())}
        barWidth={12}
        grid={{ right: '15%' }}
        barColors={barColors}
        labelFormatter={switchUsageLabelFormatter}
        labelRichStyle={getSwitchUsageRichStyle()}
      />))
