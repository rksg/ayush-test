import { storiesOf } from '@storybook/react'

import { ConfigChangeChart } from '.'

const types = ['ap', 'apGroup', 'wlan', 'venue']
const chartBoundary = [1654423052112, 1657015052112]
const sampleData = new Array((chartBoundary[1]-chartBoundary[0])/(12*60*60*1000))
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
      style={{ width: 850 }}
      data={sampleData}
      chartBoundary={chartBoundary}
      onDotClick={(params)=>{
        // eslint-disable-next-line no-console
        console.log(params)
      }}
    />
  ))
