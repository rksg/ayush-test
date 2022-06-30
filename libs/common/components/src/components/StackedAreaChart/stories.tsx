import { storiesOf } from '@storybook/react'

import { TimeStamp } from '@acx-ui/types'

import { StackedAreaChart } from '.'

const getData = () => {
  const base = +new Date(2020, 9, 29)
  const oneDay = 24 * 3600 * 1000
  const data = [[base, Math.random() * 300]]

  for (let i = 1; i < 37; i++) {
    data.push([base + oneDay * i, Math.round((Math.random() - 0.5) * 25 + data[i - 1][1])])
  }
  return data as [TimeStamp, number][]
}

export const data = [
  { name: '2.4 GHz', value: getData() },
  { name: '5 GHz', value: getData() }
]

storiesOf('StackedAreaChart', module)
  .add('Chart View', () => <StackedAreaChart data={data} style={{ width: 500 }}/>)
