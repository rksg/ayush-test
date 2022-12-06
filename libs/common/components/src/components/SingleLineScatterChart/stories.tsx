import { storiesOf } from '@storybook/react'

import { SingleLineScatterChart } from '.'

const types = ['ap']
const chartBoundary = [1654423052112, 1657015052112]
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

storiesOf('SingleLineScatterChart', module)
  .add('Chart View', () => (
    <SingleLineScatterChart
      style={{ width: 850 }}
      data={sampleData}
      chartBoundary={chartBoundary}
      onDotClick={(params)=>{
        // eslint-disable-next-line no-console
        console.log(params)
      }}
    />
  ))
