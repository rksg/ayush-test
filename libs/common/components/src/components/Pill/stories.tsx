import React from 'react'

import { storiesOf } from '@storybook/react'

import { TrendPill, SeverityPill, ProgressPill } from '.'

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
  .add('Progress', () => {
    const formatter = (percent: number|undefined) => `${percent}% success`
    return <>
      <p><ProgressPill percent={0}/></p>
      <p><ProgressPill percent={33.33}/></p>
      <p><ProgressPill percent={50.00}/></p>
      <p><ProgressPill percent={66.6600}/></p>
      <p><ProgressPill percent={100}/></p>
      <p><ProgressPill percent={150}/></p>
      <p><ProgressPill percent={0} width={200} formatter={formatter}/></p>
      <p><ProgressPill percent={50} width={200} formatter={formatter}/></p>
      <p><ProgressPill percent={100} width={200} formatter={formatter}/></p>
    </>
  })

export {}
