import React from 'react'

import { storiesOf } from '@storybook/react'

import { Pill } from '.'

storiesOf('Pill', module)
  .add('Negative Trend', () => <Pill value='-123' trend='negative' />)
  .add('Positive Trend', () => <Pill value='123' trend='positive' />)
  .add('No Trend', () => <Pill value='0' trend='none' />)

export {}
