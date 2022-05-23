import { withKnobs,object } from '@storybook/addon-knobs'
import { storiesOf }        from '@storybook/react'

import { MultiLineTimeSeriesChart } from '.'

const getData = () => {
  const base = +new Date(2020, 9, 29)
  const oneDay = 24 * 3600 * 1000
  const data = [[base, Math.random() * 300]]

  for (let i = 1; i < 37; i++) {
    data.push([base + oneDay * i, Math.round((Math.random()-0.5) * 25 + data[i - 1][1])])
  }
  return data
}

const seriesNames = ['New Clients', 'Impacted Clients', 'Connected Clients']

const getSeriesData = () => {
  const series = []
  for (let i = 0; i < 3; i++) {
    series.push({
      name: seriesNames[i],
      data: getData()
    })
  }
  return series
}

storiesOf('MultiLineTimeSeriesChart', module)
  .addDecorator(withKnobs)
  .add('Chart View', () => <MultiLineTimeSeriesChart
    style={{ width: 504, height: 300 }}
    data={getSeriesData()}/>)
  .add('With Knobs', () =>
    <div style={{ width: 504, height: 278, padding: 10, border: '1px solid lightgray' }}>
      <MultiLineTimeSeriesChart
        style={{ height: 190 }}
        data={object('data', getSeriesData())}
      />
    </div>)
