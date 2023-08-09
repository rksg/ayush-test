import { storiesOf } from '@storybook/react'

import { ConfigChangeChart } from '.'

const types = ['ap', 'apGroup', 'wlan', 'venue']
const chartBoundary = [1654423052112, 1657015052112] as [number, number]
const sampleData = new Array((chartBoundary[1] - chartBoundary[0])/(12 * 60 * 60 * 1000))
  .fill(0).map((_,index)=>({
    id: index,
    timestamp: `${chartBoundary[0] + 12 * 60 * 60 * 1000 * index}`,
    type: types[Math.round((Math.random()*100)%4)],
    name: 'name',
    key: 'key',
    oldValues: [ 'oldValues' ],
    newValues: [ 'newValues' ]
  }))

storiesOf('ConfigChangeChart', module)
  .add('Chart View', () => (
    <ConfigChangeChart
      style={{ width: 1000 }}
      data={sampleData}
      chartBoundary={chartBoundary}
      // eslint-disable-next-line no-console
      onDotClick={(params)=> console.log(params)}
    />
  ))
