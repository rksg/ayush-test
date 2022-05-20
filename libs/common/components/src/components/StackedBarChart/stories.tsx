import { withKnobs,object } from '@storybook/addon-knobs'
import { storiesOf }        from '@storybook/react'

import { StackedBarChart } from '.'

const data = [{
  category: 'Infrastructure',
  series: [
    { name: 'P1', value: 0 },
    { name: 'P2', value: 5 },
    { name: 'P3', value: 0 },
    { name: 'P4', value: 0 }
  ]
}, {
  category: 'Performance',
  series: [
    { name: 'P1', value: 0 },
    { name: 'P2', value: 2 },
    { name: 'P3', value: 5 },
    { name: 'P4', value: 0 }
  ]
}, {
  category: 'Connection',
  series: [
    { name: 'P1', value: 2 },
    { name: 'P2', value: 3 },
    { name: 'P3', value: 0 },
    { name: 'P4', value: 7 }
  ]
}]

storiesOf('StackedBarChart', module)
  .addDecorator(withKnobs)
  .add('Chart View', () => <StackedBarChart
    style={{ height: 110, width: 400 }}
    data={data} />)
  .add('With Knobs', () => <StackedBarChart
    style={{ height: 110, width: 250 }}
    data={object('data', data)}
  />)
