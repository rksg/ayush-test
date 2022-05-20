import { withKnobs,object } from '@storybook/addon-knobs'
import { storiesOf }        from '@storybook/react'

import { DonutChart } from '.'

const data = [
  { value: 35, name: '350' },
  { value: 40, name: '400' },
  { value: 58, name: '580' }
]

storiesOf('Donut Chart', module)
  .addDecorator(withKnobs)
  .add('Chart View', () => <DonutChart style={{ width: 243, height: 149 }} data={data}/>)
  .add('With Knobs', () => <div
    style={{ width: 208, height: 174, padding: 10, border: '1px solid lightgray' }}>
    <DonutChart style={{ width: '100%', height: 110, marginTop: 15 }}
      data={object('data', data)}
    />
  </div>)
