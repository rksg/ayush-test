
import { withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import { TimeStamp } from '@acx-ui/types'

import { MultiBarTimeSeriesChart } from '.'

export const getData = () => {
  const base = +new Date(2020, 9, 29)
  const oneDay = 24 * 3600 * 1000
  const data = [[base, Math.random() * 3000]]
  for (let i = 1; i < 37; i++) {
    const value = Math.round((Math.random() - 0.5) * 250 + data[i - 1][1])
    const displayValue = Math.random() > 0.2 ? value : null
    data.push([base + oneDay * i, displayValue as number])
  }
  return data as [TimeStamp, number][]
}
const seriesNames = [
  ['New Clients', 'Impacted Clients', 'Connected Clients']
]
export const getSeriesData = (index = 0) => {
  const series = []
  for (let i = 0; i < 3; i++) {
    series.push({
      key: `series-${index}-${i}`,
      name: seriesNames[index][i],
      data: getData()
    })
  }
  return series
}

storiesOf('MultiBarTimeSeriesChart', module)
  .add('Chart View', () => (
    <MultiBarTimeSeriesChart
      style={{ width: 504, height: 300 }}
      data={[
        {
          key: 'SwitchStatus',
          name: 'switch',
          color: 'green',
          data: [[1673841150, 'SwitchStatus', 1673841160]]
        }
      ]}
      chartBoundary={[1673841000, 1673841190]}
      hasXaxisLabel
    />
  ))
  .add('Zoom enabled', () => (
    <MultiBarTimeSeriesChart
      style={{ width: 504, height: 300 }}
      data={[
        {
          key: 'SwitchStatus',
          name: 'switch',
          color: 'green',
          data: [[1673841150, 'SwitchStatus', 1673841160]]
        }
      ]}
      chartBoundary={[1673841000, 1673841190]}
      hasXaxisLabel
      zoomEnabled
    />
  ))
  .add('With custom tooltip', () => (
    <MultiBarTimeSeriesChart
      style={{ width: 504, height: 300 }}
      data={[
        {
          key: 'SwitchStatus',
          name: 'switch',
          color: 'green',
          data: [[1673841150, 'SwitchStatus', 1673841160]]
        }
      ]}
      chartBoundary={[1673841000, 1673841190]}
      hasXaxisLabel
      zoomEnabled
    />
  ))



