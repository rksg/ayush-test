import { withKnobs,object } from '@storybook/addon-knobs'
import { storiesOf }        from '@storybook/react'

import { cssStr }      from '../../theme/helper'
import { Card }        from '../Card'
import { EventParams } from '../Chart/helper'

import { DonutChart } from '.'

export const data = [
  { value: 35, name: 'Requires Attention', color: cssStr('--acx-semantics-red-60') },
  { value: 40, name: 'Temporarily Degraded', color: cssStr('--acx-semantics-yellow-40') },
  { value: 50, name: 'Operational', color: cssStr('--acx-neutrals-50') },
  { value: 20, name: 'In Setup Phase', color: cssStr('--acx-semantics-green-50') }
]

const clickHandler = (params: EventParams) => {
  // eslint-disable-next-line
  console.log('Chart clicked:', params)
}

storiesOf('Donut Chart', module)
  .addDecorator(withKnobs)
  .add('Chart View', () =>
    <Card title='Venues'>
      <DonutChart
        style={{ width: 172, height: 104 }}
        title='Wi-Fi'
        data={data}/>
    </Card>)
  .add('No Data', () =>
    <Card title='Venues'>
      <DonutChart
        style={{ width: 172, height: 104 }}
        title='Wi-Fi'
        data={[]}
        onClick={clickHandler}/>
    </Card>)
  .add('With Knobs', () =>
    <Card title='Venues'>
      <DonutChart
        style={{ width: 172, height: 104 }}
        data={object('data', data)}/>
    </Card>)
