import { withKnobs,object } from '@storybook/addon-knobs'
import { storiesOf }        from '@storybook/react'

import { DonutChart } from '.'

const data = [
  { value: 35, name: 'Requires Attention' },
  { value: 40, name: 'Temporarily Degraded' },
  { value: 50, name: 'Operational' },
  { value: 20, name: 'In Setup Phase' }
]

storiesOf('Donut Chart', module)
  .addDecorator(withKnobs)
  .add('Chart View', () =>
    <DonutChart
      style={{ width: 172, height: 104 }}
      data={data}
      title='Wi-Fi'/>)
  .add('With Knobs', () => <div
    style={{ width: 208, height: 174, padding: 10, border: '1px solid lightgray' }}>
    <DonutChart style={{ width: '100%', height: 110, marginTop: 15 }}
      data={object('data', data)}
    />
  </div>)
