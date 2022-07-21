import { withKnobs, object }  from '@storybook/addon-knobs'
import { storiesOf }          from '@storybook/react'
import { CallbackDataParams } from 'echarts/types/dist/shared'

import { cssNumber, cssStr } from '../../theme/helper'

import { BarChart, BarChartData } from '.'

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


const barColors = [
  cssStr('--acx-semantics-yellow-40'),
  cssStr('--acx-accents-orange-25'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-accents-blue-40'),
  cssStr('--acx-accents-blue-50')
]


//Todo: formatter helper functions
const watts = [' mW', ' W', ' kW', ' MW', ' GW', ' TW', ' PW']
const bytes = [' B', ' kB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB']
const shorten = (value: number) => {
  return parseFloat(value.toPrecision(4)).toString()
}
const numberFormat = (base: number, units: string[], value: number)
  : string | null => {
  for (let a = 1; a <= units.length; a++) {
    const lowest = value / Math.pow(base, a - 1)
    if (Math.abs(lowest) < base) {
      return shorten(lowest) + units[a - 1]
    }
  }
  return null
}

function switchUsageLabelFormatter (params: CallbackDataParams): string {
  const usage = Array.isArray(params.data) ? params.data[1] : params.data
  const utilisation_per = Array.isArray(params.data) ? params.data[2] : params.data
  return '{poe_usage|' +
    numberFormat(1000, watts, usage as unknown as number) + '\n}{utilisationPer|' +
    utilisation_per + '%}'
}

function switchTrafficLabelFormatter (params: CallbackDataParams): string {
  const usage = Array.isArray(params.data) ? params.data[params?.encode?.['x'][0]!] : params.data
  return '{traffic|' +
    numberFormat(1024, bytes, usage as unknown as number) + '}'
}


const getSwitchUsageRichStyle = () => ({
  poe_usage: {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-neutral-brand-font'),
    fontSize: cssNumber('--acx-body-4-font-size'),
    lineHeight: cssNumber('--acx-body-4-line-height'),
    fontWeight: cssNumber('--acx-body-font-weight-bold')
  },
  utilisationPer: {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-neutral-brand-font'),
    fontSize: cssNumber('--acx-body-5-font-size'),
    lineHeight: cssNumber('--acx-body-4-line-height'),
    fontWeight: cssNumber('--acx-body-font-weight')
  }
})

const getSwitchTrafficRichStyle = () => ({
  traffic: {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-neutral-brand-font'),
    fontSize: cssNumber('--acx-body-4-font-size'),
    lineHeight: cssNumber('--acx-body-4-line-height'),
    fontWeight: cssNumber('--acx-body-font-weight')
  }
})


storiesOf('BarChart', module)
  .addDecorator(withKnobs)
  .add('Single Series - Default', () => <BarChart
    style={{ width: 524, height: 174 }}
    data={data()}
    barColors={barColors}
  />)
  //
  .add('Single Series - Custom formatter', () => <BarChart
    style={{ width: 524, height: 174 }}
    labelFormatter={switchUsageLabelFormatter}
    labelRichStyle={getSwitchUsageRichStyle()}
    data={data()}
    barColors={barColors}
  />)
  .add('Multi Series', () => <BarChart
    style={{ width: 524, height: 174 }}
    labelFormatter={switchTrafficLabelFormatter}
    labelRichStyle={getSwitchTrafficRichStyle()}
    data={data(true)}
    barWidth={10}
    barColors={[
      cssStr('--acx-accents-blue-50'),
      cssStr('--acx-accents-orange-30')
    ]}
  />)
  .add('With Knobs', () =>
    <BarChart
      style={{ width: 524, height: 150 }}
      labelFormatter={switchUsageLabelFormatter}
      labelRichStyle={getSwitchUsageRichStyle()}
      data={object('data', data())}
      barWidth={12}
      barColors={barColors}
    />)