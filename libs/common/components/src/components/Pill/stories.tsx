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
      <p style={{ width: '100px' }}><ProgressPill percent={0}/></p>
      <p style={{ width: '100px' }}><ProgressPill percent={33.33}/></p>
      <p style={{ width: '100px' }}><ProgressPill percent={50.00}/></p>
      <p style={{ width: '100px' }}><ProgressPill percent={66.6600}/></p>
      <p style={{ width: '100px' }}><ProgressPill percent={100}/></p>
      <p style={{ width: '100px' }}><ProgressPill percent={150}/></p>
      <p style={{ width: '100px' }}><ProgressPill percent={0} formatter={formatter}/></p>
      <p style={{ width: '100px' }}><ProgressPill percent={50} formatter={formatter}/></p>
      <p style={{ width: '100px' }}><ProgressPill percent={100} formatter={formatter}/></p>
    </>
  })

export {}
