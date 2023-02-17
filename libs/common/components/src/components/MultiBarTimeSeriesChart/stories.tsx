import { storiesOf } from '@storybook/react'

import { TimeStamp } from '@acx-ui/types'

import { MultiBarTimeSeriesChart } from '.'

export const getData = () => {
  const base = +new Date(2020, 9, 29)
  const oneDay = 24 * 3600 * 1000
  const data = [[base, 'SwitchStatus', base + Math.round(Math.random()) * 100000000]]
  for (let i = 1; i < 37; i++) {
    data.push([
      base + oneDay * i,
      'SwitchStatus',
      base + oneDay * i + Math.round(Math.random()) * 100000000,
      1,
      '#23AB36'
    ])
  }
  return data as [TimeStamp, string, TimeStamp, number | null, string][]
}
const seriesNames = [['New Clients', 'Impacted Clients', 'Connected Clients']]
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
    <div style={{ width: 480, height: 250, padding: 100 }}>
      <MultiBarTimeSeriesChart
        style={{ width: 504, height: 300 }}
        data={[
          {
            key: 'SwitchStatus',
            name: 'switch',
            color: '#23AB36',
            data: getData()
          }
        ]}
        chartBoundary={[1595829463000, 1609048663000]}
        hasXaxisLabel
      />
    </div>
  ))
  .add('Zoom enabled', () => (
    <div style={{ width: 480, height: 250, padding: 100 }}>
      <MultiBarTimeSeriesChart
        style={{ width: 504, height: 300 }}
        data={[
          {
            key: 'SwitchStatus',
            name: 'switch',
            color: '#23AB36',
            data: getData()
          }
        ]}
        chartBoundary={[1595829463000, 1609048663000]}
        hasXaxisLabel
        zoomEnabled
      />
    </div>
  ))
