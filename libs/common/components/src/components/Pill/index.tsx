import React from 'react'

import { useIntl } from 'react-intl'

import type { IncidentSeverities } from '@acx-ui/analytics/utils'
import { intlFormats }             from '@acx-ui/utils'

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
  props: { percent: number, formatter?: (percent: number|undefined) => string }
) {
  const { $t } = useIntl()
  return <UI.Progress
    percent={props.percent}
    strokeWidth={20}
    strokeColor={cssStr('--acx-accents-blue-50')}
    trailColor={cssStr('--acx-neutrals-40')}
    strokeLinecap={'butt'}
    format={
      props.formatter ||
      ((percent) => $t(intlFormats.percentFormat, { value: percent! / 100 }))
    }
  />
}
