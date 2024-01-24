import { storiesOf } from '@storybook/react'

import { wrapInsideCard } from '../BarChart/stories'

import { NoData, NoActiveData, NoActiveContent, NoDataIcon } from '.'

storiesOf('NoData', module)
  .add('NoData', () => wrapInsideCard('Top Switches by Traffic',
    <NoData text='No data to display'/>))
  .add('NoActiveData', () => wrapInsideCard('Top Switches by Traffic',
    <NoActiveData />))
  .add('NoActiveData (large tick)', () => wrapInsideCard('Top Switches by Traffic',
    <NoActiveData
      tickSize='large'
      text={`Your network is already running in an optimal configuration
        and we don’t have any AI Operations to recommend currently.`}
    />))
  .add('NoActiveContent', () => <NoActiveContent />)
  .add('NoDataIcon', () => wrapInsideCard('Top Switches by Traffic',
    <NoDataIcon
      text={`RUCKUS AI cannot analyze your zone(s) due to inadequate licenses.
        Please ensure you have licenses fully applied for zone(s) for
        AI Operations optimizations.`}
    />))
