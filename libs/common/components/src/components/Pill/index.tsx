import React from 'react'

import { useIntl } from 'react-intl'

import type { IncidentSeverities, TrendTypeEnum } from '@acx-ui/analytics/utils'
import { intlFormats }                            from '@acx-ui/formatter'

import { cssStr } from '../../theme/helper'

import * as UI from './styledComponents'

export type { IncidentSeverities }

interface TrendPillProps {
  trend: TrendTypeEnum
  value: string
}
export const TrendPill = React.forwardRef((
  { trend, value, ...rest }: TrendPillProps,
  ref: React.ForwardedRef<HTMLSpanElement>
) => {
  return (
    <UI.Pill type={trend} {...rest} ref={ref}>{value}</UI.Pill>
  )
})

interface SeverityPillProps {
  severity: IncidentSeverities
}
export function SeverityPill ({ severity }: SeverityPillProps) {
  return (
    <UI.Pill type={severity}>{severity}</UI.Pill>
  )
}

interface ColorPillProps {
  color: string
  value: string
}
export function ColorPill ({ color, value }: ColorPillProps) {
  return (
    <UI.Pill type='color' color={color}>{value}</UI.Pill>
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
