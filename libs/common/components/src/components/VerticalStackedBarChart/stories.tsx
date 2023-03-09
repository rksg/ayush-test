import { withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import { formatter } from '@acx-ui/formatter'

import { cssStr } from '../../theme/helper'

import { VerticalStackedBarChart } from '.'

export const data = {
  apsTestedCount: 3,
  categories: [ '802.11 Auth', 'Association', 'PSK', 'DHCP', 'DNS', 'Ping', 'Traceroute' ],
  data: [
    { name: 'Pass', data: [ 1, 1, 1, 1, 1, 1, 0], color: cssStr('--acx-semantics-green-50') },
    { name: 'Fail', data: [ 0, 0, 0, 0, 0, 0, 1], color: cssStr('--acx-semantics-red-50') },
    { name: 'Error', data: [ 1, 1, 1, 1, 1, 1, 1], color: cssStr('--acx-semantics-yellow-40') },
    { name: 'N/A', data: [ 0, 0, 0, 0, 0, 0, 0], color: cssStr('--acx-neutrals-50') },
    { name: 'Pending', data: [ 1, 1, 1, 1, 1, 1, 1], color: cssStr('--acx-primary-white') }
  ]
}

storiesOf('VerticalStackedBarChart', module)
  .addDecorator(withKnobs)
  .add('Chart View', () =>
    <div style={{ width: 600, height: 280 }}>
      <VerticalStackedBarChart
        style={{ width: '100%', height: '100%' }}
        data={data.data}
        categories={data.categories}
        dataFormatter={(value)=> formatter('percentFormatRound')(value/data.apsTestedCount)}
      />
    </div>
  )
