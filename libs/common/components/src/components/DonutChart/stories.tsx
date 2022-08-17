import { withKnobs,object } from '@storybook/addon-knobs'
import { storiesOf }        from '@storybook/react'

import { formatter } from '@acx-ui/utils'

import { cssStr }      from '../../theme/helper'
import { Card }        from '../Card'
import { EventParams } from '../Chart/helper'

import { DonutChart } from '.'

export const data = [
  { value: 213, name: 'Requires Attention', color: cssStr('--acx-semantics-red-50') },
  { value: 322, name: 'Temporarily Degraded', color: cssStr('--acx-semantics-yellow-40') },
  { value: 50, name: 'Operational', color: cssStr('--acx-neutrals-50') },
  { value: 300, name: 'In Setup Phase', color: cssStr('--acx-semantics-green-50') }
]

export const topSwitchModels = [
  { value: 13, name: 'ICX7150-C12P', color: cssStr('--acx-accents-blue-30') },
  { value: 8, name: 'ICX7150-C121P', color: cssStr('--acx-accents-blue-60') },
  { value: 7, name: 'ICX7150-C57P', color: cssStr('--acx-accents-orange-25') },
  { value: 4, name: 'ICX7150-C8', color: cssStr('--acx-accents-orange-50') },
  { value: 2, name: 'ICX7150-C0', color: cssStr('--acx-semantics-yellow-40') }
]

const clickHandler = (params: EventParams) => {
  // eslint-disable-next-line
  console.log('Chart clicked:', params)
}

storiesOf('Donut Chart', module)
  .addDecorator(withKnobs)
  .add('Small Donut', () =>
    <div style={{ width: 238, height: 176 }}>
      <Card title='Venues'>
        <DonutChart
          style={{ width: '100%', height: '100%' }}
          title='Wi-Fi'
          showLegend={true}
          dataFormatter={formatter('countFormat')}
          data={data}/>
      </Card>
    </div>)
  .add('No Data - Small', () =>
    <div style={{ width: 238, height: 176 }}>
      <Card title='Venues'>
        <DonutChart
          style={{ width: '100%', height: '100%' }}
          title='Wi-Fi'
          data={[]}
          onClick={clickHandler}/>
      </Card>
    </div>)
  .add('Small Donut - With Knobs', () =>
    <div style={{ width: 238, height: 176 }}>
      <Card title='Venues'>
        <DonutChart
          style={{ width: '100%', height: '100%' }}
          data={object('data', data)}
          dataFormatter={formatter('countFormat')}/>
      </Card>
    </div>)
  .add('Large Donut with Labels', () =>
    <div style={{ width: 496, height: 278 }}>
      <Card title='Top 5 Switch Models'>
        <DonutChart
          style={{ width: '100%', height: '100%' }}
          title='Models'
          dataFormatter={formatter('countFormat')}
          showLabel={true}
          showTotal={false}
          showLegend={false}
          showTooltipPercentage={true}
          type={'large'}
          data={topSwitchModels}/>
      </Card>
    </div>)
