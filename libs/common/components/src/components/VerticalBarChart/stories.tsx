import { withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import type { BarChartData } from '@acx-ui/analytics/utils'
import { formatter }         from '@acx-ui/utils'

import { cssStr } from '../../theme/helper'

import { VerticalBarChart } from '.'

export const data: BarChartData = {
  dimensions: ['RSS', 'Samples'],
  source: [
    ['-30', 20],
    ['-35', 25],
    ['-40', 10],
    ['-45', 30],
    ['-50', 42],
    ['-55', 35],
    ['-60', 50],
    ['-65', 73],
    ['-70', 95],
    ['-75', 80],
    ['-80', 1100],
    ['-85', 68],
    ['-90', 53],
    ['-95', 28],
    ['-100', 35],
    ['-105', 15],
    ['-110', 0],
    ['-115', 8]
  ],
  seriesEncode: [
    {
      x: 'RSS',
      y: 'Samples'
    }
  ]
}
const colors: string[] = [
  cssStr('--acx-neutrals-50'),
  cssStr('--acx-neutrals-50'),
  cssStr('--acx-neutrals-50'),
  cssStr('--acx-neutrals-50'),
  cssStr('--acx-neutrals-50'),
  cssStr('--acx-neutrals-50'),
  cssStr('--acx-neutrals-50'),
  cssStr('--acx-neutrals-50'),
  cssStr('--acx-neutrals-50'),
  cssStr('--acx-neutrals-50'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-accents-orange-50')
]

const percentData: BarChartData = {
  dimensions: ['Day', 'Percent'],
  source: [
    ['11', 0.7322],
    ['12', 0.7541],
    ['13', 0.7704],
    ['14', 0.7914],
    ['15', 0],
    ['16', 0.7937],
    ['17', 0.8009]
  ],
  seriesEncode: [
    {
      x: 'Day',
      y: 'Percent'
    }
  ]
}

storiesOf('VerticalBarChart', module)
  .addDecorator(withKnobs)
  .add('Chart View', () =>
    <div style={{ width: 600, height: 280 }}>
      <VerticalBarChart
        style={{ width: '100%', height: '100%' }}
        data={data}
        xAxisName={'(RSS, in dBm)'}
        barColors={colors}
      />
    </div>
  )
  .add('With Formatter', () =>
    <div style={{ width: 324, height: 132 }}>
      <VerticalBarChart
        style={{ width: '100%', height: '100%' }}
        data={percentData}
        dataFormatter={formatter('percentFormat')}
        yAxisProps={{ max: 1, min: 0 }}
        xAxisName={'(Last 7 days)'}
        showTooltipName={false}
      />
    </div>
  )
