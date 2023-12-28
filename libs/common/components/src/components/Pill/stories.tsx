import React from 'react'

import { storiesOf } from '@storybook/react'

import { TrendTypeEnum } from '@acx-ui/analytics/utils'

import { TrendPill, SeverityPill, ColorPill, ProgressPill } from '.'

storiesOf('Pill', module)
  .add('Trend', () => <>
    <p><TrendPill value='-123' trend={TrendTypeEnum.Negative} /></p>
    <p><TrendPill value='123' trend={TrendTypeEnum.Positive} /></p>
    <p><TrendPill value='0' trend={TrendTypeEnum.None} /></p>
  </>)
  .add('Severity', () => <>
    <p><SeverityPill severity='P1' /></p>
    <p><SeverityPill severity='P2' /></p>
    <p><SeverityPill severity='P3' /></p>
    <p><SeverityPill severity='P4' /></p>
  </>)
  .add('Color', () => <>
    <p><ColorPill color='red' value='Red' /></p>
    <p><ColorPill color='blue' value='Blue' /></p>
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
