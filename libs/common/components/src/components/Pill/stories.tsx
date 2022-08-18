import React from 'react'

import { storiesOf } from '@storybook/react'

import { TrendPill, SeverityPill } from '.'

storiesOf('Pill', module)
  .add('Trend', () => <>
    <p><TrendPill value='-123' trend='negative' /></p>
    <p><TrendPill value='123' trend='positive' /></p>
    <p><TrendPill value='0' trend='none' /></p>
  </>)
  .add('Severity', () => <>
    <p><SeverityPill severity='P1' /></p>
    <p><SeverityPill severity='P2' /></p>
    <p><SeverityPill severity='P3' /></p>
    <p><SeverityPill severity='P4' /></p>
  </>)

export {}
