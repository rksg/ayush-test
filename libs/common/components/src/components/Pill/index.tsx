import React from 'react'

import { Progress } from 'antd'

import type { IncidentSeverities } from '@acx-ui/analytics/utils'

import { cssStr } from '../../theme/helper'

import * as UI from './styledComponents'


export type TrendType = 'none' | 'positive' | 'negative'
export type { IncidentSeverities }

interface TrendPillProps {
  trend: TrendType
  value: string
}
export function TrendPill ({ trend, value }: TrendPillProps) {
  return (
    <UI.Pill type={trend}>{value}</UI.Pill>
  )
}

interface SeverityPillProps {
  severity: IncidentSeverities
}
export function SeverityPill ({ severity }: SeverityPillProps) {
  return (
    <UI.Pill type={severity}>{severity}</UI.Pill>
  )
}

export function ProgressPill (
  props: { percent: number, width?: number, formatter?: (percent: number|undefined) => string }
) {
  return <UI.ProgressPillWrapper width={props.width||100}>
    <Progress
      percent={props.percent}
      strokeWidth={16}
      trailColor={cssStr('--acx-neutrals-50')}
      strokeLinecap={'butt'}
      format={props.formatter||((percent) => `${percent}%`)}
    />
  </UI.ProgressPillWrapper>
}
