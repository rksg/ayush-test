import { ReactNode } from 'react'

import { withKnobs, object }  from '@storybook/addon-knobs'
import { storiesOf }          from '@storybook/react'
import { CallbackDataParams } from 'echarts/types/dist/shared'

import type { BarChartData } from '@acx-ui/analytics/utils'
import { formatter }         from '@acx-ui/utils'

import { cssNumber, cssStr } from '../../theme/helper'
import { Card }              from '../Card'

import { BarChart } from '.'

export const data = (multiseries = false): BarChartData => ({
  dimensions: ['Switch Name', 'PoE Usage', 'Utilisation_per', 'Transmited', 'Received'],
  source: [
    ['Switch 1', 53, 7.3, 309773533136, 109773533136],
    ['Switch 2', 73, 19.3, 409773533136, 179773533136],
    ['Switch 3', 107, 79.11, 509773533136, 219773533136],
    ['Switch 4', 207, 89.11, 709773533136, 309773533136],
    ['Switch 5', 307, 99.11, 809773533136, 509773533136]
  ],
  seriesEncode: multiseries ?
    [
      {
        // Map "tx" to x-axis.
        x: 'Transmited',
        // Map "switch_name" to y-axis.
        y: 'Switch Name',
        // series name
        seriesName: 'Transmited'
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

storiesOf('BarChart', module)
  .addDecorator(withKnobs)
  .add('Single Series - Default', () =>
    wrapInsideCard('Top 5 Switches',
      <BarChart
        style={{ width: '100%', height: '100%' }}
        data={data()}
        barColors={barColors}
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
        labelFormatter={switchTrafficLabelFormatter}
        labelRichStyle={getSwitchTrafficRichStyle()}
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
