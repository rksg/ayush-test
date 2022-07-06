import React from 'react'

import { storiesOf } from '@storybook/react'

import { Pill } from '.'

storiesOf('Pill', module)
  .add('Negative', () => <Pill value='-123' trend='negative' />)
  .add('Positive', () => <Pill value='123' trend='positive' />)
  .add('No Change', () => <Pill value='0' trend='neutral' />)
  .add('No Trend', () => <Pill value='12' />)

export {}
