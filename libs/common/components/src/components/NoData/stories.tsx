import { storiesOf } from '@storybook/react'

import { wrapInsideCard } from '../BarChart/stories'

import { NoData } from '.'

storiesOf('NoData', module)
  .add('Default', () => wrapInsideCard('Top 5 Switches by Traffic',
    <NoData text='No data to display'/>))

