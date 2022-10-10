import { ReactNode } from 'react'

import { withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import type { BarChartData } from '@acx-ui/analytics/utils'

import { cssStr } from '../../theme/helper'
import { Card }   from '../Card'

import { DistributionChart } from '.'

export const data: BarChartData = {
  dimensions: ['Rss Distribution', 'Samples'],
  source: [
    ['-30', 0],
    ['-35', 0],
    ['-40', 0],
    ['-45', 0],
    ['-50', 0],
    ['-55', 35],
    ['-60', 50],
    ['-65', 73],
    ['-70', 95],
    ['-75', 120],
    ['-80', 80],
    ['-85', 68],
    ['-90', 53],
    ['-95', 28],
    ['-100', 0],
    ['-105', 0],
    ['-110', 0],
    ['-115', 0]
  ],
  seriesEncode: [
    {
      x: 'Rss Distribution',
      y: 'Samples'
    }
  ]
}

export const barColors = [
  cssStr('--acx-semantics-yellow-40')
]

export const wrapInsideCard = (title: string, children: ReactNode) => (
  <div style={{ width: 496, height: 280 }}>
    <Card title={title}>
      {children}
    </Card>
  </div>)

storiesOf('DistributionChart', module)
  .addDecorator(withKnobs)
  .add('Chart View', () =>
    wrapInsideCard('Rss Distribution',
      <DistributionChart
        style={{ width: '100%', height: '100%' }}
        data={data}
        barColors={barColors}
        grid={{ bottom: '10%', top: '5%' }}
        title={'RSS (in dBm)'}
      />))
