import { withKnobs,object } from '@storybook/addon-knobs'
import { storiesOf }        from '@storybook/react'

import { formatter } from '@acx-ui/utils'

import { cssStr }      from '../../theme/helper'
import { Card }        from '../Card'
import { EventParams } from '../Chart/helper'

import { DonutChart } from '.'

export const data = [
  { value: 2123, name: 'Requires Attention', color: cssStr('--acx-semantics-red-60') },
  { value: 322, name: 'Temporarily Degraded', color: cssStr('--acx-semantics-yellow-40') },
  { value: 50, name: 'Operational', color: cssStr('--acx-neutrals-50') },
  { value: 30000, name: 'In Setup Phase', color: cssStr('--acx-semantics-green-50') }
]

const clickHandler = (params: EventParams) => {
  // eslint-disable-next-line
  console.log('Chart clicked:', params)
}

storiesOf('Donut Chart', module)
  .addDecorator(withKnobs)
  .add('Chart View', () =>
    <div style={{ width: 238, height: 176 }}>
      <Card title='Venues'>
        <DonutChart
          style={{ width: '100%', height: 'auto' }}
          title='Wi-Fi'
          dataFormatter={formatter('countFormat') as (value: unknown) => string | null}
          data={data}/>
      </Card>
    </div>)
  .add('With subTitle', () =>
    <div style={{ width: 238, height: 211 }}>
      <Card title='Venues'>
        <DonutChart
          showLegend={false}
          style={{ width: '100%', height: 'auto' }}
          title='Wi-Fi'
          subTitle={'SubTitle comes here..............................'}
          unit='device'
          dataFormatter={formatter('countFormat') as (value: unknown) => string | null}
          data={data}/>
      </Card>
    </div>)
  .add('No Data', () =>
    <div style={{ width: 238, height: 176 }}>
      <Card title='Venues'>
        <DonutChart
          style={{ width: '100%', height: 'auto' }}
          title='Wi-Fi'
          data={[]}
          onClick={clickHandler}/>
      </Card>
    </div>)
  .add('With Knobs', () =>
    <div style={{ width: 238, height: 176 }}>
      <Card title='Venues'>
        <DonutChart
          style={{ width: '100%', height: 'auto' }}
          data={object('data', data)}
          dataFormatter={formatter('countFormat') as (value: unknown) => string | null}/>
      </Card>
    </div>)
