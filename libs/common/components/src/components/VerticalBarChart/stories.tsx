import { ReactNode } from 'react'

import { withKnobs }      from '@storybook/addon-knobs'
import { storiesOf }      from '@storybook/react'
import { renderToString } from 'react-dom/server'

import type { BarChartData } from '@acx-ui/analytics/utils'

import { Card }           from '../Card'
import { TooltipWrapper } from '../Chart/styledComponents'

import { VerticalBarChart } from '.'

import type { TooltipComponentFormatterCallbackParams } from 'echarts'

export const data: BarChartData = {
  dimensions: ['Rss Distribution', 'Samples'],
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
    ['-75', 120],
    ['-80', 80],
    ['-85', 68],
    ['-90', 53],
    ['-95', 28],
    ['-100', 35],
    ['-105', 15],
    ['-110', 27],
    ['-115', 8]
  ],
  seriesEncode: [
    {
      x: 'Rss Distribution',
      y: 'Samples'
    }
  ]
}

export const tooltipFormatter = (params: TooltipComponentFormatterCallbackParams) => {
  const rss = Array.isArray(params)
    && Array.isArray(params[0].data) ? params[0].data[1] : ''
  const name = Array.isArray(params)
    && Array.isArray(params[0].data) && params[0].dimensionNames?.[1]
  return renderToString(
    <TooltipWrapper>
      <div>
        {name}:
        <b> {rss as string}</b>
      </div>
    </TooltipWrapper>
  )
}

export const wrapInsideCard = (title: string, children: ReactNode) => (
  <div style={{ width: 600, height: 280 }}>
    <Card title={title}>
      {children}
    </Card>
  </div>)

const colors: string[] = [
  'yellow',
  'yellow',
  'red',
  'blue',
  'red',
  'blue',
  'red',
  'blue',
  'green',
  'green',
  'green'
]
// if colors array length is less than data, the colors will loop

storiesOf('VerticalBarChart', module)
  .addDecorator(withKnobs)
  .add('Chart View', () =>
    wrapInsideCard('RSS Distribution',
      <VerticalBarChart
        style={{ width: '100%', height: '100%' }}
        data={data}
        grid={{ bottom: '10%', top: '5%' }}
        xAxisName={'RSS (in dBm)'}
        tooltipFormatter={tooltipFormatter}
        barColors={colors}
      />))
